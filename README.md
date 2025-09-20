# 🎲 BoardMate

BoardMate es una web app para organizar tu colección de juegos de mesa, registrar partidas y puntuaciones, y generar rankings entre amigos. Perfecta para planear noches de juegos y llevar el control de quién es el campeón de cada juego.

## ✨ Features
- Colección de juegos con filtros por nº jugadores, duración y dificultad.
- Recomendador de juego para la noche según criterios.
- Registro de partidas con puntuaciones de cada jugador.
- Rankings por juego y ranking global.
- Autenticación con Google.
- Diseño responsive (desktop + móvil).

## 🛠️ Stack
- Next.js (App Router)
- TailwindCSS + shadcn/ui
- Prisma + PostgreSQL (Supabase)
- NextAuth (Google)
- (Opcional) Realtime con Pusher / Socket.io

## 🚀 Getting Started
```bash
# 1. Clonar repo
git clone https://github.com/tu-usuario/boardmate.git
cd boardmate

# 2. Instalar dependencias
pnpm install # o npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Añadir DATABASE_URL y credenciales de Google

# 4. Migrar DB
pnpm prisma migrate dev

# 5. Ejecutar proyecto
yarn dev
```

## 📦 Deploy
Deploy en [Vercel](https://vercel.com/).

## 📌 Roadmap
Ver [issues](./issues) para tareas planificadas.

---
Hecho con ❤️ para los amantes de los juegos de mesa.
