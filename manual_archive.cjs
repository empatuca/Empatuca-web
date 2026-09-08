const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('pedidos').update({ estado: 'archivado' }).in('id', ['df24fdfe-bfc9-4771-9bba-c76ded04b5fd', '4ede28b5-acf3-4d9b-bacc-166d49064c69', 'db821657-4553-46f8-9de1-ad14587bfbd1', '1879e0db-d404-4444-b69c-ebfddd7322a3', '6d82feb7-e00b-4911-b153-594d76f6418b', 'bc7bdd8e-4ce3-4de7-a9a6-a4053c23e64b', '4854d35d-0459-47be-870e-7fc69648038d', '897a03de-2d71-48c3-869a-5e56f2b0609f', '4981a7df-bfbb-45fb-af05-a59ce443407c']);
  console.log("Update error:", error);
}
run();
