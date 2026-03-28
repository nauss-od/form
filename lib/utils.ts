export function formatDate(date?: string | Date | null): string {
  if (!date) return '—';
  const value = typeof date === 'string' ? new Date(date) : date;
  return value.toLocaleDateString('ar-SA');
}

export function coursePublicUrl(token: string): string {
  const base = process.env.APP_URL || 'http://localhost:3000';
  return `${base}/public/form/${token}`;
}

export function courseEditUrl(token: string): string {
  const base = process.env.APP_URL || 'http://localhost:3000';
  return `${base}/public/edit/${token}`;
}
