import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Fallback local state for demo purposes when Supabase is not configured
export const localOrders: any[] = [];
export const localListeners: Function[] = [];

export const notifyLocalListeners = () => {
  localListeners.forEach(listener => listener([...localOrders]));
};
