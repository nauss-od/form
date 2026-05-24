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
        <a href={`/api/export/${c.id}/excel`} className="ghost-btn" style={{ minHeight: 38, fontSize: '0.82rem' }}>Excel</a>
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
      {loading ? <p>جاري التحميل...</p> : courses.length === 0 ? (
        <div className="section-card">
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p className="muted" style={{ marginBottom: 16 }}>لا توجد دورات بعد.</p>
            <Link href="/new-course" className="primary-btn" style={{ display: 'inline-flex', width: 'auto' }}>إنشاء دورة جديدة</Link>
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
