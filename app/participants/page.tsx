'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  venue: string;
  startDate: string;
  endDate: string;
  _count?: { submissions: number };
}

export default function ParticipantsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'MANAGER' | 'EMPLOYEE'>('EMPLOYEE');
  const [forceManager, setForceManager] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('activeRole') as 'MANAGER' | 'EMPLOYEE' | null;
    if (stored) setRole(stored);
    const fm = localStorage.getItem('forceManager') === 'true';
    setForceManager(fm);

    fetch('/api/courses')
      .then(r => r.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : data.courses ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppShell title="قائمة المشاركين" role={role} forceManager={forceManager}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1b4f6b', margin: 0 }}>قائمة المشاركين</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
            تحميل قائمة المشاركين PDF باللغة الإنجليزية لكل دورة
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: 12 }}>
            لا توجد دورات حتى الآن
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map(c => (
              <div key={c.id} style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{c.title}</div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    {c.venue && <span style={{ marginLeft: 12 }}>📍 {c.venue}</span>}
                    {c.startDate && (
                      <span>
                        {new Date(c.startDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {c.endDate && ` — ${new Date(c.endDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                      </span>
                    )}
                  </div>
                  {c._count?.submissions != null && (
                    <div style={{ color: '#0ea5e9', fontSize: 12, marginTop: 4 }}>
                      {c._count.submissions} مشارك
                    </div>
                  )}
                </div>
                <a
                  href={`/api/export/${c.id}/participants-list`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#1b4f6b',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  تحميل PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
