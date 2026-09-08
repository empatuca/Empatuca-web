const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDate(selectedDate) {
    let startOfDay = new Date(selectedDate + 'T00:00:00-05:00'); 
    let endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(endOfDay.getUTCHours() + 23);
    endOfDay.setUTCMinutes(endOfDay.getUTCMinutes() + 59);
    endOfDay.setUTCSeconds(endOfDay.getUTCSeconds() + 59);
    
    const { data: pData } = await supabase
      .from('pedidos')
      .select('id, total, created_at, estado')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .in('estado', ['cancelado', 'rechazado']);
      
    let sum = 0;
    pData.forEach(o => {
        sum += Number(o.total);
        console.log(o);
    });
    console.log("Canceled/Rejected on", selectedDate, ":", sum);
}
checkDate('2026-09-06');
