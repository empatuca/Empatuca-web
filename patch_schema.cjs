const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode = `      const orderData = {
        numero_pedido: orderIdValue,
        nombre_cliente: customerName,
        tipo: orderType,
        mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
        direccion_delivery: orderType === 'delivery' ? address : null,
        productos: selectedItems,
        estado: 'nuevo',
        aderezos: initialProduct?.category?.includes('Empanadas') ? aderezos : null,
      };`;

const newCode = `      const orderData = {
        numero_pedido: orderIdValue,
        nombre_cliente: customerName,
        tipo: orderType,
        mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
        direccion_delivery: orderType === 'delivery' ? address : null,
        productos: selectedItems,
        estado: 'nuevo',
        aderezos: initialProduct?.category?.includes('Empanadas') ? aderezos : null,
        total: total,
        metodo_pago: paymentMethod,
      };`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
