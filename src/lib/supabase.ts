import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * 🔌 Cliente de Supabase para el navegador
 *
 * Se usa SOLO para Realtime subscriptions, ya que Prisma
 * no soporta Realtime. Para queries normales, usa las Server Actions.
 *
 * ⚠️ Si las variables de entorno no están configuradas,
 * el cliente será null y Realtime estará deshabilitado.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente opcional - null si no hay credenciales
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper para verificar si Realtime está disponible
export const isRealtimeEnabled = () => supabase !== null;
