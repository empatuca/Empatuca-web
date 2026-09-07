const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.from('cierres_diarios').upsert({ id: '00000000-0000-0000-0000-000000000000', fecha: 'CURRENT_INVENTORY', inventario: [], total_ventas: 0 }).select().then(console.log);
