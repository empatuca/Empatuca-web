const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code + `
let invChannel: any = null;
export const syncSharedInventory = async () => {
  if (isSupabaseConfigured && supabase) {
    const inv = await fetchSharedInventory();
    if (inv.length > 0) {
      localInventory.splice(0, localInventory.length, ...inv);
      notifyInventoryListeners();
    }
    
    if (!invChannel) {
      invChannel = supabase
        .channel('shared-inventory')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cierres_diarios', filter: "id=eq.00000000-0000-0000-0000-000000000000" }, (payload) => {
           if (payload.new && payload.new.inventario) {
              localInventory.splice(0, localInventory.length, ...(payload.new.inventario));
              notifyInventoryListeners();
           }
        })
        .subscribe();
    }
  }
};
`;

fs.writeFileSync('src/lib/supabase.ts', code);
