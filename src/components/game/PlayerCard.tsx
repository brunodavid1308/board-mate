"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addMove } from "@/actions";
import type { Player } from "@/lib/types";
import { Plus, Minus, Trophy } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  isWinning: boolean;
  onScoreUpdate: () => void;
  disabled?: boolean;
}

export function PlayerCard({
  player,
  isWinning,
  onScoreUpdate,
  disabled = false,
}: PlayerCardProps) {
  const [points, setPoints] = useState<string>("1");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAddPoints = async (multiplier: 1 | -1) => {
    const pointsValue = parseInt(points) || 1;
    if (pointsValue <= 0) return;

    setLoading(true);
    try {
      await addMove({
        playerId: player.id,
        pointsChange: pointsValue * multiplier,
        reason: reason.trim() || (multiplier > 0 ? "Puntos añadidos" : "Puntos restados"),
      });
      setReason("");
      onScoreUpdate();
    } catch (error) {
      console.error("Error adding points:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="relative overflow-hidden transition-all hover:shadow-lg"
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: player.color,
      }}
    >
      {/* Indicador de ganador */}
      {isWinning && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            Líder
          </Badge>
        </div>
      )}

      <CardContent className="p-4 space-y-4">
        {/* Header: Nombre y Puntuación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: player.color }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{player.name}</h3>
              <p className="text-xs text-muted-foreground">
                Jugador
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">
              {player.totalScore}
            </div>
            <p className="text-xs text-muted-foreground">puntos</p>
          </div>
        </div>

        {/* Controles de puntuación */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-20 text-center"
              disabled={disabled || loading}
            />
            <Input
              placeholder="Razón (opcional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-1"
              disabled={disabled || loading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleAddPoints(-1)}
              disabled={disabled || loading}
            >
              <Minus className="w-4 h-4 mr-1" />
              Restar
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleAddPoints(1)}
              disabled={disabled || loading}
              style={{
                backgroundColor: player.color,
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Sumar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

