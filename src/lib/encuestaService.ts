import { supabase, isSupabaseConfigured } from './supabase';

export interface EncuestaOrigenRecord {
  id?: string;
  canal: string;
  detalle?: string;
  dispositivo?: string;
  created_at?: string;
}

export const CANALES_ORIGEN = [
  { id: "me_recomendaron", label: "Me recomendaron", icon: "⭐" },
  { id: "amigo_familiar", label: "Por un amigo / familiar", icon: "👥" },
  { id: "local", label: "Vi el local físico", icon: "🏪" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "facebook", label: "Facebook", icon: "📘" },
  { id: "google", label: "Google / Maps", icon: "🔍" },
  { id: "whatsapp", label: "WhatsApp / Estados", icon: "💬" },
  { id: "delivery", label: "App de Delivery", icon: "🛵" },
  { id: "publicidad", label: "Volante / Letrero", icon: "📄" },
  { id: "otro", label: "Otro", icon: "✨" }
];

const LOCAL_STORAGE_KEY = 'empatuca_encuestas_origen';

export async function registrarEncuestaOrigen(canal: string, detalle?: string): Promise<{ success: boolean; error?: any }> {
  const dispositivo = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Móvil' : 'Escritorio';
  const newRecord: EncuestaOrigenRecord = {
    canal,
    detalle: detalle?.trim() || undefined,
    dispositivo,
    created_at: new Date().toISOString()
  };

  // 1. Guardar siempre en LocalStorage como respaldo inmediato
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    existing.push(newRecord);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    localStorage.setItem('empatuca_origen_respondido', 'true');
    localStorage.setItem('empatuca_origen_eleccion', canal);
  } catch (e) {
    console.warn("No se pudo guardar en localStorage", e);
  }

  // 2. Si Supabase está disponible, insertar en la tabla `encuesta_origen`
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('encuesta_origen')
        .insert([{
          canal: newRecord.canal,
          detalle: newRecord.detalle || null,
          dispositivo: newRecord.dispositivo,
          created_at: newRecord.created_at
        }]);

      if (error) {
        console.warn("Supabase encuesta_origen insert note:", error.message);
        return { success: true }; // LocalStorage ya lo respaldó
      }
      return { success: true };
    } catch (err) {
      console.warn("Error enviando encuesta a Supabase:", err);
      return { success: true };
    }
  }

  return { success: true };
}

export async function obtenerEstadisticasOrigen(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  // Intentar consultar Supabase primero
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('encuesta_origen')
        .select('canal');

      if (!error && Array.isArray(data)) {
        data.forEach(item => {
          const c = item.canal || 'Otro';
          counts[c] = (counts[c] || 0) + 1;
        });
        return counts;
      }
    } catch (e) {
      // Continuar con respaldo local
    }
  }

  // Respaldo desde LocalStorage
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    local.forEach((item: any) => {
      const c = item.canal || 'Otro';
      counts[c] = (counts[c] || 0) + 1;
    });
  } catch (e) {}

  return counts;
}
