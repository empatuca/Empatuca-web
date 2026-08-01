const fs = require('fs');

const patchFile = (file, role) => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Add imports
  code = code.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport { requestNotificationPermission, sendNotification } from "../lib/notification";\nimport { BellRing } from "lucide-react";'
  );

  // Add permission state and effect
  const permissionHook = `
  const [hasNotifPermission, setHasNotifPermission] = useState(false);
  const [prevOrdersCount, setPrevOrdersCount] = useState(0);

  useEffect(() => {
    if ('Notification' in window) {
      setHasNotifPermission(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    const pendingOrders = orders.filter(o => o.estado === '${role === 'caja' ? 'pendiente_caja' : 'nuevo'}').length;
    if (pendingOrders > prevOrdersCount && prevOrdersCount > 0) {
      sendNotification('¡Nuevo Pedido!', { body: \`Tienes un nuevo pedido esperando en \${role === 'caja' ? 'caja' : 'cocina'}.\` });
    }
    setPrevOrdersCount(pendingOrders);
  }, [orders]);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasNotifPermission(granted);
    if (granted) {
      sendNotification('¡Notificaciones activadas!', { body: 'Recibirás alertas cuando lleguen pedidos nuevos.' });
    } else {
      alert("Debes permitir las notificaciones en tu navegador.");
    }
  };
`;

  code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + permissionHook);

  // Add a bell icon next to "Salir"
  const bellButton = `
            {!hasNotifPermission && (
              <button onClick={enableNotifications} className="text-amber-400 hover:text-amber-300 transition-colors mr-4" title="Activar Notificaciones">
                <BellRing className="w-5 h-5 animate-bounce" />
              </button>
            )}
            <a href="#personal"`;

  code = code.replace('<a href="#personal"', bellButton);

  fs.writeFileSync(file, code);
}

patchFile('src/pages/Caja.tsx', 'caja');
patchFile('src/pages/Cocina.tsx', 'cocina');
