const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDate(selectedDate) {
    let startOfDay = new Date(selectedDate + 'T00:00:00-05:00'); 
    let endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(endOfDay.getUTCHours() + 23);
    endOfDay.setUTCMinutes(endOfDay.getUTCMinutes() + 59);
    endOfDay.setUTCSeconds(endOfDay.getUTCSeconds() + 59);
    endOfDay.setUTCMilliseconds(999);
    
    const { data: ingresosData } = await supabase
      .from('pedidos')
      .select('total')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .not('estado', 'in', '("cancelado","rechazado")'); // including archivado
      
    const sumIngresos = (ingresosData || []).reduce((sum, o) => sum + Number(o.total || 0), 0);
    console.log(selectedDate, ":", sumIngresos);
}

async function run() {
    await checkDate('2026-09-02');
    await checkDate('2026-09-03');
    await checkDate('2026-09-04');
    await checkDate('2026-09-05');
    await checkDate('2026-09-06');
    await checkDate('2026-09-07');
}
run();
