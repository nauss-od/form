'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { formatDate } from '@/lib/utils';

type EmployeeStat = {
  id: string; name: string; email: string; mobile: string | null;
  createdAt: string; lastLoginAt: string | null;
  _count: { courses: number }; submissionCount: number;
};

type DashboardData = {
  totalCourses: number; totalSubmissions: number; completedSubmissions: number;
  userRole: string; employees: EmployeeStat[] | null;
  recentCourses: Array<{
    id: string; activityName: string | null; venue: string | null;
    startDate: string | null; endDate: string | null;
    _count: { submissions: number }; status: string;
    createdBy: { name: string };
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayRole, setDisplayRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/courses?stats=true')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        setData(d);
        const saved = localStorage.getItem('nauss-active-role');
        if (d.userRole === 'MANAGER') {
          setDisplayRole(saved === 'EMPLOYEE' ? 'EMPLOYEE' : 'MANAGER');
        } else {
          setDisplayRole('EMPLOYEE');
        }
      })
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('nauss-active-role');
      if (data?.userRole === 'MANAGER') {
        setDisplayRole(saved === 'EMPLOYEE' ? 'EMPLOYEE' : 'MANAGER');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [data]);

  if (loading) return <AppShell title="لوحة المستخدم"><p>جاري التحميل...</p></AppShell>;
  if (!data) return null;

  const isManagerView = data.userRole === 'MANAGER' && displayRole === 'MANAGER';
  const appRole = data.userRole === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE';

  if (isManagerView) {
    const emp = data.employees || [];
    const activeEmps = emp.filter(e => e._count.courses > 0);
    return (
      <AppShell title="لوحة المدير" role={appRole}>
        <div className="dashboard-grid">
          <div className="stat-card"><span className="stat-value">{data.totalCourses}</span><span className="stat-label">إجمالي الدورات</span></div>
          <div className="stat-card"><span className="stat-value">{data.totalSubmissions}</span><span className="stat-label">إجمالي المسجلين</span></div>
          <div className="stat-card"><span className="stat-value">{emp.length}</span><span className="stat-label">عدد الموظفين</span></div>
          <div className="stat-card accent"><span className="stat-value">{activeEmps.length}</span><span className="stat-label">موظفون نشطون</span></div>
        </div>

        <div className="section-card">
          <div className="section-head"><h3>الموظفون ونشاطهم</h3></div>
          {emp.length === 0 ? <p className="p-muted">لا يوجد موظفون بعد</p> : (
            <table className="data-table">
              <thead><tr><th>الموظف</th><th>البريد</th><th>الجوال</th><th>الدورات</th><th>المسجلون</th><th>آخر نشاط</th></tr></thead>
              <tbody>
                {emp.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{e.email}</td>
                    <td dir="ltr">{e.mobile || '—'}</td>
                    <td>{e._count.courses}</td>
                    <td>{e.submissionCount}</td>
                    <td>{e.lastLoginAt ? formatDate(e.lastLoginAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="section-card">
          <div className="section-head"><h3>جميع الدورات</h3></div>
          {!data.recentCourses?.length ? <p className="p-muted">لا توجد دورات</p> : (
            <table className="data-table">
              <thead><tr><th>النشاط</th><th>المشرف</th><th>المسجلون</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead>
              <tbody>
                {data.recentCourses?.map(c => (
                  <tr key={c.id}>
                    <td>{c.activityName || '—'}</td>
                    <td>{c.createdBy?.name || '—'}</td>
                    <td>{c._count.submissions}</td>
                    <td>{formatDate(c.startDate)}</td>
                    <td><span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`}>{c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}</span></td>
                    <td>
                      <a href={`/courses/${c.id}`} className="link-btn">تفاصيل</a>
                      <span style={{ margin: '0 4px' }}>|</span>
                      <a href={`/api/export/${c.id}/word`} className="link-btn">Word</a>
                      <span style={{ margin: '0 4px' }}>|</span>
                      <a href={`/api/export/${c.id}/eml`} className="link-btn">EML</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AppShell>
    );
  }

  const avgPerCourse = data.totalCourses > 0 ? Math.round(data.totalSubmissions / data.totalCourses) : 0;
  return (
    <AppShell title={data.userRole === 'MANAGER' ? 'لوحة الموظف' : 'لوحة المستخدم'} role={appRole}>
      <div className="dashboard-grid">
        <div className="stat-card"><span className="stat-value">{data.totalCourses}</span><span className="stat-label">دوراتي</span></div>
        <div className="stat-card"><span className="stat-value">{data.totalSubmissions}</span><span className="stat-label">إجمالي المسجلين</span></div>
        <div className="stat-card"><span className="stat-value">{avgPerCourse}</span><span className="stat-label">متوسط لكل دورة</span></div>
      </div>

      <div className="section-card">
        <div className="section-head"><h3>دوراتي</h3></div>
        {!data.recentCourses?.length ? <p className="p-muted">لا توجد دورات بعد</p> : (
          <table className="data-table">
            <thead><tr><th>النشاط</th><th>المكان</th><th>التاريخ</th><th>المسجلون</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {data.recentCourses.map(c => (
                <tr key={c.id}>
                  <td>{c.activityName || '—'}</td>
                  <td>{c.venue || '—'}</td>
                  <td>{formatDate(c.startDate)}</td>
                  <td>{c._count.submissions}</td>
                  <td><span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`}>{c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}</span></td>
                  <td>
                    <a href={`/courses/${c.id}`} className="link-btn">عرض</a>
                    <span style={{ margin: '0 4px' }}>|</span>
                    <a href={`/api/export/${c.id}/word`} className="link-btn">Word</a>
                    <span style={{ margin: '0 4px' }}>|</span>
                    <a href={`/api/export/${c.id}/eml`} className="link-btn">EML</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
