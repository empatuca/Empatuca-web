import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('pedidos').select('*').limit(1);
  if (error) console.error("SELECT ERROR:", error);
  else {
     console.log("DATA KEYS:", data.length > 0 ? Object.keys(data[0]) : "No data, but query succeeded");
  }
}
run();
