// utils/date.js
// Consistent date helpers using America/Mexico_City timezone

const DEFAULT_TZ = 'America/Mexico_City';

export function toISODateInTimeZone(date = new Date(), timeZone = DEFAULT_TZ) {
  // en-CA gives YYYY-MM-DD reliably
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

export function getTodayISO(timeZone = DEFAULT_TZ) {
  return toISODateInTimeZone(new Date(), timeZone);
}

export function getYesterdayISO(timeZone = DEFAULT_TZ) {
  const d = new Date();
  d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
  return toISODateInTimeZone(d, timeZone);
}

export function getTomorrowISO(timeZone = DEFAULT_TZ) {
  const d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
  return toISODateInTimeZone(d, timeZone);
}

export function parseISOToLocalDate(isoDate, noon = true) {
  // Create Date object at midday to avoid TZ shift to previous day
  if (!isoDate) return null;
  const time = noon ? 'T12:00:00' : 'T00:00:00';
  return new Date(`${isoDate}${time}`);
}

export function formatDateES(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export const MX_TZ = DEFAULT_TZ;


