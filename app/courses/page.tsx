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
function insuranceUrl(c: Course): string {
  return `${window.location.origin}/public/insurance/${c.id}`;
}

function IconLoc() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function IconCal() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }

function IconPDF() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IconEML() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function IconForm() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IconShield() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IconCopy() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function IconCheck() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }

function CopyLink({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(url).then(() => { setOk(true); setTimeout(() => setOk(false), 1200); }); }}
      style={{ background: ok ? '#dff0ee' : 'transparent', border: 'none', cursor: 'pointer', padding: '3px 4px', borderRadius: 5, display: 'inline-flex', color: ok ? '#0a7d5c' : '#c2d0d0', transition: 'all 0.15s' }}>
      {ok ? <IconCheck /> : <IconCopy />}
    </button>
  );
}

function LinkRow({ label, url, icon }: { label: string; url: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: '#f7fafa', borderRadius: 10, border: '1px solid #e4ebeb', padding: '6px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
        {icon}
        <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#667777' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ flex: 1, fontSize: '0.66rem', color: '#014948', direction: 'ltr', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
        <CopyLink url={url} />
      </div>
    </div>
  );
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
      <div style={{ padding: '0 16px 4px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <LinkRow label="رابط النموذج" url={courseUrl(c)} icon={<IconForm />} />
        <LinkRow label="رابط التأمين" url={insuranceUrl(c)} icon={<IconShield />} />
      </div>
      <div className="course-card-actions">
        <Link href={`/courses/${c.id}`} className="secondary-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>عرض</Link>
        <a href={`/api/export/${c.id}/pdf`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }} title="تصدير PDF"><IconPDF /></a>
        <a href={`/api/export/${c.id}/eml`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }} title="تصدير EML"><IconEML /></a>
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
