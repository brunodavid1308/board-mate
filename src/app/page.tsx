"use client";

import { useState } from "react";
import { GameSelection, NewGameForm } from "@/components/game";

/**
 * 🏠 Página Principal
 *
 * Muestra la selección de juegos y el formulario para crear nuevas partidas.
 *
 * TODO: Integrar autenticación con Supabase Auth
 * Por ahora usamos un userId temporal para desarrollo.
 */

// ID temporal para desarrollo (reemplazar con auth real)
const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export default function HomePage() {
  const [showNewGameForm, setShowNewGameForm] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <GameSelection
          userId={TEMP_USER_ID}
          onNewGame={() => setShowNewGameForm(true)}
        />

        <NewGameForm
          open={showNewGameForm}
          onOpenChange={setShowNewGameForm}
          userId={TEMP_USER_ID}
        />
      </div>
    </main>
  );
}
