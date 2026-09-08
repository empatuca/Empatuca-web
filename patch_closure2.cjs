const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const target = `        alert('Cierre guardado correctamente.');
        const { data } = await supabase.from('cierres_diarios').select('*').neq('id', '00000000-0000-0000-0000-000000000000').order('fecha', { ascending: false });
        if (data) setClosures(data);
        
        // Reset local inventory to 0 as requested by user
        const resetInv = inventory.map(item => ({ ...item, initialStock: 0, currentStock: 0 }));
        updateLocalInventory(resetInv);
      }
    } catch (err) {`;

const replacement = `        alert('Cierre guardado correctamente.');
        const { data } = await supabase.from('cierres_diarios').select('*').neq('id', '00000000-0000-0000-0000-000000000000').order('fecha', { ascending: false });
        if (data) setClosures(data);
        
        // Archive current orders so they don't show up anymore today
        if (todayOrders.length > 0) {
          const ids = todayOrders.map(o => o.id);
          // Split into chunks if too many, but Supabase handles arrays fine
          await supabase.from('pedidos').update({ estado: 'archivado' }).in('id', ids);
        }

        // Reset local inventory to 0 as requested by user
        const resetInv = inventory.map(item => ({ ...item, initialStock: 0, currentStock: 0 }));
        updateLocalInventory(resetInv);
      }
    } catch (err) {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Inventario.tsx', code);
  console.log("Success patch closure 2");
} else {
  console.log("Failed to find target in Inventario closure 2");
}
