create table public.pedidos (
  id uuid default gen_random_uuid() primary key,
  numero_pedido integer not null,
  nombre_cliente text not null,
  tipo text not null,
  mesa integer,
  direccion_delivery text,
  productos jsonb not null default '[]',
  aderezos jsonb,
  estado text not null default 'nuevo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar realtime para la tabla
alter publication supabase_realtime add table public.pedidos;
