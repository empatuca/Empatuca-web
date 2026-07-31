const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace('import Admin from "./pages/Admin";', '');
fs.writeFileSync('src/App.tsx', appCode);
