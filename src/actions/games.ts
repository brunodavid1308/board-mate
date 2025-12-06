"use server";

import { prisma } from "@/lib/prisma";
import type {
  CreateGameInput,
  GameWithPlayers,
  GameWithRelations,
  ActionResult,
} from "@/lib/types";

// =============================================
// 🎮 Filtros para obtener partidas
// =============================================

export interface GetGamesFilter {
  creatorId?: string;
  isFinished?: boolean;
}

// =============================================
// 2.1: CREAR PARTIDA
// =============================================

/**
 * 🎮 Crear una nueva partida con jugadores
 *
 * Crea una partida y sus jugadores en una única operación transaccional.
 *
 * @param creatorId - ID del usuario que crea la partida (de auth.users)
 * @param input - Datos de la partida (templateId y jugadores)
 * @returns La partida creada con sus jugadores
 */
export async function createGame(
  creatorId: string,
  input: CreateGameInput
): Promise<ActionResult<GameWithPlayers>> {
  try {
    // Validaciones
    if (!input.templateId) {
      return {
        success: false,
        error: "Se requiere una plantilla de puntuación",
      };
    }

    if (!input.players || input.players.length < 2) {
      return { success: false, error: "Se requieren al menos 2 jugadores" };
    }

    if (input.players.length > 8) {
      return { success: false, error: "Máximo 8 jugadores permitidos" };
    }

    // Verificar que la plantilla existe
    const template = await prisma.template.findUnique({
      where: { id: input.templateId },
    });

    if (!template) {
      return { success: false, error: "La plantilla seleccionada no existe" };
    }

    // Crear partida con jugadores en una transacción
    const game = await prisma.game.create({
      data: {
        creatorId,
        templateId: input.templateId,
        players: {
          create: input.players.map((player) => ({
            name: player.name,
            color: player.color,
            totalScore: 0,
          })),
        },
      },
      include: {
        players: true,
      },
    });

    return { success: true, data: game };
  } catch (error) {
    console.error("Error creating game:", error);
    return {
      success: false,
      error: "Error al crear la partida. Por favor, intenta de nuevo.",
    };
  }
}

/**
 * 📋 Obtener una partida por ID con todas sus relaciones
 *
 * @param gameId - ID de la partida
 * @returns La partida con creador, plantilla, jugadores y movimientos
 */
export async function getGame(
  gameId: string
): Promise<ActionResult<GameWithRelations>> {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        creator: true,
        template: true,
        winner: true,
        players: {
          include: {
            moves: {
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { totalScore: "desc" },
        },
      },
    });

    if (!game) {
      return { success: false, error: "Partida no encontrada" };
    }

    return { success: true, data: game };
  } catch (error) {
    console.error("Error fetching game:", error);
    return {
      success: false,
      error: "Error al obtener la partida",
    };
  }
}

// =============================================
// 2.3: OBTENER PARTIDAS (con filtros)
// =============================================

/**
 * 📜 Obtener lista de partidas con filtros opcionales
 *
 * @param filter - Filtros opcionales (creatorId, isFinished)
 * @returns Lista de partidas con información básica
 */
export async function getGames(
  filter?: GetGamesFilter
): Promise<ActionResult<GameWithPlayers[]>> {
  try {
    const games = await prisma.game.findMany({
      where: {
        ...(filter?.creatorId && { creatorId: filter.creatorId }),
        ...(filter?.isFinished !== undefined && {
          isFinished: filter.isFinished,
        }),
      },
      include: {
        players: true,
        template: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: games };
  } catch (error) {
    console.error("Error fetching games:", error);
    return {
      success: false,
      error: "Error al obtener las partidas",
    };
  }
}

/**
 * 📜 Obtener lista de partidas de un usuario
 *
 * @param creatorId - ID del usuario creador
 * @returns Lista de partidas con información básica
 */
export async function getGamesByCreator(
  creatorId: string
): Promise<ActionResult<GameWithPlayers[]>> {
  return getGames({ creatorId });
}

/**
 * 🎯 Obtener partidas activas (no finalizadas)
 *
 * @param creatorId - ID del usuario creador (opcional)
 * @returns Lista de partidas activas
 */
export async function getActiveGames(
  creatorId?: string
): Promise<ActionResult<GameWithPlayers[]>> {
  return getGames({
    ...(creatorId && { creatorId }),
    isFinished: false,
  });
}

/**
 * 🏆 Obtener partidas finalizadas
 *
 * @param creatorId - ID del usuario creador (opcional)
 * @returns Lista de partidas finalizadas
 */
export async function getFinishedGames(
  creatorId?: string
): Promise<ActionResult<GameWithPlayers[]>> {
  return getGames({
    ...(creatorId && { creatorId }),
    isFinished: true,
  });
}

/**
 * 🏆 Finalizar partida y establecer ganador
 *
 * @param gameId - ID de la partida
 * @param winnerId - ID del jugador ganador (opcional, se calcula automáticamente si no se proporciona)
 * @returns La partida actualizada
 */
export async function finishGame(
  gameId: string,
  winnerId?: string
): Promise<ActionResult<GameWithPlayers>> {
  try {
    // Si no se proporciona winnerId, determinar el ganador por puntuación
    let finalWinnerId = winnerId;

    if (!finalWinnerId) {
      const players = await prisma.player.findMany({
        where: { gameId },
        orderBy: { totalScore: "desc" },
        take: 1,
      });

      if (players.length > 0) {
        finalWinnerId = players[0].id;
      }
    } else {
      // Verificar que el jugador pertenece a esta partida
      const player = await prisma.player.findFirst({
        where: {
          id: winnerId,
          gameId: gameId,
        },
      });

      if (!player) {
        return {
          success: false,
          error: "El jugador no pertenece a esta partida",
        };
      }
    }

    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        isFinished: true,
        winnerId: finalWinnerId,
      },
      include: {
        players: {
          orderBy: { totalScore: "desc" },
        },
      },
    });

    return { success: true, data: game };
  } catch (error) {
    console.error("Error finishing game:", error);
    return {
      success: false,
      error: "Error al finalizar la partida",
    };
  }
}

/**
 * 🗑️ Eliminar una partida
 *
 * Elimina la partida y todos sus jugadores/movimientos (cascade).
 *
 * @param gameId - ID de la partida a eliminar
 * @param creatorId - ID del usuario (para verificar permisos)
 */
export async function deleteGame(
  gameId: string,
  creatorId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    // Verificar que el usuario es el creador
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { creatorId: true },
    });

    if (!game) {
      return { success: false, error: "Partida no encontrada" };
    }

    if (game.creatorId !== creatorId) {
      return {
        success: false,
        error: "No tienes permiso para eliminar esta partida",
      };
    }

    await prisma.game.delete({
      where: { id: gameId },
    });

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("Error deleting game:", error);
    return {
      success: false,
      error: "Error al eliminar la partida",
    };
  }
}

