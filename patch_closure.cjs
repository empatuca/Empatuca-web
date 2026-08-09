const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const newSaveClosure = `
  const handleSaveClosure = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Se necesita conectar a Supabase para guardar el cierre del día.');
      return;
    }
    setIsSavingClosure(true);
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      fecha: today,
      total_ventas: totalVentas,
      inventario: inventory,
      pedidos: todayOrders
    };
    
    try {
      const { data: existing, error: errExist } = await supabase.from('cierres_diarios').select('id').eq('fecha', today).single();
      let error = null;
      if (existing) {
        const { error: errUp } = await supabase.from('cierres_diarios').update(payload).eq('id', existing.id);
        error = errUp;
      } else {
        const { error: errIns } = await supabase.from('cierres_diarios').insert([payload]);
        error = errIns;
      }
      
      if (error) {
        alert('Error al guardar en Supabase. Asegúrate de haber ejecutado el código SQL para crear la tabla cierres_diarios. Detalle: ' + error.message);
      } else {
        alert('Cierre guardado correctamente.');
        const resetInventory = inventory.map(item => ({ ...item, initialStock: 0, currentStock: 0 }));
        setInventory(resetInventory);
        updateLocalInventory(resetInventory);
      }
      
      const { data } = await supabase.from('cierres_diarios').select('*').order('fecha', { ascending: false });
      if (data) setClosures(data);
    } catch (err) {
      alert('Error inesperado: ' + err.message);
    }
    setIsSavingClosure(false);
  };
`;

code = code.replace(/const handleSaveClosure = async \(\) => \{[\s\S]*?await supabase\.from\('cierres_diarios'\)\.insert\(\[payload\]\);\n    \}\n    \n    alert\('Cierre del día guardado correctamente\.'\);\n    setIsSavingClosure\(false\);\n    \n    \/\/ Refresh closures\n    const \{ data \} = await supabase\.from\('cierres_diarios'\)\.select\('\*'\)\.order\('fecha', \{ ascending: false \}\);\n    if \(data\) setClosures\(data\);\n  \};/, newSaveClosure.trim());

// If the above regex doesn't match, we will just manually split and join or use a simpler replace
fs.writeFileSync('src/pages/Inventario.tsx', code);
