import { getEcuadorDayRange } from './src/lib/utils';

const refDateStr = '2026-08-08';
const { startOfDayUTC, endOfDayUTC } = getEcuadorDayRange(refDateStr);
const startDate = new Date(startOfDayUTC);
const endDate = new Date(endOfDayUTC);
const startMs = startDate.getTime();
const endMs = endDate.getTime();

const t = new Date('2026-08-08T19:43:35.600725+00:00').getTime();

console.log('startOfDayUTC:', startOfDayUTC);
console.log('endOfDayUTC:', endOfDayUTC);
console.log('t:', t);
console.log('startMs:', startMs);
console.log('endMs:', endMs);
console.log('t >= startMs:', t >= startMs);
console.log('t <= endMs:', t <= endMs);
