/**
 * 🎲 Board Mate - Tipos de la Aplicación
 *
 * Re-exporta los tipos generados por Prisma y define tipos adicionales.
 */

// Re-exportar tipos de Prisma
export type { Profile, Template, Game, Player, Move } from "@prisma/client";

// Importar tipos de Prisma para usar en tipos compuestos
import type { Profile, Template, Game, Player, Move } from "@prisma/client";

// =============================================
// 🎮 Tipos para Crear Partida
// =============================================

export interface CreatePlayerInput {
  name: string;
  color: string;
}

export interface CreateGameInput {
  templateId: string;
  players: CreatePlayerInput[];
}

// =============================================
// 📊 Tipos con Relaciones (para queries con include)
// =============================================

export interface GameWithPlayers extends Game {
  players: Player[];
}

export interface GameWithRelations extends Game {
  creator: Profile;
  template: Template;
  players: PlayerWithMoves[];
  winner: Player | null;
}

export interface PlayerWithMoves extends Player {
  moves: Move[];
}

export interface PlayerWithGame extends Player {
  game: Game;
}

// =============================================
// 📝 Tipos para Movimientos
// =============================================

export interface AddMoveInput {
  playerId: string;
  pointsChange: number;
  reason: string;
}

// =============================================
// 🏷️ Tipos para Plantillas
// =============================================

export interface ScoringField {
  id: string;
  name: string;
  type: "number" | "increment" | "calculated";
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  formula?: string;
}

export interface ScoringCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  fields: ScoringField[];
}

export interface ScoringSchema {
  version: string;
  categories: ScoringCategory[];
}

// =============================================
// 🎨 Colores para Jugadores
// =============================================

export const PLAYER_COLORS = [
  "#EF4444", // Rojo
  "#3B82F6", // Azul
  "#22C55E", // Verde
  "#F59E0B", // Amarillo
  "#8B5CF6", // Púrpura
  "#EC4899", // Rosa
  "#06B6D4", // Cyan
  "#F97316", // Naranja
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

// =============================================
// ✅ Tipos de Respuesta para Server Actions
// =============================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
