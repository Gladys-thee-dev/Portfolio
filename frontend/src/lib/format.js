const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2025-01" -> "Jan 2025". Throws on malformed input, so bad data fails the tests. */
export function formatMonth(ym) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym ?? '');
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) throw new Error(`expected YYYY-MM, got "${ym}"`);
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export function formatRange(start, end) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}`;
}

/** Whole years between two YYYY-MM values (end defaults to now), for the timeline. */
export function durationLabel(start, end, now = new Date()) {
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end ? end.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const months = (ey - sy) * 12 + (em - sm) + 1;
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}
