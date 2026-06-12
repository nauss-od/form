'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { CourseCard, type Course } from '@/components/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    fetch('/api/courses')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        setCourses(d.courses || []);
      })
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
    fetch('/api/courses?stats=true')
      .then(r => r.json())
      .then(d => setRole(d.userRole || ''))
      .catch(() => {});
  }, []);

  function removeCourse(id: string) {
    setCourses(prev => prev.filter(c => c.id !== id));
  }

  function refreshCourse() {
    fetch('/api/courses').then(r => r.json()).then(d => setCourses(d.courses || [])).catch(() => {});
  }

  const totalSubmissions = courses.reduce((a, c) => a + (c.insuredCount ?? c._count.submissions), 0);
  const activeCourses = courses.filter(c => c.status === 'PUBLISHED').length;

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
        <>
          <div className="section-card" style={{ padding: '18px 22px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--nauss-green-dark)' }}>{courses.length}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--nauss-muted)', fontWeight: 600 }}>إجمالي الدورات</span>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--nauss-line)' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--nauss-green-dark)' }}>{totalSubmissions}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--nauss-muted)', fontWeight: 600 }}>إجمالي المسجلين</span>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--nauss-line)' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--nauss-green-dark)' }}>{activeCourses}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--nauss-muted)', fontWeight: 600 }}>دورات نشطة</span>
            </div>
          </div>
          <div className="course-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            {courses.map(c => (
              <CourseCard key={c.id} c={c} onDeleted={removeCourse} onEdited={refreshCourse} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
