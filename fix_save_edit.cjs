const fs = require('fs');

let content = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const target = `    let finalDesc = editGastoForm.descripcion.trim();
    if (editGastoForm.categoria === 'Pago Socios' && editGastoForm.socio) {
      finalDesc = \`Retiro: \${editGastoForm.socio}\`;
    }

    try {
      if (supabase) {
        await supabase
          .from('gastos_diarios')
          .update({
            descripcion: finalDesc,
            monto: Number(editGastoForm.monto),
            categoria: editGastoForm.categoria
          })
          .eq('id', editingGastoId);
      }
      
      const updateList = (list: any[]) => list.map(g => 
        g.id === editingGastoId 
          ? { ...g, descripcion: finalDesc, monto: Number(editGastoForm.monto), categoria: editGastoForm.categoria }
          : g
      );`;

const replacement = `    const finalDesc = editGastoForm.descripcion.trim();
    const finalCategory = editGastoForm.categoria === 'Pago Socios' ? \`Pago Socios (\${editGastoForm.socio})\` : editGastoForm.categoria;

    try {
      if (supabase) {
        await supabase
          .from('gastos_diarios')
          .update({
            descripcion: finalDesc,
            monto: Number(editGastoForm.monto),
            categoria: finalCategory
          })
          .eq('id', editingGastoId);
      }
      
      const updateList = (list: any[]) => list.map(g => 
        g.id === editingGastoId 
          ? { ...g, descripcion: finalDesc, monto: Number(editGastoForm.monto), categoria: finalCategory }
          : g
      );`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Caja.tsx', content, 'utf8');
console.log('done save edit fix');
