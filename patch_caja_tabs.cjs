const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

// Replace standard imports to add new icons
code = code.replace(
  'import { Clock, CheckCircle2, DollarSign, X } from "lucide-react";',
  'import { Clock, CheckCircle2, DollarSign, X, Receipt, Upload, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";'
);

// Add state for tabs and gastos
const stateTarget = `  const [showAllOrders, setShowAllOrders] = useState(false);`;
const stateReplacement = `  const [showAllOrders, setShowAllOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingresos' | 'gastos'>('ingresos');
  
  // Gastos state
  const [gastos, setGastos] = useState<any[]>([]);
  const [isAddingGasto, setIsAddingGasto] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    descripcion: '',
    monto: '',
    categoria: 'Operativo',
    socio: 'Socio 1'
  });
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
`;
code = code.replace(stateTarget, stateReplacement);

// Add fetch logic for gastos
const fetchTarget = `        if (!error && data) {
          const parsedData = data.map(order => {`;
const fetchReplacement = `        if (!error && data) {
          const parsedData = data.map(order => {`;
          
const hookTarget = `      fetchOrders();

      const channel = supabase`;
const hookReplacement = `      fetchOrders();
      
      const fetchGastos = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data, error } = await supabase
          .from('gastos_diarios')
          .select('*')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });
        if (!error && data) {
          setGastos(data);
        }
      };
      fetchGastos();

      const channel = supabase`;
code = code.replace(hookTarget, hookReplacement);

fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched imports and state");
