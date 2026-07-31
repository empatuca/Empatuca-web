DROP TABLE IF EXISTS public.pedidos;

CREATE TABLE public.pedidos (
  id uuid default gen_random_uuid() primary key,
  numero_pedido integer not null,
  nombre_cliente text not null,
  tipo text not null,
  mesa integer,
  direccion_delivery text,
  productos jsonb not null default '[]',
  aderezos jsonb,
  total numeric,
  metodo_pago text,
  estado text not null default 'nuevo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

NOTIFY pgrst, 'reload schema';
