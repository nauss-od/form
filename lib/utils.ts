export function formatDate(date?: string | Date | null): string {
  if (!date) return '—';
  const value = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(value.getTime())) return '—';
  return value.toLocaleDateString('en-GB');
}

export function formatDateLong(date?: string | Date | null): string {
  if (!date) return '—';
  const value = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(value.getTime())) return '—';
  return value.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function coursePublicUrl(token: string): string {
  const base = process.env.APP_URL || 'http://localhost:3000';
  return `${base}/public/form/${token}`;
}

export function generatePublicToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = 'nauss-od-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
