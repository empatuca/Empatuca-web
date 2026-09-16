import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('gastos_diarios').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  if (!data) return;
  
  console.log(`Total records: ${data.length}`);
  
  const seen = new Set();
  const toDelete = [];
  const toKeep = [];
  
  for (const row of data) {
    // create a unique key based on description, amount, category and created_at
    const key = `${row.descripcion}_${row.monto}_${row.categoria}_${row.created_at}`;
    if (seen.has(key)) {
      toDelete.push(row.id);
    } else {
      seen.add(key);
      toKeep.push(row.id);
    }
  }
  
  console.log(`Unique records: ${toKeep.length}`);
  console.log(`Duplicates to delete: ${toDelete.length}`);
  
  // if we have duplicates, let's delete them
  if (toDelete.length > 0) {
    console.log('Deleting duplicates...');
    // delete in batches to avoid URL length limits if any
    const batchSize = 100;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      const { error: deleteError } = await supabase
        .from('gastos_diarios')
        .delete()
        .in('id', batch);
        
      if (deleteError) {
        console.error('Error deleting batch:', deleteError);
      } else {
        console.log(`Deleted batch of ${batch.length}`);
      }
    }
    console.log('Done deleting.');
  }
}

run();
