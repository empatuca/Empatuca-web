const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const t = `<link rel="apple-touch-icon" sizes="180x180" href="/app-icon.png">
    <link rel="icon" type="image/svg+xml" sizes="192x192" href="/logo_M.svg">`;

const r = `<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
    <link rel="icon" type="image/svg+xml" href="/logo_M.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="/app-icon.png">`;

code = code.replace(t, r);
fs.writeFileSync('index.html', code);
