"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { undoLastMove } from "@/actions";
import type { Move, Player } from "@/lib/types";
import { History, Undo2, ArrowUp, ArrowDown } from "lucide-react";

interface GameLogProps {
  moves: Array<Move & { player: Player }>;
  onUndo: () => void;
  disabled?: boolean;
}

export function GameLog({ moves, onUndo, disabled = false }: GameLogProps) {
  const [undoing, setUndoing] = useState(false);

  const handleUndo = async () => {
    if (moves.length === 0) return;

    const lastMove = moves[0];
    setUndoing(true);

    try {
      const result = await undoLastMove(lastMove.player.id);
      if (result.success) {
        onUndo();
      }
    } catch (error) {
      console.error("Error undoing move:", error);
    } finally {
      setUndoing(false);
    }
  };

  const formatTime = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              Historial
            </CardTitle>
            <CardDescription>
              {moves.length} movimiento{moves.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={disabled || undoing || moves.length === 0}
            className="gap-1"
          >
            <Undo2 className="w-4 h-4" />
            Deshacer
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {moves.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay movimientos aún</p>
          </div>
        ) : (
          moves.map((move, index) => (
            <div
              key={move.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              {/* Indicador de color del jugador */}
              <div
                className="w-2 h-8 rounded-full shrink-0"
                style={{ backgroundColor: move.player.color }}
              />

              {/* Info del movimiento */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {move.player.name}
                  </span>
                  <Badge
                    variant={move.pointsChange > 0 ? "default" : "destructive"}
                    className="text-xs gap-1"
                  >
                    {move.pointsChange > 0 ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {move.pointsChange > 0 ? "+" : ""}
                    {move.pointsChange}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {move.reason}
                </p>
              </div>

              {/* Hora */}
              <span className="text-xs text-muted-foreground shrink-0">
                {formatTime(move.createdAt)}
              </span>

              {/* Indicador de último movimiento */}
              {index === 0 && (
                <Badge variant="outline" className="text-xs shrink-0">
                  Último
                </Badge>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
