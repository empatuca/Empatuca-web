const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

code = code.replace(
  'const [loading, setLoading] = useState(false);',
  'const [loading, setLoading] = useState(false);\n  const [viewMode, setViewMode] = useState<"activos" | "completados">("activos");'
);

fs.writeFileSync('src/pages/Cocina.tsx', code);
