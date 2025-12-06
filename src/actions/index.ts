/**
 * 🎲 Board Mate - Server Actions
 *
 * Re-exporta todas las Server Actions para facilitar las importaciones.
 *
 * Uso:
 * import { createGame, addMove, getPublicTemplates } from '@/actions'
 */

// =============================================
// 🎮 Games - Partidas
// =============================================
export {
  // 2.1: Crear Partida
  createGame,
  // 2.3: Obtener Partidas
  getGame,
  getGames,
  getGamesByCreator,
  getActiveGames,
  getFinishedGames,
  // Otras operaciones
  finishGame,
  deleteGame,
} from "./games";

export type { GetGamesFilter } from "./games";

// =============================================
// 🎲 Players - Jugadores y Movimientos
// =============================================
export {
  // 2.2: Registrar Movimiento
  addMove,
  undoLastMove,
  // Consultas
  getPlayerWithMoves,
  updatePlayerName,
} from "./players";

// =============================================
// 🏷️ Templates - Plantillas
// =============================================
export {
  // 2.4: Obtener Plantillas
  getPublicTemplates,
  getTemplate,
  createTemplate,
  seedBasicTemplate,
} from "./templates";

