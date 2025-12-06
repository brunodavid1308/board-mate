"use server";

import { prisma } from "@/lib/prisma";
import type { ScoringSchema, ActionResult } from "@/lib/types";
import type { Template } from "@prisma/client";

/**
 * 🏷️ Obtener todas las plantillas públicas
 *
 * @returns Lista de plantillas públicas disponibles
 */
export async function getPublicTemplates(): Promise<ActionResult<Template[]>> {
  try {
    const templates = await prisma.template.findMany({
      where: { isPublic: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return {
      success: false,
      error: "Error al obtener las plantillas",
    };
  }
}

/**
 * 📋 Obtener una plantilla por ID
 *
 * @param templateId - ID de la plantilla
 * @returns La plantilla con su esquema de puntuación
 */
export async function getTemplate(
  templateId: string
): Promise<ActionResult<Template>> {
  try {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return { success: false, error: "Plantilla no encontrada" };
    }

    return { success: true, data: template };
  } catch (error) {
    console.error("Error fetching template:", error);
    return {
      success: false,
      error: "Error al obtener la plantilla",
    };
  }
}

/**
 * ➕ Crear una nueva plantilla
 *
 * @param name - Nombre de la plantilla
 * @param scoringSchema - Esquema de puntuación (JSON)
 * @param isPublic - Si es pública o privada
 * @returns La plantilla creada
 */
export async function createTemplate(
  name: string,
  scoringSchema: ScoringSchema,
  isPublic: boolean = false
): Promise<ActionResult<Template>> {
  try {
    // Validaciones
    if (!name || name.trim() === "") {
      return {
        success: false,
        error: "El nombre de la plantilla es requerido",
      };
    }

    if (!scoringSchema || !scoringSchema.categories) {
      return { success: false, error: "El esquema de puntuación es requerido" };
    }

    // Verificar que el nombre no existe
    const existing = await prisma.template.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya existe una plantilla con ese nombre",
      };
    }

    const template = await prisma.template.create({
      data: {
        name: name.trim(),
        scoringSchema: scoringSchema as object,
        isPublic,
      },
    });

    return { success: true, data: template };
  } catch (error) {
    console.error("Error creating template:", error);
    return {
      success: false,
      error: "Error al crear la plantilla",
    };
  }
}

/**
 * 🌱 Seed: Crear plantilla básica de ejemplo
 *
 * Crea una plantilla genérica para pruebas.
 */
export async function seedBasicTemplate(): Promise<ActionResult<Template>> {
  const basicSchema: ScoringSchema = {
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
  };

  return createTemplate("Puntuación Libre", basicSchema, true);
}
