# BoardMate — Plan paso a paso

**Resumen rápido**

BoardMate es una web app para gestionar tu colección de juegos de mesa, recibir recomendaciones para la noche de juego, registrar partidas con puntuaciones y generar rankings entre amigos. Diseñada para web (desktop-first) y responsive en móvil. Este documento contiene el plan paso a paso (MVP → features avanzadas), stack, estructura de BD, páginas clave y roadmap de trabajo.

---

## 🎯 Objetivos principales

- Guardar y gestionar una colección personal de juegos.
- Filtrar y recomendar juegos según nº de jugadores, duración y dificultad.
- Registrar partidas con puntuaciones por jugador y generar rankings por juego y globales.
- (Opcional) Añadir funciones sociales: compartir colecciones, votaciones, chat en tiempo real.

---

## 🛠️ Stack recomendado

- **Framework:** Next.js (App Router)
- **UI:** TailwindCSS + shadcn/ui, Framer Motion para animaciones
- **DB:** PostgreSQL + Prisma
- **Auth:** NextAuth (Google sign-in)
- **Realtime (opcional):** Pusher o Socket.io
- **Integraciones opcionales:** API de BoardGameGeek, Stripe (si vendes digitales)

---

## 📦 Estructura de la BD (ejemplo Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  avatar    String?
  games     Game[]   @relation("UserGames")
  sessions  GameSession[]
}

model Game {
  id         String   @id @default(cuid())
  name       String
  coverUrl   String?
  minPlayers Int
  maxPlayers Int
  duration   Int
  difficulty String
  notes      String?
  ownerId    String
  owner      User     @relation("UserGames", fields: [ownerId], references: [id])
  sessions   GameSession[]
}

model GameSession {
  id        String   @id @default(cuid())
  gameId    String
  game      Game     @relation(fields: [gameId], references: [id])
  date      DateTime @default(now())
  results   GameResult[]
}

model GameResult {
  id        String   @id @default(cuid())
  sessionId String
  session   GameSession @relation(fields: [sessionId], references: [id])
  playerId  String
  player    User       @relation(fields: [playerId], references: [id])
  score     Int
}
```

> Nota: puedes añadir campos extra (p. ej. tipo de puntuación, notas por resultado, reglas personalizadas) según lo necesites.

---

## 🧭 Páginas / Rutas clave

- `/` — Landing / Home (CTA: Sign in with Google)
- `/dashboard` — Colección personal (grid/tarjetas, filtros)
- `/games/[id]` — Detalle del juego (cover, stats, historial, botón "Registrar partida")
- `/night` — Recomendador de la noche (inputs: players, time, difficulty)
- `/sessions/new` — Form para crear una partida y añadir puntuaciones
- `/rankings` — Rankings globales y por juego
- `/profile` — Perfil de usuario y estadísticas personales
- `/friends` — (opcional) grupos, colecciones compartidas y votaciones

---

## ✅ MVP (mínimo viable)

1. Setup del repo y Next.js + Tailwind.
2. Autenticación con NextAuth (Google).
3. Prisma + Postgres con modelos básicos (User, Game).
4. CRUD de juegos (añadir/editar/borrar). Campo mínimo: nombre, min/max players, duración, dificultad, cover opcional.
5. Vista de colección con filtros por players/duración.

---

## ⚙️ Fase 2 — Recomendador + Partidas

1. Implementar `GameSession` y `GameResult` en DB.
2. Form para registrar partidas (seleccionar juego, jugadores y puntuaciones).
3. Página `/night` con lógica de recomendación (filtrado por players/time/difficulty) y modo random con animación.
4. En detalle del juego mostrar historial de partidas y ranking por juego (mejores por victorias o puntuación media).

---

## 🔗 Fase 3 — Social & Tiempo real

1. Grupos de amigos y compartir colecciones (público/privado).
2. Sistema de votaciones para elegir juego de la noche.
3. Chat en tiempo real para coordinar (Pusher / Socket.io).
4. Permisos y roles básicos (owner, miembro).

---

## ✨ Fase 4 — Pulido para portfolio

- Dashboard con estadísticas y gráficas (Recharts/Chart.js): juego más jugado, tiempo total, winrates.
- Medallas/achievements y efectos (confetti, animaciones con Framer Motion).
- Integración con BoardGameGeek para autocompletar datos al añadir un juego.
- Mobile polishing y dark mode.
- README y demo deployada (Vercel).

---

## 🗓 Roadmap sugerido (4 semanas)

- **Semana 1:** Repo + Next.js + Tailwind + NextAuth + Prisma schema básica.
- **Semana 2:** CRUD de juegos + UI de colección + filtros.
- **Semana 3:** Registro de partidas + recomendador `/night` + ranking básico.
- **Semana 4:** Pulido UI, animaciones, README, deploy en Vercel.

---

## 📝 Tareas inmediatas (primeros pasos)

1. Crear repo en GitHub y configurar Vercel.
2. `pnpm create next-app` (o `npm`) con App Router.
3. Añadir Tailwind y shadcn/ui.
4. Configurar Prisma + Postgres (puedes usar Supabase o ElephantSQL para desarrollo).
5. Implementar NextAuth con Google.
6. Crear la UI básica del dashboard y la página de añadir juego.

---

## 📌 Notas finales

- Diseña pensando en web: desktop-first, responsive para móvil, no nativo.
- Mantén componentes reutilizables y atómicos (usa shadcn/ui como base).
- Documenta cada feature en el README para que lo puedas explicar en entrevistas.

---

Si quieres, puedo **dividir este plan en tareas/Issues** para GitHub, generar un `README.md` listo para el repo, o crear un wireframe visual. Dime qué prefieres y lo dejo listo.

