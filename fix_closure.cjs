const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const target = `      if (error) {
        alert('Error al guardar en Supabase. Asegúrate de ejecutar el código SQL para crear la tabla cierres_diarios.\\nDetalle: ' + error.message);
      } else {
        alert('Cierre guardado correctamente.');
        const { data } = await supabase.from('cierres_diarios').select('*').neq('id', '00000000-0000-0000-0000-000000000000').order('fecha', { ascending: false });
        if (data) setClosures(data);
      }
      // Eliminado el reseteo automático para que las ventas cuadren con el inventario actual
    } catch (err) {`;

const replacement = `      if (error) {
        alert('Error al guardar en Supabase. Asegúrate de ejecutar el código SQL para crear la tabla cierres_diarios.\\nDetalle: ' + error.message);
      } else {
        alert('Cierre guardado correctamente.');
        const { data } = await supabase.from('cierres_diarios').select('*').neq('id', '00000000-0000-0000-0000-000000000000').order('fecha', { ascending: false });
        if (data) setClosures(data);
        
        // Reset local inventory to 0 as requested by user
        const resetInv = inventory.map(item => ({ ...item, initialStock: 0, currentStock: 0 }));
        updateLocalInventory(resetInv);
      }
    } catch (err) {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Inventario.tsx', code);
  console.log("Success patch closure reset");
} else {
  console.log("Failed to find target in Inventario closure");
}
