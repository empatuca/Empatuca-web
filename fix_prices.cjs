const fs = require('fs');
let code = fs.readFileSync('siteConfig.ts', 'utf8');

// The file has Empanadas de Harina with empanita: 0.50, and we want to change it back to 0.75.
// We can parse the array or just replace for the specific ones.
// Let's do it safely.
let newCode = code.replace(/category:\s*"Empanadas de Harina",\s*description:\s*".*?",\s*prices:\s*\{\s*empanita:\s*0\.50,/g, (match) => {
  return match.replace('empanita: 0.50', 'empanita: 0.75');
});

fs.writeFileSync('siteConfig.ts', newCode);
