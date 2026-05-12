'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { formatDate } from '@/lib/utils';

type CourseSummary = {
  id: string; activityName: string | null; venue: string | null;
  startDate: string | null; endDate: string | null;
  status: string; _count: { submissions: number };
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(d => { setCourses(d.courses || []); }).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="متابعة دورة حالية">
      <div className="section-card">
        <div className="section-head"><h3>الدورات</h3></div>
        {loading ? <p>جاري التحميل...</p> : courses.length === 0 ? <p className="p-muted">لا توجد دورات بعد. ابدأ بإنشاء دورة جديدة.</p> : (
          <table className="data-table">
            <thead><tr><th>النشاط</th><th>المكان</th><th>التاريخ</th><th>المشاركون</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td>{c.activityName || '—'}</td>
                  <td>{c.venue || '—'}</td>
                  <td>{formatDate(c.startDate)} — {formatDate(c.endDate)}</td>
                  <td>{c._count.submissions}</td>
                  <td><span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`}>{c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}</span></td>
                  <td><a href={`/courses/${c.id}`} className="link-btn">تفاصيل</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
