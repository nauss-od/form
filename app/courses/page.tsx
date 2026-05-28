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
            <span><IconLoc /> {c.venue || '—'}</span>
            <span><IconCal /> {formatDate(c.startDate)}</span>
          </div>
        </div>
        <div className="course-card-figure">
          <div className="big-stat">{c._count.submissions}</div>
          <div className="big-stat-label">/ {target}</div>
        </div>
      </div>
      <div className="progress-section" style={{ padding: '2px 0' }}>
        <div className="progress-bar" style={{ margin: 0 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="course-card-actions">
        <Link href={`/courses/${c.id}`} className="secondary-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>عرض</Link>
        <button className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }} onClick={() => { navigator.clipboard.writeText(courseUrl(c)); alert('تم نسخ الرابط'); }}>نسخ الرابط</button>
        <a href={`/api/export/${c.id}/word`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>Word</a>
        <a href={`/api/export/${c.id}/pdf`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>PDF</a>
        <a href={`/api/export/${c.id}/eml`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>EML</a>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    fetch('/api/courses')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        const roleFromApi = d.courses?.[0]?.createdBy ? 'MANAGER' : 'EMPLOYEE';
        setCourses(d.courses || []);
      })
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
    fetch('/api/courses?stats=true')
      .then(r => r.json())
      .then(d => setRole(d.userRole || ''))
      .catch(() => {});
  }, []);

  return (
    <AppShell title="الدورات" role={role}>
      {loading ? <div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div> : courses.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <p>لا توجد دورات بعد.</p>
            <Link href="/new-course" className="primary-btn" style={{ display: 'inline-flex', width: 'auto', marginTop: 8 }}>إنشاء دورة جديدة</Link>
          </div>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(c => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
