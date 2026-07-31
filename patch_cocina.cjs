const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

const oldCode1 = `        if (!error && data) {
          setOrders(data);
        }`;

const newCode1 = `        if (!error && data) {
          const parsedData = data.map(order => {
            let parsedAderezos = order.aderezos;
            if (typeof parsedAderezos === 'string') {
              try { parsedAderezos = JSON.parse(parsedAderezos); } catch (e) {}
            }
            let parsedProductos = order.productos;
            if (typeof parsedProductos === 'string') {
               try { parsedProductos = JSON.parse(parsedProductos); } catch (e) {}
            }
            return { ...order, aderezos: parsedAderezos, productos: parsedProductos };
          });
          setOrders(parsedData);
        }`;

code = code.replace(oldCode1, newCode1);

const oldCode2 = `        notifyLocalListeners();
      }
    }
  }, [isAuthenticated, isSupabaseConfigured]);`;

const newCode2 = `        notifyLocalListeners();
      }
    }
  }, [isAuthenticated]);`; // Just fixing missing dependency in warning if any

code = code.replace(oldCode2, newCode2);
fs.writeFileSync('src/pages/Cocina.tsx', code);
