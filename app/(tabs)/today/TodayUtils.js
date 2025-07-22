export function getWeekDates(centerDate) {
  const week = [];
  const dayOfWeek = centerDate.getDay();
  const start = new Date(centerDate);
  start.setDate(centerDate.getDate() - dayOfWeek);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    week.push(d);
  }
  return week;
} 