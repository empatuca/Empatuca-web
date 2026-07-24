const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace("type OrderType = 'delivery' | 'llevar';", "type OrderType = 'delivery' | 'llevar' | 'mesa';");
code = code.replace("export function OrderModal({ isOpen, onClose, initialProduct }: { isOpen: boolean, onClose: () => void, initialProduct: any }) {", "export function OrderModal({ isOpen, onClose, initialProduct, isAdmin = false }: { isOpen: boolean, onClose: () => void, initialProduct: any, isAdmin?: boolean }) {");

code = code.replace("const [address, setAddress] = useState(\"\");", "const [address, setAddress] = useState(\"\");\n  const [tableNumber, setTableNumber] = useState(\"\");");

code = code.replace("mesa: null,", "mesa: orderType === 'mesa' ? parseInt(tableNumber) : null,");
code = code.replace("if (orderType === 'delivery' && !address) return;", "if (orderType === 'delivery' && !address) return;\n      if (orderType === 'mesa' && !tableNumber) return;");

code = code.replace(/disabled=\{\(orderType === 'delivery' && !address\)\}/g, "disabled={(orderType === 'delivery' && !address) || (orderType === 'mesa' && !tableNumber)}");

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
