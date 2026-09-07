const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import
code = code.replace('import Home from "./pages/Home";', 'import { syncSharedInventory } from "./lib/supabase";\nimport Home from "./pages/Home";');

// Insert sync call in useEffect
code = code.replace('setIsLoading(false);', 'syncSharedInventory().then(() => setIsLoading(false));');
// wait, the timer might be faster than the db, but it's ok.
// Let's just put it in a separate useEffect.
const newUseEffect = `
  useEffect(() => {
    syncSharedInventory();
  }, []);
`;
code = code.replace('export default function App() {', 'export default function App() {' + newUseEffect);

fs.writeFileSync('src/App.tsx', code);
