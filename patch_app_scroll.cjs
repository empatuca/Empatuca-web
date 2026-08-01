const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'useEffect(() => {\n    window.scrollTo(0, 0);\n  }, []);',
  `useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.hash && !['#mesa', '#caja', '#cocina', '#personal'].includes(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setCurrentHash('');
    }
  }, []);`
);

fs.writeFileSync('src/App.tsx', code);
