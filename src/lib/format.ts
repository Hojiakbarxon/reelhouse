// Postgres decimal/numeric columns come back from TypeORM as strings, not
// numbers (see price, amount, rating fields) — always coerce through here.
export function toNumber(value: number | string | null | undefined): number {
  return Number(value) || 0;
}

export function formatPrice(value: number | string): string {
  return `$${toNumber(value).toFixed(2)}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}


