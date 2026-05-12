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
    fetch(`/api/courses/${params.id}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(d => setCourse(d)).catch(() => { window.location.href = '/login'; }).finally(() => setLoading(false));
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
      <div className="section-card">
        <div className="section-head">
          <div><h3>بيانات الدورة</h3></div>
          <span className={`status-chip ${course.status === 'PUBLISHED' ? 'is-open' : ''}`}>{course.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}</span>
        </div>
        <div className="form-grid">
          <div className="field"><label>اسم النشاط</label><span>{course.activityName || '—'}</span></div>
          <div className="field"><label>مقر الانعقاد</label><span>{course.venue || '—'}</span></div>
          <div className="field"><label>تاريخ البداية</label><span>{formatDate(course.startDate)}</span></div>
          <div className="field"><label>تاريخ النهاية</label><span>{formatDate(course.endDate)}</span></div>
          <div className="field"><label>إعداد</label><span>{course.createdBy?.name || '—'}</span></div>
        </div>

        <div className="progress-section">
          <div className="progress-info"><span>نسبة اكتمال التعبئة</span><strong>{completed} / {total} ({pct}%)</strong></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label className="label">رابط النموذج</label>
          <div className="link-preview" dir="ltr">{publicUrl}</div>
        </div>
        <div className="hero-actions" style={{ marginTop: 12 }}>
          <button className="secondary-btn" onClick={() => { navigator.clipboard.writeText(publicUrl); alert('تم نسخ الرابط'); }}>نسخ الرابط</button>
          <a href={`/api/export/${course.id}/word`} className="secondary-btn">تصدير Word</a>
          <a href={`/api/export/${course.id}/eml`} className="secondary-btn">تصدير EML</a>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head"><h3>الاستجابات ({completed})</h3></div>
        {completed === 0 ? <p className="p-muted">لا توجد استجابات بعد. أرسل الرابط للمشاركين.</p> : (
          <table className="data-table">
            <thead><tr>
              <th>م</th><th>الاسم</th><th>رقم الجواز</th><th>انتهاء الجواز</th><th>الهوية</th><th>الجوال</th><th>تاريخ الميلاد</th><th>IBAN</th><th>المرفقات</th>
            </tr></thead>
            <tbody>
              {course.submissions.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.fullNamePassport}</td>
                  <td>{s.passportNumber}</td>
                  <td>{formatDate(s.passportExpiry)}</td>
                  <td>{s.nationalId}</td>
                  <td>{s.mobile}</td>
                  <td>{formatDate(s.birthDate)}</td>
                  <td style={{ fontSize: 12 }}>{s.iban}</td>
                  <td>{s.files?.filter(f => f.fileType === 'PASSPORT').length > 0 ? '📷' : ''} {s.files?.filter(f => f.fileType === 'NATIONAL_ID').length > 0 ? '🆔' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
