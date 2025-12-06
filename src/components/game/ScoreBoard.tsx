"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerCard } from "./PlayerCard";
import { GameLog } from "./GameLog";
import { getGame, finishGame } from "@/actions";
import { supabase } from "@/lib/supabase";
import type {
  GameWithRelations,
  PlayerWithMoves,
  Move,
  Player,
} from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Trophy, ArrowLeft, Flag, Users } from "lucide-react";

interface ScoreBoardProps {
  gameId: string;
}

export function ScoreBoard({ gameId }: ScoreBoardProps) {
  const router = useRouter();
  const [game, setGame] = useState<GameWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Cargar datos del juego
  const loadGame = useCallback(async () => {
    try {
      const result = await getGame(gameId);
      if (result.success) {
        setGame(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Error al cargar la partida");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Cargar datos iniciales
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // 3.4: Configurar Supabase Realtime (solo si está habilitado)
  useEffect(() => {
    if (!gameId || !supabase) return;

    // Guardar referencia local para el cleanup
    const client = supabase;
    let playersChannel: RealtimeChannel | null = null;
    let movesChannel: RealtimeChannel | null = null;

    // Suscribirse a cambios en la tabla players para este juego
    playersChannel = client
      .channel(`game-${gameId}-players`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          loadGame();
        }
      )
      .subscribe();

    // Suscribirse a cambios en la tabla moves
    movesChannel = client
      .channel(`game-${gameId}-moves`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "moves",
        },
        () => {
          loadGame();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (playersChannel) client.removeChannel(playersChannel);
      if (movesChannel) client.removeChannel(movesChannel);
    };
  }, [gameId, loadGame]);

  // Finalizar partida
  const handleFinishGame = async () => {
    if (!game) return;

    setFinishing(true);
    try {
      const result = await finishGame(gameId);
      if (result.success) {
        loadGame();
      }
    } catch (error) {
      console.error("Error finishing game:", error);
    } finally {
      setFinishing(false);
    }
  };

  // Obtener el jugador líder
  const getLeader = (players: PlayerWithMoves[]) => {
    if (!players || players.length === 0) return null;
    return players.reduce((max, p) =>
      p.totalScore > max.totalScore ? p : max
    );
  };

  // Obtener todos los movimientos ordenados
  const getAllMoves = (
    players: PlayerWithMoves[]
  ): Array<Move & { player: Player }> => {
    if (!players) return [];

    const allMoves: Array<Move & { player: Player }> = [];

    players.forEach((player) => {
      player.moves.forEach((move) => {
        allMoves.push({
          ...move,
          player: {
            id: player.id,
            gameId: player.gameId,
            name: player.name,
            color: player.color,
            totalScore: player.totalScore,
          },
        });
      });
    });

    return allMoves.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-destructive text-lg">
          {error || "Partida no encontrada"}
        </div>
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    );
  }

  const leader = getLeader(game.players);
  const allMoves = getAllMoves(game.players);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {game.players.length} Jugadores
                </h1>
                <p className="text-xs text-muted-foreground">
                  {game.template?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {game.isFinished ? (
                <Badge className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Trophy className="w-3 h-3" />
                  Finalizada
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFinishGame}
                  disabled={finishing}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Banner de Ganador (si la partida terminó) */}
        {game.isFinished && game.winner && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="py-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
              <h2 className="text-2xl font-bold">
                ¡{game.winner.name} es el Ganador!
              </h2>
              <p className="text-muted-foreground">
                Con {game.winner.totalScore} puntos
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Jugadores (2 columnas en lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold">Puntuaciones</h2>
              {!game.isFinished && leader && (
                <Badge
                  variant="outline"
                  style={{ borderColor: leader.color, color: leader.color }}
                >
                  {leader.name} lidera con {leader.totalScore}
                </Badge>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {game.players
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isWinning={leader?.id === player.id}
                    onScoreUpdate={loadGame}
                    disabled={game.isFinished}
                  />
                ))}
            </div>
          </div>

          {/* Game Log (1 columna en lg) */}
          <div className="lg:col-span-1">
            <GameLog
              moves={allMoves}
              onUndo={loadGame}
              disabled={game.isFinished}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
