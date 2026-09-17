const fs = require('fs');
let content = fs.readFileSync('src/components/caja/CajaDashboard.tsx', 'utf8');

const target = `    if (expenseBreakdown.servicios.total > 0) {
      list.push({ name: 'Servicios Básicos', value: expenseBreakdown.servicios.total, color: EXPENSE_COLORS['Servicios Básicos'] });
    }
    if (expenseBreakdown.otros.total > 0) {
      list.push({ name: 'Otros Egresos', value: expenseBreakdown.otros.total, color: EXPENSE_COLORS['Otros'] });
    }`;

const replacement = `    if (expenseBreakdown.servicios.total > 0) {
      list.push({ name: 'Servicios Básicos', value: expenseBreakdown.servicios.total, color: EXPENSE_COLORS['Servicios Básicos'] });
    }
    if (expenseBreakdown.consumo.total > 0) {
      list.push({ name: 'Consumo Familiar', value: expenseBreakdown.consumo.total, color: EXPENSE_COLORS['Consumo Familiar'] });
    }
    if (expenseBreakdown.inversion.total > 0) {
      list.push({ name: 'Inversión / Equipamiento', value: expenseBreakdown.inversion.total, color: EXPENSE_COLORS['Inversión / Equipamiento'] });
    }
    if (expenseBreakdown.otros.total > 0) {
      list.push({ name: 'Otros Egresos', value: expenseBreakdown.otros.total, color: EXPENSE_COLORS['Otros'] });
    }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/caja/CajaDashboard.tsx', content, 'utf8');
console.log('done updating pie chart');
