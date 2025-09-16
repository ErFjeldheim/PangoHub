// lib/date/availability.ts
export const fmtMonth = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
};

export const nextNMonths = (n: number) => {
  const out: string[] = [];
  const base = new Date();
  base.setDate(1);
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setMonth(base.getMonth() + i);
    out.push(fmtMonth(d));
  }
  return out;
};
