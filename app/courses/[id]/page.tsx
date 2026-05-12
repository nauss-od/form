'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { formatDate } from '@/lib/utils';

type SubmissionFile = { id: string; fileType: string; fileUrl: string; fileName: string };
type Submission = {
  id: string; fullNamePassport: string; passportNumber: string;
  passportExpiry: string; nationalId: string; mobile: string;
  birthDate: string; iban: string; createdAt: string; files: SubmissionFile[];
};
type CourseDetail = {
  id: string; activityName: string | null; venue: string | null;
  startDate: string | null; endDate: string | null; participantCount: number | null;
  publicToken: string; status: string; createdBy: { name: string };
  submissions: Submission[];
};

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    fetch(`/api/courses/${params.id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setCourse(d))
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (course) setPublicUrl(`${window.location.origin}/public/form/${course.publicToken}`);
  }, [course]);

  if (loading) return <AppShell title="تفاصيل الدورة"><p>جاري التحميل...</p></AppShell>;
  if (!course || !course.submissions) return <AppShell title="خطأ"><p>الدورة غير موجودة</p></AppShell>;

  const completed = course.submissions.length;
  const total = course.participantCount || completed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <AppShell title={course.activityName || 'تفاصيل الدورة'}>
      {/* Course Info + Progress */}
      <div className="course-hero">
        <div className="course-hero-main">
          <div className="course-hero-info">
            <span className={`status-chip ${course.status === 'PUBLISHED' ? 'is-open' : ''}`} style={{ marginBottom: 8 }}>
              {course.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}
            </span>
            <h2>{course.activityName || 'دورة تدريبية'}</h2>
            <div className="course-meta">
              <span>📍 {course.venue || '—'}</span>
              <span>📅 {formatDate(course.startDate)} — {formatDate(course.endDate)}</span>
              <span>👤 {course.createdBy?.name || '—'}</span>
            </div>
          </div>
          <div className="course-hero-progress">
            <div className="big-stat">{completed}</div>
            <div className="big-stat-label">من أصل {total} مشارك</div>
            <div className="progress-bar-lg">
              <div className="progress-fill-lg" style={{ width: `${pct}%` }} />
            </div>
            <div className="big-pct">{pct}%</div>
          </div>
        </div>

        <div className="course-actions" style={{ marginTop: 16 }}>
          {publicUrl ? (
            <>
              <div className="link-preview" dir="ltr">{publicUrl}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <button className="secondary-btn" onClick={() => { navigator.clipboard.writeText(publicUrl); alert('تم نسخ الرابط'); }}>نسخ الرابط</button>
                <a href={`/api/export/${course.id}/word`} className="secondary-btn">📄 تصدير Word</a>
                <a href={`/api/export/${course.id}/eml`} className="secondary-btn">✉️ تنزيل EML</a>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Submissions */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="section-head">
          <h3>الاستجابات ({completed})</h3>
        </div>
        {completed === 0 ? (
          <p className="p-muted">لا توجد استجابات بعد. أرسل الرابط للمشاركين.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>م</th><th>الاسم</th><th>رقم الجواز</th><th>انتهاء الجواز</th>
                <th>الهوية</th><th>الجوال</th><th>تاريخ الميلاد</th><th>IBAN</th><th>المرفقات</th>
              </tr>
            </thead>
            <tbody>
              {course.submissions.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><strong>{s.fullNamePassport}</strong></td>
                  <td>{s.passportNumber}</td>
                  <td>{formatDate(s.passportExpiry)}</td>
                  <td>{s.nationalId}</td>
                  <td dir="ltr">{s.mobile}</td>
                  <td>{formatDate(s.birthDate)}</td>
                  <td style={{ fontSize: 11, direction: 'ltr' }}>{s.iban}</td>
                  <td>
                    {s.files?.some(f => f.fileType === 'PASSPORT') ? '📷' : ''}
                    {s.files?.some(f => f.fileType === 'NATIONAL_ID') ? '🆔' : ''}
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
