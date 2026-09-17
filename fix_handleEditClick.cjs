const fs = require('fs');

let content = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const target = `  const handleEditClick = (gasto: any) => {
    setEditingGastoId(gasto.id);
    let socioVal = 'Chris';
    if (gasto.categoria === 'Pago Socios' && gasto.descripcion.startsWith('Retiro: ')) {
      socioVal = gasto.descripcion.replace('Retiro: ', '');
    } else if (gasto.categoria === 'Pago Socios') {
       socioVal = gasto.descripcion; // fallback
    }
    setEditGastoForm({
      descripcion: gasto.descripcion,
      monto: Number(gasto.monto).toString(),
      categoria: gasto.categoria,
      socio: socioVal
    });
  };`;

const replacement = `  const handleEditClick = (gasto: any) => {
    setEditingGastoId(gasto.id);
    
    let baseCategory = gasto.categoria;
    let socioVal = 'Chris';
    
    if (baseCategory.startsWith('Pago Socios')) {
      baseCategory = 'Pago Socios';
      const match = gasto.categoria.match(/\\((.*?)\\)/);
      if (match) {
        socioVal = match[1];
      }
    }
    
    setEditGastoForm({
      descripcion: gasto.descripcion,
      monto: Number(gasto.monto).toString(),
      categoria: baseCategory,
      socio: socioVal
    });
  };`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Caja.tsx', content, 'utf8');
console.log('done handleEditClick fix');
