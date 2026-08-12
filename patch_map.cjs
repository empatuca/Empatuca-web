const fs = require('fs');
let code = fs.readFileSync('src/components/home/ContactSection.tsx', 'utf8');

const target = 'src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7891392659617!2d-79.1673896!3d-0.2520775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x904d4d12c1450a8b%3A0xc31fa55e8cc7432b!2sAv.%20Bomboli%20%26%20Ing.%20Carlos%20Brown%2C%20Santo%20Domingo!5e0!3m2!1ses!2sec!4v1700000000000!5m2!1ses!2sec"';
const replacement = 'src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005.9266087700297!2d-79.19939454169494!3d-0.2668135554697048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d54776a78a1201%3A0x147df095be85a082!2sEmpatuca!5e0!3m2!1ses!2sec!4v1786510888740!5m2!1ses!2sec"';

code = code.replace(target, replacement);
fs.writeFileSync('src/components/home/ContactSection.tsx', code);
