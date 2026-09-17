const fs = require('fs');

let content = fs.readFileSync('src/components/caja/CajaDashboard.tsx', 'utf8');

// 1. Add color definitions
const colorTarget = `  'Pago Socios (María)': '#8b5cf6', // violet-500
  'Servicios Básicos': '#f59e0b', // amber-500
  'Otros': '#6b7280' // gray-500`;

const colorReplacement = `  'Pago Socios (María)': '#8b5cf6', // violet-500
  'Servicios Básicos': '#f59e0b', // amber-500
  'Consumo Familiar': '#f97316', // orange-500
  'Inversión / Equipamiento': '#06b6d4', // cyan-500
  'Otros': '#6b7280' // gray-500`;

content = content.replace(colorTarget, colorReplacement);

// 2. Add variables for breakdown
const varTarget = `    let countServicios = 0;

    let otrosGastos = 0;
    let countOtros = 0;`;

const varReplacement = `    let countServicios = 0;

    let consumoFamiliar = 0;
    let countConsumo = 0;

    let inversion = 0;
    let countInversion = 0;

    let otrosGastos = 0;
    let countOtros = 0;`;

content = content.replace(varTarget, varReplacement);

// 3. Add to the loop
const loopTarget = `      } else if (cat.toLowerCase().includes('servicio')) {
        serviciosBasicos += monto;
        countServicios++;
      } else if (cat.toLowerCase().includes('operativo')) {
        gastoOperativo += monto;
        countOperativo++;
      } else {
        otrosGastos += monto;
        countOtros++;
      }`;

const loopReplacement = `      } else if (cat.toLowerCase().includes('servicio')) {
        serviciosBasicos += monto;
        countServicios++;
      } else if (cat.toLowerCase().includes('operativo')) {
        gastoOperativo += monto;
        countOperativo++;
      } else if (cat.toLowerCase().includes('consumo')) {
        consumoFamiliar += monto;
        countConsumo++;
      } else if (cat.toLowerCase().includes('inversi') || cat.toLowerCase().includes('equipamiento')) {
        inversion += monto;
        countInversion++;
      } else {
        otrosGastos += monto;
        countOtros++;
      }`;

content = content.replace(loopTarget, loopReplacement);

// 4. Return new object
const returnTarget = `      servicios: {
        total: Math.round(serviciosBasicos * 100) / 100,
        count: countServicios,
        pct: (serviciosBasicos / totalCalc) * 100
      },
      otros: {
        total: Math.round(otrosGastos * 100) / 100,
        count: countOtros,
        pct: (otrosGastos / totalCalc) * 100
      }
    };`;

const returnReplacement = `      servicios: {
        total: Math.round(serviciosBasicos * 100) / 100,
        count: countServicios,
        pct: (serviciosBasicos / totalCalc) * 100
      },
      consumo: {
        total: Math.round(consumoFamiliar * 100) / 100,
        count: countConsumo,
        pct: (consumoFamiliar / totalCalc) * 100
      },
      inversion: {
        total: Math.round(inversion * 100) / 100,
        count: countInversion,
        pct: (inversion / totalCalc) * 100
      },
      otros: {
        total: Math.round(otrosGastos * 100) / 100,
        count: countOtros,
        pct: (otrosGastos / totalCalc) * 100
      }
    };`;

content = content.replace(returnTarget, returnReplacement);

fs.writeFileSync('src/components/caja/CajaDashboard.tsx', content, 'utf8');
console.log('done updating core object');
