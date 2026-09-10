const d = new Date();
const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Guayaquil',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).formatToParts(d);

const day = parts.find(p => p.type === 'day').value;
const month = parts.find(p => p.type === 'month').value;
const year = parts.find(p => p.type === 'year').value;

console.log(`${year}-${month}-${day}`);
