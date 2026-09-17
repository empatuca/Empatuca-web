CREATE TABLE IF NOT EXISTS observaciones_diarias (
  id uuid default gen_random_uuid() primary key,
  fecha date not null,
  nota text not null,
  autor text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
ALTER TABLE observaciones_diarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for now" ON observaciones_diarias
  FOR ALL
  USING (true)
  WITH CHECK (true);
