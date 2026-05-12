'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { formatDate } from '@/lib/utils';

type DashboardData = {
  totalCourses: number;
  totalSubmissions: number;
  completedSubmissions: number;
  recentCourses: Array<{
    id: string; activityName: string | null; venue: string | null;
    startDate: string | null; endDate: string | null;
    _count: { submissions: number }; status: string;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses?stats=true')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setData(d))
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);
  if (!data && !loading) return null;

  return (
    <AppShell title="لوحة المستخدم">
      <div className="dashboard-grid">
        <div className="stat-card"><span className="stat-value">{loading ? '—' : data?.totalCourses || 0}</span><span className="stat-label">إجمالي الدورات</span></div>
        <div className="stat-card"><span className="stat-value">{loading ? '—' : data?.totalSubmissions || 0}</span><span className="stat-label">إجمالي المسجلين</span></div>
        <div className="stat-card accent"><span className="stat-value">{loading ? '—' : data?.completedSubmissions || 0}</span><span className="stat-label">نماذج مكتملة</span></div>
      </div>

      <div className="section-card">
        <div className="section-head"><h3>آخر الدورات</h3></div>
        {loading ? <p className="p-muted">جاري التحميل...</p> : (
          <table className="data-table">
            <thead><tr><th>النشاط</th><th>المكان</th><th>التاريخ</th><th>المسجلون</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {data?.recentCourses?.map(c => (
                <tr key={c.id}>
                  <td>{c.activityName || '—'}</td>
                  <td>{c.venue || '—'}</td>
                  <td>{formatDate(c.startDate)}</td>
                  <td>{c._count.submissions}</td>
                  <td><span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`}>{c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}</span></td>
                  <td><a href={`/courses/${c.id}`} className="link-btn">عرض</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
