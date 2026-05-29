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

function IconLoc() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function IconCal() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconUser() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>; }

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

  if (loading) return <AppShell title="تفاصيل الدورة"><div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div></AppShell>;
  if (!course || !course.submissions) return <AppShell title="خطأ"><div className="empty-state"><p>الدورة غير موجودة</p></div></AppShell>;

  const completed = course.submissions.length;
  const total = course.participantCount || completed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <AppShell title={course.activityName || 'تفاصيل الدورة'}>
      <div className="course-hero">
        <div className="course-hero-main">
          <div className="course-hero-info">
            <span className={`status-chip ${course.status === 'PUBLISHED' ? 'is-open' : ''}`} style={{ marginBottom: 8 }}>
              {course.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}
            </span>
            <h2>{course.activityName || 'دورة تدريبية'}</h2>
            <div className="course-meta">
              <span><IconLoc /> {course.venue || '—'}</span>
              <span><IconCal /> {formatDate(course.startDate)} — {formatDate(course.endDate)}</span>
              <span><IconUser /> {course.createdBy?.name || '—'}</span>
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
              <div className="section-actions" style={{ marginTop: 8 }}>
                <button className="secondary-btn" onClick={() => { navigator.clipboard.writeText(publicUrl); alert('تم نسخ الرابط'); }}>نسخ الرابط</button>
                <a href={`/api/export/${course.id}/word`} className="secondary-btn">Word</a>
                <a href={`/api/export/${course.id}/pdf`} className="secondary-btn">PDF</a>
                <a href={`/api/export/${course.id}/eml`} className="secondary-btn">EML</a>
                <a href={`/insurance/${course.id}`} className="secondary-btn" style={{ background: '#016564', color: '#fff' }}>تأمين</a>
                <a href={`/public/insurance/${course.id}`} className="secondary-btn" style={{ background: '#014948', color: '#d0b284', border: '1px solid #d0b284' }}>رابط التأمين العام</a>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="data-table-wrap" style={{ marginTop: 20 }}>
        <div className="section-card">
          <div className="section-head">
            <h3>الاستجابات ({completed})</h3>
          </div>
          {completed === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <p>لا توجد استجابات بعد. أرسل الرابط للمشاركين.</p>
            </div>
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
                    <td className="td-title"><strong>{s.fullNamePassport}</strong></td>
                    <td>{s.passportNumber}</td>
                    <td>{formatDate(s.passportExpiry)}</td>
                    <td>{s.nationalId}</td>
                    <td dir="ltr">{s.mobile}</td>
                    <td>{formatDate(s.birthDate)}</td>
                    <td style={{ fontSize: 11, direction: 'ltr' }}>{s.iban}</td>
                    <td>
                      {s.files?.map(f => (
                        <a key={f.id} href={`/api/files/${f.id}`} target="_blank" className="file-link">
                          {f.fileType === 'PASSPORT' ? '📄 جواز' : '🪪 هوية'}
                        </a>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
