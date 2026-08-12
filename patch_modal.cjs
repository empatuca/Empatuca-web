const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

// Also inject the import for formatOrderNumber if not exists, but we can do it inline or using the util.
if (!code.includes('formatOrderNumber')) {
  code = code.replace('import { siteConfig }', 'import { formatOrderNumber } from "../../lib/utils";\nimport { siteConfig }');
}

// Replace orderIdValue generation
const target = `    let orderIdValue =  1;
    if (true) {
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
    }`;

const replace = `    const d = new Date();
    const prefix = parseInt(\`\${d.getDate() < 10 ? '0'+d.getDate() : d.getDate()}\${(d.getMonth()+1) < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1)}000\`, 10);
    
    let orderIdValue = 1;
    if (true) {
      if (supabase && !!import.meta.env.VITE_SUPABASE_URL) {
        try {
          const { count } = await supabase
            .from('pedidos')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString());
          orderIdValue = prefix + (count || 0) + 1;
        } catch(e) {
          orderIdValue = prefix + Math.floor(Math.random() * 1000);
        }
      } else {
        const todayOrders = localOrders.filter(o => new Date(o.created_at || new Date()).getTime() >= todayStart.getTime());
        orderIdValue = prefix + todayOrders.length + 1;
      }
    }`;

code = code.replace(target, replace);

// replace message order id
code = code.replace(/#\$\{orderIdValue\}/g, '#${formatOrderNumber(orderIdValue)}');

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
