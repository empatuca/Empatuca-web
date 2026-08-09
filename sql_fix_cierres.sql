-- Ejecutar esto en el SQL Editor de Supabase
GRANT ALL ON TABLE public.cierres_diarios TO anon;
GRANT ALL ON TABLE public.cierres_diarios TO authenticated;
ALTER TABLE public.cierres_diarios ADD COLUMN IF NOT EXISTS pedidos JSONB;
