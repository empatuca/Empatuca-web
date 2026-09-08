// Mock Ecuador offset
const offset = 300; // minutes

const selectedDate = '2026-09-06';
// When parsed in Ecuador, the local representation of 2026-09-06T00:00:00Z is Sept 5th, 19:00:00
let startOfDay = new Date(selectedDate);
let utcTimestamp = startOfDay.getTime(); // timestamp for 2026-09-06T00:00:00Z

// In the browser, startOfDay.getTimezoneOffset() would be 300.
// startOfDay.getMinutes() local would be 0.
// startOfDay.setMinutes(0 + 300) locally:
// Let's emulate what browser does
function emulateBrowserEcuador() {
    let d = new Date(selectedDate + 'T00:00:00-05:00'); // Force it to parse as midnight Ecuador
    console.log("Local Start of Day:", d.toISOString());
    let e = new Date(d);
    e.setUTCHours(e.getUTCHours() + 23);
    e.setUTCMinutes(e.getUTCMinutes() + 59);
    e.setUTCSeconds(e.getUTCSeconds() + 59);
    console.log("Local End of Day:", e.toISOString());
}
emulateBrowserEcuador();
