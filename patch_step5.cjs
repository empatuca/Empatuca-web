const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace(
  "Por favor, termina de confirmarlo enviando el mensaje por WhatsApp que se acaba de abrir en tu celular.",
  "Tu pedido ha sido enviado a la cocina y pronto estará en preparación."
);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
