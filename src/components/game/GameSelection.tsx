"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPublicTemplates, getActiveGames } from "@/actions";
import type { Template, GameWithPlayers } from "@/lib/types";
import { Plus, Play, Clock, Users, Trophy } from "lucide-react";

interface GameSelectionProps {
  userId?: string;
  onNewGame: () => void;
}

export function GameSelection({ userId, onNewGame }: GameSelectionProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeGames, setActiveGames] = useState<GameWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [templatesResult, gamesResult] = await Promise.all([
          getPublicTemplates(),
          userId ? getActiveGames(userId) : Promise.resolve({ success: true, data: [] }),
        ]);

        if (templatesResult.success) {
          setTemplates(templatesResult.data);
        }
        if (gamesResult.success) {
          setActiveGames(gamesResult.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  const handleContinueGame = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
          🎲 Board Mate
        </h1>
        <p className="text-muted-foreground">
          Tu compañero para llevar el puntaje de juegos de mesa
        </p>
      </div>

      {/* Nueva Partida */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group">
        <CardContent
          className="flex flex-col items-center justify-center py-12 gap-4"
          onClick={onNewGame}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Nueva Partida</h3>
            <p className="text-sm text-muted-foreground">
              Inicia una nueva sesión de juego
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Partidas Activas */}
      {activeGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-chart-2" />
            <h2 className="text-xl font-semibold">Partidas en Progreso</h2>
            <Badge variant="secondary">{activeGames.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {activeGames.map((game) => {
              const topPlayer = game.players.reduce(
                (max, p) => (p.totalScore > max.totalScore ? p : max),
                game.players[0]
              );

              return (
                <Card
                  key={game.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleContinueGame(game.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Partida en curso
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: topPlayer?.color }}
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {topPlayer?.name}: {topPlayer?.totalScore}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.players.map((p) => p.name).join(", ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      {game.players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-1 text-xs"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: player.color }}
                          />
                          <span>{player.totalScore}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Plantillas Disponibles */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-chart-4" />
          <h2 className="text-xl font-semibold">Plantillas de Puntuación</h2>
          <Badge variant="secondary">{templates.length}</Badge>
        </div>

        {templates.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No hay plantillas disponibles.</p>
              <p className="text-sm">
                Crea una plantilla personalizada para empezar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>
                    {template.isPublic ? "Plantilla pública" : "Plantilla privada"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onNewGame()}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Usar plantilla
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

