import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🌱 Seed Script
 *
 * Crea datos iniciales para desarrollo:
 * - Un perfil de usuario temporal
 * - Plantillas de puntuación de ejemplo
 */
async function main() {
  console.log("🌱 Iniciando seed...\n");

  // 1. Crear perfil de usuario temporal para desarrollo
  const userId = "00000000-0000-0000-0000-000000000001";

  const profile = await prisma.profile.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      username: "dev_user",
    },
  });
  console.log("✅ Perfil creado:", profile.username);

  // 2. Crear plantilla básica "Puntuación Libre"
  const freeTemplate = await prisma.template.upsert({
    where: { name: "Puntuación Libre" },
    update: {},
    create: {
      name: "Puntuación Libre",
      isPublic: true,
      scoringSchema: {
        version: "1.0",
        categories: [
          {
            id: "general",
            name: "Puntuación General",
            description: "Añade o resta puntos libremente",
            icon: "🎯",
            color: "#3B82F6",
            fields: [
              {
                id: "points",
                name: "Puntos",
                type: "number",
                min: -999,
                max: 999,
                step: 1,
                defaultValue: 0,
              },
            ],
          },
        ],
      },
    },
  });
  console.log("✅ Plantilla creada:", freeTemplate.name);

  // 3. Crear plantilla "7 Wonders"
  const wondersTemplate = await prisma.template.upsert({
    where: { name: "7 Wonders" },
    update: {},
    create: {
      name: "7 Wonders",
      isPublic: true,
      scoringSchema: {
        version: "1.0",
        categories: [
          {
            id: "military",
            name: "Conflictos Militares",
            icon: "⚔️",
            color: "#EF4444",
            fields: [{ id: "military_points", name: "Puntos", type: "number" }],
          },
          {
            id: "treasury",
            name: "Tesoro",
            icon: "💰",
            color: "#F59E0B",
            fields: [{ id: "coins", name: "Monedas (÷3)", type: "number" }],
          },
          {
            id: "wonder",
            name: "Maravilla",
            icon: "🏛️",
            color: "#8B5CF6",
            fields: [{ id: "wonder_points", name: "Puntos", type: "number" }],
          },
          {
            id: "civilian",
            name: "Estructuras Civiles",
            icon: "🏛️",
            color: "#3B82F6",
            fields: [{ id: "civilian_points", name: "Puntos", type: "number" }],
          },
          {
            id: "commercial",
            name: "Estructuras Comerciales",
            icon: "🏪",
            color: "#F59E0B",
            fields: [{ id: "commercial_points", name: "Puntos", type: "number" }],
          },
          {
            id: "guild",
            name: "Gremios",
            icon: "🎭",
            color: "#8B5CF6",
            fields: [{ id: "guild_points", name: "Puntos", type: "number" }],
          },
          {
            id: "science",
            name: "Estructuras Científicas",
            icon: "🔬",
            color: "#22C55E",
            fields: [{ id: "science_points", name: "Puntos", type: "number" }],
          },
        ],
      },
    },
  });
  console.log("✅ Plantilla creada:", wondersTemplate.name);

  // 4. Crear plantilla "Catan"
  const catanTemplate = await prisma.template.upsert({
    where: { name: "Catan" },
    update: {},
    create: {
      name: "Catan",
      isPublic: true,
      scoringSchema: {
        version: "1.0",
        categories: [
          {
            id: "settlements",
            name: "Poblados",
            icon: "🏠",
            color: "#F59E0B",
            fields: [{ id: "settlements", name: "Poblados (×1)", type: "number", min: 0, max: 5 }],
          },
          {
            id: "cities",
            name: "Ciudades",
            icon: "🏰",
            color: "#EF4444",
            fields: [{ id: "cities", name: "Ciudades (×2)", type: "number", min: 0, max: 4 }],
          },
          {
            id: "longest_road",
            name: "Ruta Comercial más Larga",
            icon: "🛤️",
            color: "#8B5CF6",
            fields: [{ id: "longest_road", name: "Puntos", type: "number", min: 0, max: 2 }],
          },
          {
            id: "largest_army",
            name: "Ejército más Grande",
            icon: "⚔️",
            color: "#3B82F6",
            fields: [{ id: "largest_army", name: "Puntos", type: "number", min: 0, max: 2 }],
          },
          {
            id: "victory_points",
            name: "Cartas de Puntos de Victoria",
            icon: "🎴",
            color: "#22C55E",
            fields: [{ id: "vp_cards", name: "Cartas", type: "number", min: 0 }],
          },
        ],
      },
    },
  });
  console.log("✅ Plantilla creada:", catanTemplate.name);

  console.log("\n🎉 Seed completado!");
  console.log("\n📋 Resumen:");
  console.log(`   - 1 perfil de usuario`);
  console.log(`   - 3 plantillas de puntuación`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

