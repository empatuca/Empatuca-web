const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/if \(error\) \{[\s\S]*?if \(data\) setClosures\(data\);\n    \} catch \(err\) \{/g, `if (error) {
        alert('Error al guardar en Supabase. Asegúrate de ejecutar el código SQL para crear la tabla cierres_diarios.\\nDetalle: ' + error.message);
      } else {
        alert('Cierre guardado correctamente.');
        const { data } = await supabase.from('cierres_diarios').select('*').order('fecha', { ascending: false });
        if (data) setClosures(data);
      }
      // Reset inventory anyway so you can start fresh locally
      const resetInventory = inventory.map(item => ({ ...item, initialStock: 0, currentStock: 0 }));
      setInventory(resetInventory);
      updateLocalInventory(resetInventory);
    } catch (err) {`);

fs.writeFileSync('src/pages/Inventario.tsx', code);
