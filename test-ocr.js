const Tesseract = require('tesseract.js');
Tesseract.recognize(
  '../../../image.png',
  'eng',
  { logger: m => console.log(m) }
).then(({ data: { text } }) => {
  console.log("OCR TEXT:", text);
});
