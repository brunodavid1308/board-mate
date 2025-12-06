import { ScoreBoard } from "@/components/game";

interface GamePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 🎮 Página de Partida
 *
 * Ruta dinámica: /game/[id]
 * Muestra el ScoreBoard con la información de la partida.
 */
export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;

  return <ScoreBoard gameId={id} />;
}

/**
 * Metadata dinámica para SEO
 */
export async function generateMetadata({ params }: GamePageProps) {
  const { id } = await params;

  return {
    title: `Partida ${id.slice(0, 8)} | Board Mate`,
    description: "Gestiona la puntuación de tu partida en tiempo real",
  };
}

