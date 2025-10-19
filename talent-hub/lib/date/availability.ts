export const fmtMonthUTC = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
};

export const nextNMonthsUTC = (n: number) => {
  const out: string[] = [];
  const base = new Date();
  // Normalize to UTC month start
  const d0 = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + i, 1));
    out.push(fmtMonthUTC(d));
  }
  return out;
};
