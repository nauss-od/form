'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { CourseCard, type Course } from '@/components/CourseCard';

type DashboardData = {
  totalCourses: number; totalSubmissions: number;
  userRole: string;
  employees: Array<{
    id: string; name: string;
    _count: { courses: number }; submissionCount: number;
  }> | null;
  recentCourses: Course[];
};

function IconCourses() { return <svg viewBox="0 0 26 26" fill="none" width="22" height="22"><defs><linearGradient id="crg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="4" width="18" height="19" rx="4" fill="#014948" opacity="0.08" transform="translate(1,-1)"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="url(#crg)" strokeWidth="1.8"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="url(#crg)" opacity="0.1"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="url(#crg)" strokeWidth="1.8"/><line x1="9" y1="9" x2="17" y2="9" stroke="url(#crg)" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="13" x2="15" y2="13" stroke="url(#crg)" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconUsers() { return <svg viewBox="0 0 26 26" fill="none" width="22" height="22"><defs><linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><ellipse cx="13" cy="20" rx="10" ry="5" fill="#014948" opacity="0.06"/><ellipse cx="13" cy="14" rx="10" ry="10" fill="url(#ug)" opacity="0.06" transform="translate(0,1)"/><circle cx="9" cy="7" r="4" stroke="url(#ug)" strokeWidth="1.8"/><circle cx="17" cy="6" r="3.5" stroke="url(#ug)" strokeWidth="1.8"/><path d="M5 21c2-5 11-5 12 0" stroke="url(#ug)" strokeWidth="1.8" strokeLinecap="round"/><path d="M14 20c2-3 7-3 8 0" stroke="url(#ug)" strokeWidth="1.8" strokeLinecap="round"/></svg>; }
function IconActivity() { return <svg viewBox="0 0 26 26" fill="none" width="22" height="22"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="3" width="20" height="20" rx="6" fill="#014948" opacity="0.06" transform="translate(1,1)"/><path d="M23 12l-4 0-3 9-4-16-3 8-4-4" stroke="url(#ag)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="url(#ag)" opacity="0.08"/><circle cx="17" cy="12" r="2.5" fill="url(#ag)" opacity="0.2"/></svg>; }



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

  function removeCourse(id: string) {
    setData(prev => prev ? { ...prev, recentCourses: prev.recentCourses.filter(c => c.id !== id) } : prev);
  }

  function refreshCourse() {
    fetch('/api/courses?stats=true')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); syncRole(d.userRole); })
      .catch(() => {});
  }

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
            <div className="course-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
              {data.recentCourses.map(c => (
                <CourseCard key={c.id} c={c} onDeleted={removeCourse} onEdited={refreshCourse} />
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
          <div className="course-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            {data.recentCourses.map(c => (
              <CourseCard key={c.id} c={c} onDeleted={removeCourse} onEdited={refreshCourse} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
