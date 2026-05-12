'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { formatDate } from '@/lib/utils';

type DashboardData = {
  totalCourses: number;
  totalSubmissions: number;
  completedSubmissions: number;
  userRole: string;
  recentCourses: Array<{
    id: string; activityName: string | null; venue: string | null;
    startDate: string | null; endDate: string | null;
    _count: { submissions: number }; status: string;
  }>;
};

function DonutChart({ pct, size = 100 }: { pct: number; size?: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#014f4d" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)" strokeLinecap="round" />
      <text x="50" y="48" textAnchor="middle" fontSize="18" fontWeight="700" fill="#014f4d">{pct}%</text>
      <text x="50" y="64" textAnchor="middle" fontSize="9" fill="#64748b">مكتمل</text>
    </svg>
  );
}

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

  const avgPerCourse = data && data.totalCourses > 0 ? Math.round(data.totalSubmissions / data.totalCourses) : 0;

  return (
    <AppShell title="لوحة المستخدم" role={data?.userRole}>
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-value">{loading ? '—' : data?.totalCourses || 0}</span>
          <span className="stat-label">الدورات المنشأة</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{loading ? '—' : data?.totalSubmissions || 0}</span>
          <span className="stat-label">إجمالي المسجلين</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{loading ? '—' : avgPerCourse}</span>
          <span className="stat-label">متوسط لكل دورة</span>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head"><h3>آخر الدورات</h3></div>
        {loading ? <p className="p-muted">جاري التحميل...</p> : !data?.recentCourses?.length ? <p className="p-muted">لا توجد دورات بعد. ابدأ بإنشاء دورة جديدة.</p> : (
          <table className="data-table">
            <thead><tr><th>النشاط</th><th>المكان</th><th>التاريخ</th><th>المسجلون</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {data.recentCourses.map(c => {
                const pct = c._count.submissions > 0 && data.totalCourses > 0 ? Math.round((c._count.submissions / data.totalSubmissions) * 100) : 0;
                return (
                  <tr key={c.id}>
                    <td>{c.activityName || '—'}</td>
                    <td>{c.venue || '—'}</td>
                    <td>{formatDate(c.startDate)}</td>
                    <td>
                      <div className="mini-bar-wrap">
                        <div className="mini-bar" style={{ width: `${Math.min(pct, 100)}%` }} />
                        <span>{c._count.submissions}</span>
                      </div>
                    </td>
                    <td><span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`}>{c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}</span></td>
                    <td><a href={`/courses/${c.id}`} className="link-btn">عرض</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
