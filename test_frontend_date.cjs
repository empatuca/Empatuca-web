const selectedDate = '2026-09-06';
const startOfDay = new Date(selectedDate);
console.log("Initial:", startOfDay.toISOString());
startOfDay.setMinutes(startOfDay.getMinutes() + startOfDay.getTimezoneOffset());
console.log("After offset:", startOfDay.toISOString());
startOfDay.setHours(0, 0, 0, 0);
console.log("After setHours:", startOfDay.toISOString());

const endOfDay = new Date(startOfDay);
endOfDay.setHours(23, 59, 59, 999);
console.log("End:", endOfDay.toISOString());
