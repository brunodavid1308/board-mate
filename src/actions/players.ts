"use server";

import { prisma } from "@/lib/prisma";
import type { AddMoveInput, PlayerWithMoves, ActionResult } from "@/lib/types";
import type { Move, Player } from "@prisma/client";

// =============================================
// 2.2: REGISTRAR MOVIMIENTO
// =============================================

/**
 * ➕ Añadir puntos a un jugador (Registrar Movimiento)
 *
 * Crea un movimiento en el historial y actualiza el total_score del jugador
 * en una única operación transaccional.
 *
 * @param input - Datos del movimiento (playerId, pointsChange, reason)
 * @returns El movimiento creado y el jugador actualizado
 */
export async function addMove(
  input: AddMoveInput
): Promise<ActionResult<{ move: Move; player: Player }>> {
  try {
    // Validaciones
    if (!input.playerId) {
      return { success: false, error: "Se requiere el ID del jugador" };
    }

    if (input.pointsChange === 0) {
      return { success: false, error: "El cambio de puntos no puede ser 0" };
    }

    if (!input.reason || input.reason.trim() === "") {
      return {
        success: false,
        error: "Se requiere una razón para el movimiento",
      };
    }

    // Verificar que el jugador existe y la partida no está finalizada
    const player = await prisma.player.findUnique({
      where: { id: input.playerId },
      include: { game: true },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado" };
    }

    if (player.game.isFinished) {
      return {
        success: false,
        error: "No se pueden añadir puntos a una partida finalizada",
      };
    }

    // Crear movimiento y actualizar puntuación en una transacción
    const [move, updatedPlayer] = await prisma.$transaction([
      prisma.move.create({
        data: {
          playerId: input.playerId,
          pointsChange: input.pointsChange,
          reason: input.reason.trim(),
        },
      }),
      prisma.player.update({
        where: { id: input.playerId },
        data: {
          totalScore: {
            increment: input.pointsChange,
          },
        },
      }),
    ]);

    return { success: true, data: { move, player: updatedPlayer } };
  } catch (error) {
    console.error("Error adding move:", error);
    return {
      success: false,
      error: "Error al añadir puntos",
    };
  }
}

/**
 * ↩️ Deshacer último movimiento de un jugador
 *
 * Elimina el último movimiento y revierte la puntuación.
 *
 * @param playerId - ID del jugador
 * @returns El movimiento eliminado y el jugador actualizado
 */
export async function undoLastMove(
  playerId: string
): Promise<ActionResult<{ move: Move; player: Player }>> {
  try {
    // Obtener el último movimiento del jugador
    const lastMove = await prisma.move.findFirst({
      where: { playerId },
      orderBy: { createdAt: "desc" },
      include: { player: { include: { game: true } } },
    });

    if (!lastMove) {
      return { success: false, error: "No hay movimientos para deshacer" };
    }

    if (lastMove.player.game.isFinished) {
      return {
        success: false,
        error: "No se puede deshacer en una partida finalizada",
      };
    }

    // Eliminar movimiento y revertir puntuación en una transacción
    const [, updatedPlayer] = await prisma.$transaction([
      prisma.move.delete({
        where: { id: lastMove.id },
      }),
      prisma.player.update({
        where: { id: playerId },
        data: {
          totalScore: {
            decrement: lastMove.pointsChange,
          },
        },
      }),
    ]);

    return { success: true, data: { move: lastMove, player: updatedPlayer } };
  } catch (error) {
    console.error("Error undoing move:", error);
    return {
      success: false,
      error: "Error al deshacer el movimiento",
    };
  }
}

/**
 * 📊 Obtener jugador con historial de movimientos
 *
 * @param playerId - ID del jugador
 * @returns El jugador con todos sus movimientos
 */
export async function getPlayerWithMoves(
  playerId: string
): Promise<ActionResult<PlayerWithMoves>> {
  try {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        moves: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado" };
    }

    return { success: true, data: player };
  } catch (error) {
    console.error("Error fetching player:", error);
    return {
      success: false,
      error: "Error al obtener el jugador",
    };
  }
}

/**
 * ✏️ Actualizar nombre de un jugador
 *
 * @param playerId - ID del jugador
 * @param name - Nuevo nombre
 */
export async function updatePlayerName(
  playerId: string,
  name: string
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    if (!name || name.trim() === "") {
      return { success: false, error: "El nombre no puede estar vacío" };
    }

    await prisma.player.update({
      where: { id: playerId },
      data: { name: name.trim() },
    });

    return { success: true, data: { updated: true } };
  } catch (error) {
    console.error("Error updating player name:", error);
    return {
      success: false,
      error: "Error al actualizar el nombre",
    };
  }
}

