const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

// Add imports
code = code.replace(
  'import { localOrders } from "../lib/supabase";',
  'import { localOrders, supabase } from "../lib/supabase";'
);

// Add state for orders and fetch them
const fetchCode = `
  const [orders, setOrders] = useState<any[]>([]);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const fetchOrders = async () => {
        // Obtenemos solo los pedidos de hoy para el inventario
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .gte('created_at', today.toISOString());
          
        if (!error && data) {
          setOrders(data);
        }
      };
      fetchOrders();
      const channel = supabase
        .channel('schema-db-changes-inv')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pedidos' },
          () => fetchOrders()
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      setOrders([...localOrders]);
      const handleLocalUpdate = () => setOrders([...localOrders]);
      window.addEventListener('localOrdersUpdated', handleLocalUpdate);
      return () => window.removeEventListener('localOrdersUpdated', handleLocalUpdate);
    }
  }, [isSupabaseConfigured]);

  // Calculate daily sales from localOrders (or supabase if we want, but localOrders is easier for daily)
`;

code = code.replace(
  '// Calculate daily sales from localOrders (or supabase if we want, but localOrders is easier for daily)',
  fetchCode
);

code = code.replace(
  'const todayOrders = localOrders.filter(o => o.estado === \'entregado\' || o.estado === \'listo\' || o.estado === \'pendiente_caja\' || o.estado === \'en_preparacion\' || o.estado === \'nuevo\');',
  'const todayOrders = orders.filter(o => o.estado === \'entregado\' || o.estado === \'listo\' || o.estado === \'pendiente_caja\' || o.estado === \'en_preparacion\' || o.estado === \'nuevo\');'
);

code = code.replace(
  '}, [localOrders.length]);',
  '}, [orders]);'
);

fs.writeFileSync('src/pages/Inventario.tsx', code);
