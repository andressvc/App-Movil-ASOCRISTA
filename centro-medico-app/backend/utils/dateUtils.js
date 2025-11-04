// utils/dateUtils.js
// Utilities to produce consistent YYYY-MM-DD dates in a specific timezone

const DEFAULT_TZ = 'America/Mexico_City';

function toISODateInTimeZone(date, timeZone = DEFAULT_TZ) {
  // Use Intl.DateTimeFormat to get date parts in the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date); // en-CA yields YYYY-MM-DD
}

function getTodayISO(timeZone = DEFAULT_TZ) {
  return toISODateInTimeZone(new Date(), timeZone);
}

function getYesterdayISO(timeZone = DEFAULT_TZ) {
  const d = new Date();
  // Move back one calendar day in target TZ by subtracting 24h and reformatting in TZ
  d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
  return toISODateInTimeZone(d, timeZone);
}

function getTomorrowISO(timeZone = DEFAULT_TZ) {
  const d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
  return toISODateInTimeZone(d, timeZone);
}

function addDaysISO(isoDate, days, timeZone = DEFAULT_TZ) {
  // isoDate: YYYY-MM-DD; interpret in TZ and add days
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return toISODateInTimeZone(dt, timeZone);
}

module.exports = {
  DEFAULT_TZ,
  toISODateInTimeZone,
  getTodayISO,
  getYesterdayISO,
  getTomorrowISO,
  addDaysISO
};


