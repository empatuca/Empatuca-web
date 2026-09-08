const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

// Fix 1: fetchData validation
const fetchDataTarget = `      const fetchData = async () => {
        const startOfDay = new Date(selectedDate);`;
const fetchDataReplacement = `      const fetchData = async () => {
        if (!selectedDate) return;
        const startOfDay = new Date(selectedDate);
        if (isNaN(startOfDay.getTime())) return;`;
code = code.replace(fetchDataTarget, fetchDataReplacement);

// Fix 2: handleAddGasto validation
const handleAddGastoTarget = `      // Build a correct date based on selected date + current time to avoid timezone offset shifts to the wrong day
      const now = new Date();
      const expenseDate = new Date(gastoForm.fecha);
      expenseDate.setMinutes(expenseDate.getMinutes() + expenseDate.getTimezoneOffset());
      expenseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());`;
const handleAddGastoReplacement = `      // Build a correct date based on selected date + current time to avoid timezone offset shifts to the wrong day
      const now = new Date();
      const expenseDate = new Date(gastoForm.fecha || new Date().toISOString().split('T')[0]);
      if (!isNaN(expenseDate.getTime())) {
        expenseDate.setMinutes(expenseDate.getMinutes() + expenseDate.getTimezoneOffset());
        expenseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }`;
code = code.replace(handleAddGastoTarget, handleAddGastoReplacement);

// Also guard expenseDate.toISOString()
const payloadTarget = `        created_at: expenseDate.toISOString()`;
const payloadReplacement = `        created_at: !isNaN(expenseDate.getTime()) ? expenseDate.toISOString() : new Date().toISOString()`;
code = code.replace(payloadTarget, payloadReplacement);

fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched Caja.tsx for Invalid time value error.");
