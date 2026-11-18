export function countIfLoaded(query, count) {
  return Array.isArray(query.data) ? count(query.data) : null;
}

export function borrowMonths(records) {
  const counts = new Map();
  for (const record of records) {
    const month = record.borrowDate?.slice(0, 7);
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([month, borrows]) => ({month, borrows}));
}
