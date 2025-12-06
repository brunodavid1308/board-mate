import { PrismaClient } from "@prisma/client";

/**
 * 🔌 Singleton de PrismaClient
 *
 * En desarrollo, Next.js hace hot-reload que puede crear múltiples
 * instancias de PrismaClient. Este patrón evita ese problema.
 *
 * En producción, se crea una única instancia.
 *
 * Uso:
 * import { prisma } from '@/lib/prisma'
 *
 * const games = await prisma.game.findMany()
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
