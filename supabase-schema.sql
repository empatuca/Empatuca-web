-- Esquema SQL para la tabla de pedidos en Supabase para Empatuca

CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido SERIAL,
  nombre_cliente TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('mesa', 'delivery', 'llevar')),
  mesa INT,
  direccion_delivery TEXT,
  productos JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'en_preparacion', 'listo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activar Realtime para la tabla pedidos
alter publication supabase_realtime add table pedidos;

-- Opcional: Políticas de seguridad (RLS)
-- Como este es un sistema rápido, habilitamos el acceso público (modifica según tus necesidades de seguridad)
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insertar pedidos a todos" ON pedidos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leer pedidos a todos" ON pedidos
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualizar estado a todos" ON pedidos
  FOR UPDATE USING (true);
