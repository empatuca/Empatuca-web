const fs = require('fs');

// App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/window\.location\.hash/g, 'window.location.pathname');
appCode = appCode.replace(/hashchange/g, 'popstate');
appCode = appCode.replace(/currentHash/g, 'currentPath');
appCode = appCode.replace(/setCurrentHash/g, 'setCurrentPath');
appCode = appCode.replace(/#mesa/g, '/mesa');
appCode = appCode.replace(/#caja/g, '/caja');
appCode = appCode.replace(/#cocina/g, '/cocina');
appCode = appCode.replace(/#inventario/g, '/inventario');
appCode = appCode.replace(/#personal/g, '/personal');
appCode = appCode.replace(/window\.location\.pathname && \!\['\/mesa', '\/caja', '\/cocina', '\/personal', '\/inventario'\]\.includes\(window\.location\.pathname\)/g, "window.location.pathname !== '/' && !['/mesa', '/caja', '/cocina', '/personal', '/inventario'].includes(window.location.pathname)");

fs.writeFileSync('src/App.tsx', appCode);
