'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

type Course = {
  id: string; activityName: string | null; venue: string | null;
  startDate: string | null; endDate: string | null;
  participantCount: number | null; publicToken: string;
  status: string; _count: { submissions: number };
  createdBy: { name: string };
};

type DashboardData = {
  totalCourses: number; totalSubmissions: number;
  userRole: string;
  employees: Array<{
    id: string; name: string;
    _count: { courses: number }; submissionCount: number;
  }> | null;
  recentCourses: Course[];
};

function coursePct(c: Course): number {
  const target = c.participantCount || 0;
  const subs = c._count.submissions;
  return target > 0 ? Math.round((subs / target) * 100) : subs > 0 ? 100 : 0;
}

function courseUrl(c: Course): string {
  return `${window.location.origin}/public/form/${c.publicToken}`;
}

function CourseCard({ c }: { c: Course }) {
  const pct = coursePct(c);
  const target = c.participantCount || c._count.submissions;
  return (
    <div className="course-card">
      <div className="course-card-top">
        <div>
          <span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`} style={{ fontSize: '0.72rem', minHeight: 28, padding: '0 10px' }}>
            {c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}
          </span>
          <strong className="course-card-title">{c.activityName || 'دورة تدريبية'}</strong>
          <div className="course-card-meta">
            <span>📍 {c.venue || '—'}</span>
            <span>📅 {formatDate(c.startDate)}</span>
          </div>
        </div>
        <div className="course-card-figure">
          <div className="big-stat">{c._count.submissions}</div>
          <div className="big-stat-label">/ {target}</div>
        </div>
      </div>
      <div className="progress-bar-lg" style={{ margin: '10px 0' }}>
        <div className={`progress-fill-lg ${pct >= 100 ? 'done' : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="course-card-actions">
        <Link href={`/courses/${c.id}`} className="secondary-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>عرض</Link>
        <button className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }} onClick={() => { navigator.clipboard.writeText(courseUrl(c)); alert('تم نسخ الرابط'); }}>نسخ الرابط</button>
        <a href={`/api/export/${c.id}/word`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>Word</a>
        <a href={`/api/export/${c.id}/eml`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>EML</a>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [managerMode, setManagerMode] = useState<boolean | null>(null);

  function syncRole(apiRole: string) {
    const saved = localStorage.getItem('nauss-active-role');
    setManagerMode(apiRole === 'MANAGER' ? saved !== 'EMPLOYEE' : false);
  }

  useEffect(() => {
    fetch('/api/courses?stats=true')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); syncRole(d.userRole); })
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => { if (data) syncRole(data.userRole); };
    window.addEventListener('nauss-role-change', handler);
    return () => window.removeEventListener('nauss-role-change', handler);
  }, [data]);

  if (loading) return <AppShell title="لوحة المستخدم"><p>جاري التحميل...</p></AppShell>;
  if (!data) return null;

  const isManager = data.userRole === 'MANAGER';
  const showManagerView = isManager && managerMode === true;
  const appRole = isManager ? 'MANAGER' : 'EMPLOYEE';

  if (showManagerView) {
    const emp = data.employees || [];
    return (
      <AppShell title="لوحة المدير" role={appRole}>
        <div className="dashboard-grid">
          <div className="stat-card"><span className="stat-value">{data.totalCourses}</span><span className="stat-label">إجمالي الدورات</span></div>
          <div className="stat-card"><span className="stat-value">{data.totalSubmissions}</span><span className="stat-label">إجمالي المسجلين</span></div>
          <div className="stat-card"><span className="stat-value">{emp.length}</span><span className="stat-label">عدد الموظفين</span></div>
          <div className="stat-card accent"><span className="stat-value">{emp.filter(e => e._count.courses > 0).length}</span><span className="stat-label">موظفون نشطون</span></div>
        </div>

        <div className="section-card">
          <div className="section-head"><h3>جميع الدورات ({data.recentCourses?.length || 0})</h3></div>
          {!data.recentCourses?.length ? <p style={{ padding: 24 }} className="muted">لا توجد دورات</p> : (
            <div className="course-grid">
              {data.recentCourses.map(c => (
                <CourseCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="لوحة المستخدم" role={appRole}>
      {/* Hero create button */}
      <Link href="/new-course" className="create-hero">
        <div className="create-hero-icon">＋</div>
        <div>
          <strong>إنشاء دورة جديدة</strong>
          <span>احصل على رابط وأرسله للمتدربين</span>
        </div>
        <span className="create-hero-arrow">←</span>
      </Link>

      {/* My courses */}
      <div className="section-card">
        <div className="section-head">
          <h3>دوراتي ({data.recentCourses?.length || 0})</h3>
          {data.recentCourses?.length ? <Link href="/courses" className="link-btn">عرض الكل</Link> : null}
        </div>
        {!data.recentCourses?.length ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p className="muted" style={{ marginBottom: 16 }}>لا توجد دورات بعد. ابدأ بإنشاء أول دورة.</p>
            <Link href="/new-course" className="primary-btn" style={{ display: 'inline-flex', width: 'auto' }}>إنشاء دورة جديدة</Link>
          </div>
        ) : (
          <div className="course-grid">
            {data.recentCourses.map(c => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
