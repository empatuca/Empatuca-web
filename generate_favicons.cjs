const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  const input = 'public/app-icon.png';
  if (!fs.existsSync(input)) {
    console.error('File not found');
    return;
  }
  
  await sharp(input).resize(48, 48).toFile('public/favicon-48x48.png');
  await sharp(input).resize(192, 192).toFile('public/favicon-192x192.png');
  
  // also make a standard favicon.ico by just copying the 48x48 png (which works in modern browsers)
  // or we can just use the png files and link them.
  console.log('Favicons generated');
}

generate().catch(console.error);
