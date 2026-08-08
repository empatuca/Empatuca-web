CREATE TABLE public.cierres_diarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    total_ventas NUMERIC(10, 2) NOT NULL DEFAULT 0,
    inventario JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
