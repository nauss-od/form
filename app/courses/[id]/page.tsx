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
type CourseOption = { id: string; activityName: string | null; status: string };

function IconLoc() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><ellipse cx="13" cy="22" rx="6" ry="2" fill="#014948" opacity="0.08"/><path d="M13 2a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8z" fill="url(#lg1)" opacity="0.1"/><path d="M13 2a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8z" stroke="url(#lg1)" strokeWidth="1.5"/><circle cx="13" cy="10" r="3" fill="url(#lg1)" opacity="0.9"/></svg>; }
function IconCal() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="2" y="3" width="20" height="20" rx="4" fill="#014948" opacity="0.08" transform="translate(1,1)"/><rect x="2" y="2" width="20" height="20" rx="4" fill="url(#cg1)" opacity="0.1"/><rect x="2" y="2" width="20" height="20" rx="4" stroke="url(#cg1)" strokeWidth="1.5"/><path d="M2 9h20" stroke="url(#cg1)" strokeWidth="1.5"/><path d="M7 6V2M17 6V2" stroke="url(#cg1)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8.5" cy="13" r="1.5" fill="url(#cg1)"/><circle cx="13" cy="13" r="1.5" fill="url(#cg1)"/><circle cx="17.5" cy="13" r="1.5" fill="url(#cg1)"/></svg>; }
function IconUser() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="ug1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><ellipse cx="13" cy="22" rx="6" ry="2" fill="#014948" opacity="0.06"/><circle cx="13" cy="9" r="5" stroke="url(#ug1)" strokeWidth="1.5"/><circle cx="13" cy="9" r="5" fill="url(#ug1)" opacity="0.06"/><path d="M5 22c2-6 16-6 16 0" stroke="url(#ug1)" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconPDF() { return <svg viewBox="0 0 26 26" fill="none" width="18" height="18"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bf3d30"/><stop offset="100%" stopColor="#8b2a1e"/></linearGradient></defs><rect x="4" y="3" width="17" height="21" rx="3" fill="#8b2a1e" opacity="0.08" transform="translate(1,0)"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#pg)" opacity="0.1"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#pg)" strokeWidth="1.8"/><polyline points="14 2 14 8 20 8" stroke="url(#pg)" strokeWidth="1.8" strokeLinejoin="round"/><text x="10" y="17" fill="url(#pg)" fontSize="5" fontWeight="800" fontFamily="Arial">PDF</text></svg>; }
function IconEML() { return <svg viewBox="0 0 26 26" fill="none" width="18" height="18"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="5" width="20" height="16" rx="3" fill="#014948" opacity="0.08" transform="translate(1,0)"/><rect x="3" y="5" width="20" height="16" rx="3" fill="url(#eg)" opacity="0.08"/><rect x="3" y="5" width="20" height="16" rx="3" stroke="url(#eg)" strokeWidth="1.8"/><path d="M3 7l9 6 9-6" stroke="url(#eg)" strokeWidth="1.8" strokeLinejoin="round" fill="url(#eg)" opacity="0.12"/></svg>; }
function IconPassport() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="2" width="18" height="22" rx="3" fill="#014948" opacity="0.08"/><rect x="3" y="2" width="18" height="22" rx="3" stroke="url(#pp)" strokeWidth="1.5" fill="#014948" opacity="0.05"/><circle cx="12" cy="10" r="3" stroke="url(#pp)" strokeWidth="1.3"/><path d="M7 19c2-3 10-3 10 0" stroke="url(#pp)" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconID() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="idg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="4" width="20" height="18" rx="3" fill="#014948" opacity="0.08"/><rect x="3" y="4" width="20" height="18" rx="3" stroke="url(#idg)" strokeWidth="1.5" fill="#014948" opacity="0.05"/><line x1="8" y1="10" x2="13" y2="10" stroke="url(#idg)" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="14" x2="16" y2="14" stroke="url(#idg)" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="18" x2="12" y2="18" stroke="url(#idg)" strokeWidth="1.5" strokeLinecap="round"/></svg>; }

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicUrl, setPublicUrl] = useState('');
  const [deletingParticipant, setDeletingParticipant] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [moveModal, setMoveModal] = useState<{ submissionId: string; name: string } | null>(null);
  const [allCourses, setAllCourses] = useState<CourseOption[]>([]);
  const [targetCourseId, setTargetCourseId] = useState('');
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState('');

  useEffect(() => {
    fetch(`/api/courses/${params.id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setCourse(d))
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d?.role === 'MANAGER') setIsManager(true); })
      .catch(() => {});
  }, [params.id]);

  function openMoveModal(submissionId: string, name: string) {
    setMoveModal({ submissionId, name });
    setTargetCourseId('');
    setMoveError('');
    if (allCourses.length === 0) {
      fetch('/api/courses')
        .then(r => r.json())
        .then((data: { courses?: CourseOption[] }) => setAllCourses((data.courses ?? []).filter(c => c.id !== params.id && c.status === 'PUBLISHED')))
        .catch(() => {});
    }
  }

  async function handleMove() {
    if (!moveModal || !targetCourseId) return;
    setMoving(true);
    setMoveError('');
    try {
      const res = await fetch(`/api/participant/${moveModal.submissionId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCourseId }),
      });
      const data = await res.json();
      if (!res.ok) { setMoveError(data.message || 'حدث خطأ'); return; }
      setCourse(prev => prev ? { ...prev, submissions: prev.submissions.filter(s => s.id !== moveModal.submissionId) } : prev);
      setMoveModal(null);
    } catch { setMoveError('حدث خطأ في الاتصال'); }
    finally { setMoving(false); }
  }

  useEffect(() => {
    if (course) setPublicUrl(`${window.location.origin}/public/form/${course.publicToken}`);
  }, [course]);

  async function deleteParticipant(submissionId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;
    setDeletingParticipant(submissionId);
    try {
      const res = await fetch(`/api/participant/${submissionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCourse(prev => prev ? { ...prev, submissions: prev.submissions.filter(s => s.id !== submissionId) } : prev);
    } catch { alert('فشل حذف المشارك'); }
    finally { setDeletingParticipant(null); }
  }

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
                <button className="secondary-btn" onClick={() => { navigator.clipboard.writeText(publicUrl); alert('تم نسخ الرابط'); }}>نسخ رابط المشاركين</button>
                <button className="secondary-btn" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/public/insurance/${course.id}`); alert('تم نسخ رابط التأمين'); }}>نسخ رابط التأمين</button>
                <a href={`/api/export/${course.id}/pdf`} className="secondary-btn">تصدير PDF</a>
                <a href={`mailto:?subject=${encodeURIComponent('طلب إصدار تأمين طبي — ' + (course.activityName || 'دورة خارجية'))}&body=${encodeURIComponent(
                  'السلام عليكم ورحمة الله وبركاته،\n\n' +
                  'نرفق لكم بيانات المشاركين في الدورة التدريبية أدناه، ونأمل منكم التكرم بإصدار التأمين الطبي لهم.\n\n' +
                  'بيانات الدورة:\n' +
                  `- اسم النشاط: ${course.activityName || '—'}\n` +
                  `- مقر الانعقاد: ${course.venue || '—'}\n` +
                  `- تاريخ البداية: ${formatDate(course.startDate)}\n` +
                  `- تاريخ النهاية: ${formatDate(course.endDate)}\n` +
                  `- عدد المشاركين: ${course.submissions.length}\n\n` +
                  `رابط التأمين: ${typeof window !== 'undefined' ? window.location.origin : ''}/public/insurance/${course.id}\n\n` +
                  'وتفضلوا بقبول فائق الاحترام'
                )}`} className="secondary-btn">ارسال بالبريد</a>
                <a href={`/insurance/${course.id}`} className="secondary-btn">مراجعة التأمين</a>
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
                    <td style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {s.files?.map(f => (
                        <a key={f.id} href={`/api/files/${f.id}`} target="_blank" className="file-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {f.fileType === 'PASSPORT' ? <><IconPassport /> جواز</> : <><IconID /> هوية</>}
                        </a>
                      ))}
                      {isManager && (
                        <button onClick={() => openMoveModal(s.id, s.fullNamePassport)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#016564', opacity: 0.5, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                          title="نقل إلى دورة أخرى">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                        </button>
                      )}
                      <button onClick={() => deleteParticipant(s.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: 'auto', color: '#bf3d30', opacity: 0.5, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                        title="حذف المشارك">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Move participant modal */}
      {moveModal && (
        <div onClick={() => setMoveModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#014948', fontSize: '1rem' }}>نقل مشارك</h3>
            <p style={{ margin: '0 0 16px', color: '#667', fontSize: '0.85rem' }}>{moveModal.name}</p>
            {allCourses.length === 0 ? (
              <p style={{ color: '#889', fontSize: '0.85rem' }}>جاري تحميل الدورات...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
                {allCourses.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${targetCourseId === c.id ? '#016564' : '#d8eaea'}`, background: targetCourseId === c.id ? '#f0faf9' : '#fafffe', cursor: 'pointer' }}>
                    <input type="radio" name="target" value={c.id} checked={targetCourseId === c.id} onChange={() => setTargetCourseId(c.id)} style={{ accentColor: '#016564' }} />
                    <span style={{ fontSize: '0.88rem', color: '#014948', fontWeight: 600 }}>{c.activityName || c.id}</span>
                  </label>
                ))}
              </div>
            )}
            {moveError && <p style={{ color: '#bf3d30', fontSize: '0.83rem', margin: '0 0 12px' }}>{moveError}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setMoveModal(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #d8eaea', background: '#f5fafa', color: '#445', cursor: 'pointer', fontWeight: 600 }}>إلغاء</button>
              <button onClick={handleMove} disabled={!targetCourseId || moving} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: targetCourseId && !moving ? '#014948' : '#b2d8d7', color: '#fff', cursor: targetCourseId && !moving ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
                {moving ? 'جاري النقل...' : 'نقل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
