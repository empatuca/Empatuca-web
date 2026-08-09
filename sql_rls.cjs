const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
console.log(process.env.VITE_SUPABASE_URL);
