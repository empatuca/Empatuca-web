const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const searchPattern = /const orderIdValue = (initialOrder \? initialOrder\.numero_pedido : )?Math\.floor\(Math\.random\(\) \* 1000\);/;
  
  const replacement = `
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    let orderIdValue = $1 1;
    if (${file.includes('WaitersPOS') ? '!initialOrder' : 'true'}) {
      if (supabase && !!import.meta.env.VITE_SUPABASE_URL) {
        try {
          const { count } = await supabase
            .from('pedidos')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString());
          orderIdValue = (count || 0) + 1;
        } catch(e) {
          orderIdValue = Math.floor(Math.random() * 1000);
        }
      } else {
        const todayOrders = localOrders.filter(o => new Date(o.created_at || new Date()).getTime() >= todayStart.getTime());
        orderIdValue = todayOrders.length + 1;
      }
    }
  `.replace(/\$1/g, file.includes('WaitersPOS') ? 'initialOrder ? initialOrder.numero_pedido :' : '');

  code = code.replace(searchPattern, replacement);
  
  if (file.includes('OrderModal.tsx')) {
     code = code.replace(/setOrderId\(orderIdValue\);/g, "setOrderId(orderIdValue);\n    let orderDisplay = orderIdValue;");
  }
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/home/WaitersPOS.tsx');
patchFile('src/components/home/OrderModal.tsx');

