"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createGame, getPublicTemplates } from "@/actions";
import { PLAYER_COLORS } from "@/lib/types";
import type { Template, CreatePlayerInput } from "@/lib/types";
import { Plus, Trash2, Play, Users } from "lucide-react";

interface NewGameFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

export function NewGameForm({ open, onOpenChange, userId }: NewGameFormProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [players, setPlayers] = useState<CreatePlayerInput[]>([
    { name: "", color: PLAYER_COLORS[0] },
    { name: "", color: PLAYER_COLORS[1] },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      const result = await getPublicTemplates();
      if (result.success) {
        setTemplates(result.data);
        if (result.data.length > 0) {
          setSelectedTemplate(result.data[0].id);
        }
      }
    }

    if (open) {
      loadTemplates();
    }
  }, [open]);

  const handleAddPlayer = () => {
    if (players.length >= MAX_PLAYERS) return;

    const usedColors = new Set(players.map((p) => p.color));
    const nextColor =
      PLAYER_COLORS.find((c) => !usedColors.has(c)) || PLAYER_COLORS[0];

    setPlayers([...players, { name: "", color: nextColor }]);
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length <= MIN_PLAYERS) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handlePlayerColorChange = (index: number, color: string) => {
    const newPlayers = [...players];
    newPlayers[index].color = color;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!selectedTemplate) {
      setError("Selecciona una plantilla de puntuación");
      return;
    }

    const filledPlayers = players.map((p, i) => ({
      ...p,
      name: p.name.trim() || `Jugador ${i + 1}`,
    }));

    if (filledPlayers.length < MIN_PLAYERS) {
      setError(`Se requieren al menos ${MIN_PLAYERS} jugadores`);
      return;
    }

    setLoading(true);

    try {
      const result = await createGame(userId, {
        templateId: selectedTemplate,
        players: filledPlayers,
      });

      if (result.success) {
        onOpenChange(false);
        router.push(`/game/${result.data.id}`);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Error al crear la partida. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableColors = (currentColor: string) => {
    const usedColors = new Set(players.map((p) => p.color));
    return PLAYER_COLORS.filter((c) => c === currentColor || !usedColors.has(c));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Nueva Partida
          </DialogTitle>
          <DialogDescription>
            Configura los jugadores y la plantilla de puntuación
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de Plantilla */}
          <div className="space-y-2">
            <Label htmlFor="template">Plantilla de Puntuación</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay plantillas disponibles. Crea una primero.
              </p>
            )}
          </div>

          {/* Jugadores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jugadores ({players.length}/{MAX_PLAYERS})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPlayer}
                disabled={players.length >= MAX_PLAYERS}
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir
              </Button>
            </div>

            <div className="space-y-2">
              {players.map((player, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {/* Color Picker */}
                      <div className="relative">
                        <select
                          value={player.color}
                          onChange={(e) =>
                            handlePlayerColorChange(index, e.target.value)
                          }
                          className="appearance-none w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-sm"
                          style={{ backgroundColor: player.color }}
                          title="Seleccionar color"
                        >
                          {getAvailableColors(player.color).map((color) => (
                            <option
                              key={color}
                              value={color}
                              style={{ backgroundColor: color }}
                            >
                              ●
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Nombre */}
                      <Input
                        placeholder={`Jugador ${index + 1}`}
                        value={player.name}
                        onChange={(e) =>
                          handlePlayerNameChange(index, e.target.value)
                        }
                        className="flex-1"
                      />

                      {/* Eliminar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePlayer(index)}
                        disabled={players.length <= MIN_PLAYERS}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || templates.length === 0}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Partida
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

