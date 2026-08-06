const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const regex1 = /const pendingOrders = orders\.filter\(o => o\.estado === 'pendiente_caja'\)\.length;/;
code = code.replace(regex1, "const pendingOrders = orders.filter(o => o.estado === 'pendiente_caja' || (o.tipo === 'mesa' && o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado')).length;");

const regex2 = /orders\.filter\(o => o\.estado === 'pendiente_caja'\)\.length === 0/g;
code = code.replace(regex2, "orders.filter(o => o.estado === 'pendiente_caja' || (o.tipo === 'mesa' && o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado')).length === 0");

const regex3 = /orders\.filter\(o => o\.estado === 'pendiente_caja'\)\.map/g;
code = code.replace(regex3, "orders.filter(o => o.estado === 'pendiente_caja' || (o.tipo === 'mesa' && o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado')).map");

fs.writeFileSync('src/pages/Caja.tsx', code);
