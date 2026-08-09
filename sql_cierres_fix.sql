-- Ejecuta este código en el SQL Editor de Supabase
CREATE TABLE IF NOT EXISTS public.cierres_diarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    total_ventas NUMERIC(10, 2) NOT NULL DEFAULT 0,
    inventario JSONB NOT NULL,
    pedidos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.cierres_diarios ADD COLUMN IF NOT EXISTS pedidos JSONB;

-- Desactivar RLS por si acaso estaba bloqueando
ALTER TABLE public.cierres_diarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;

-- Permisos
GRANT ALL ON TABLE public.cierres_diarios TO anon;
GRANT ALL ON TABLE public.cierres_diarios TO authenticated;
GRANT ALL ON TABLE public.pedidos TO anon;
GRANT ALL ON TABLE public.pedidos TO authenticated;

NOTIFY pgrst, 'reload schema';
