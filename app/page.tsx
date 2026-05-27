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

function IconLoc() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function IconCal() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconCourses() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function IconUsers() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IconActivity() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }

function CourseCard({ c }: { c: Course }) {
  const pct = coursePct(c);
  const target = c.participantCount || c._count.submissions;
  return (
    <div className="course-card">
      <div className="course-card-top">
        <div>
          <span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`}>
            {c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}
          </span>
          <strong className="course-card-title">{c.activityName || 'دورة تدريبية'}</strong>
          <div className="course-card-meta">
            <span><IconLoc /> {c.venue || '—'}</span>
            <span><IconCal /> {formatDate(c.startDate)}</span>
          </div>
        </div>
        <div className="course-card-figure">
          <div className="big-stat">{c._count.submissions}</div>
          <div className="big-stat-label">/ {target}</div>
        </div>
      </div>
      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="course-card-actions">
        <Link href={`/courses/${c.id}`} className="secondary-btn">عرض</Link>
        <button className="ghost-btn" onClick={() => { navigator.clipboard.writeText(courseUrl(c)); alert('تم نسخ الرابط'); }}>نسخ الرابط</button>
        <a href={`/api/export/${c.id}/word`} className="ghost-btn">Word</a>
        <a href={`/api/export/${c.id}/excel`} className="ghost-btn">Excel</a>
        <a href={`/api/export/${c.id}/eml`} className="ghost-btn">EML</a>
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

  if (loading) return <AppShell title="لوحة المستخدم"><div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div></AppShell>;
  if (!data) return null;

  const isManager = data.userRole === 'MANAGER';
  const showManagerView = isManager && managerMode === true;
  const appRole = isManager ? 'MANAGER' : 'EMPLOYEE';

  if (showManagerView) {
    const emp = data.employees || [];
    return (
      <AppShell title="لوحة المدير" role={appRole}>
        <div className="kpi-grid">
          <div className="kpi-card">
            <span><IconCourses /> إجمالي الدورات</span>
            <strong>{data.totalCourses}</strong>
          </div>
          <div className="kpi-card">
            <span><IconUsers /> إجمالي المسجلين</span>
            <strong>{data.totalSubmissions}</strong>
          </div>
          <div className="kpi-card">
            <span><IconUsers /> عدد الموظفين</span>
            <strong>{emp.length}</strong>
          </div>
          <div className="kpi-card">
            <span><IconActivity /> موظفون نشطون</span>
            <strong>{emp.filter(e => e._count.courses > 0).length}</strong>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head"><h3>جميع الدورات ({data.recentCourses?.length || 0})</h3></div>
          {!data.recentCourses?.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <p>لا توجد دورات بعد</p>
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
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <p>لا توجد دورات بعد. ابدأ بإنشاء أول دورة.</p>
            <Link href="/new-course" className="primary-btn" style={{ display: 'inline-flex', width: 'auto', marginTop: 8 }}>إنشاء دورة جديدة</Link>
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
