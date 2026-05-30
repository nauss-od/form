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

type DashboardData = {
  totalCourses: number; totalSubmissions: number;
  userRole: string;
  employees: Array<{
    id: string; name: string;
    _count: { courses: number }; submissionCount: number;
  }> | null;
  recentCourses: Course[];
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

function IconLoc() { return <svg viewBox="0 0 26 26" fill="none" width="14" height="14"><defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><ellipse cx="13" cy="22" rx="6" ry="2" fill="#014948" opacity="0.08"/><path d="M13 2a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8z" fill="url(#lg1)" opacity="0.1"/><path d="M13 2a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8z" stroke="url(#lg1)" strokeWidth="1.5"/><circle cx="13" cy="10" r="3" fill="url(#lg1)" opacity="0.9"/></svg>; }
function IconCal() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="2" y="3" width="20" height="20" rx="4" fill="#014948" opacity="0.08" transform="translate(1,1)"/><rect x="2" y="2" width="20" height="20" rx="4" fill="url(#cg1)" opacity="0.1"/><rect x="2" y="2" width="20" height="20" rx="4" stroke="url(#cg1)" strokeWidth="1.5"/><path d="M2 9h20" stroke="url(#cg1)" strokeWidth="1.5"/><path d="M7 6V2M17 6V2" stroke="url(#cg1)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8.5" cy="13" r="1.5" fill="url(#cg1)"/><circle cx="13" cy="13" r="1.5" fill="url(#cg1)"/><circle cx="17.5" cy="13" r="1.5" fill="url(#cg1)"/></svg>; }
function IconCourses() { return <svg viewBox="0 0 26 26" fill="none" width="22" height="22"><defs><linearGradient id="crg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="4" width="18" height="19" rx="4" fill="#014948" opacity="0.08" transform="translate(1,-1)"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="url(#crg)" strokeWidth="1.8"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="url(#crg)" opacity="0.1"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="url(#crg)" strokeWidth="1.8"/><line x1="9" y1="9" x2="17" y2="9" stroke="url(#crg)" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="13" x2="15" y2="13" stroke="url(#crg)" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconUsers() { return <svg viewBox="0 0 26 26" fill="none" width="22" height="22"><defs><linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><ellipse cx="13" cy="20" rx="10" ry="5" fill="#014948" opacity="0.06"/><ellipse cx="13" cy="14" rx="10" ry="10" fill="url(#ug)" opacity="0.06" transform="translate(0,1)"/><circle cx="9" cy="7" r="4" stroke="url(#ug)" strokeWidth="1.8"/><circle cx="17" cy="6" r="3.5" stroke="url(#ug)" strokeWidth="1.8"/><path d="M5 21c2-5 11-5 12 0" stroke="url(#ug)" strokeWidth="1.8" strokeLinecap="round"/><path d="M14 20c2-3 7-3 8 0" stroke="url(#ug)" strokeWidth="1.8" strokeLinecap="round"/></svg>; }
function IconActivity() { return <svg viewBox="0 0 26 26" fill="none" width="22" height="22"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="3" width="20" height="20" rx="6" fill="#014948" opacity="0.06" transform="translate(1,1)"/><path d="M23 12l-4 0-3 9-4-16-3 8-4-4" stroke="url(#ag)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="url(#ag)" opacity="0.08"/><circle cx="17" cy="12" r="2.5" fill="url(#ag)" opacity="0.2"/></svg>; }

function IconPDF() { return <svg viewBox="0 0 26 26" fill="none" width="18" height="18"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bf3d30"/><stop offset="100%" stopColor="#8b2a1e"/></linearGradient></defs><rect x="4" y="3" width="17" height="21" rx="3" fill="#8b2a1e" opacity="0.08" transform="translate(1,0)"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#pg)" opacity="0.1"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#pg)" strokeWidth="1.8"/><polyline points="14 2 14 8 20 8" stroke="url(#pg)" strokeWidth="1.8" strokeLinejoin="round"/><text x="10" y="17" fill="url(#pg)" fontSize="5" fontWeight="800" fontFamily="Arial">PDF</text></svg>; }
function IconEML() { return <svg viewBox="0 0 26 26" fill="none" width="18" height="18"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="5" width="20" height="16" rx="3" fill="#014948" opacity="0.08" transform="translate(1,0)"/><path d="M4 7l9 6 9-6" stroke="url(#eg)" strokeWidth="1.8" strokeLinejoin="round"/><rect x="3" y="5" width="20" height="16" rx="3" fill="url(#eg)" opacity="0.08"/><rect x="3" y="5" width="20" height="16" rx="3" stroke="url(#eg)" strokeWidth="1.8"/><path d="M3 7l9 6 9-6" stroke="url(#eg)" strokeWidth="1.8" strokeLinejoin="round" fill="url(#eg)" opacity="0.12"/></svg>; }
function IconForm() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="4" y="3" width="17" height="20" rx="3" fill="#014948" opacity="0.08" transform="translate(1,0)"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#fg)" opacity="0.1"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#fg)" strokeWidth="1.5"/><polyline points="14 2 14 8 20 8" stroke="url(#fg)" strokeWidth="1.5" strokeLinejoin="round"/><line x1="9" y1="12" x2="16" y2="12" stroke="url(#fg)" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="16" x2="14" y2="16" stroke="url(#fg)" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconShield() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><path d="M12 2L4 6v5c0 6 3.5 11 8 12 4.5-1 8-6 8-12V6l-8-4z" fill="#014948" opacity="0.08" transform="translate(1,0)"/><path d="M12 2L4 6v5c0 6 3.5 11 8 12 4.5-1 8-6 8-12V6l-8-4z" fill="url(#sg)" opacity="0.1"/><path d="M12 2L4 6v5c0 6 3.5 11 8 12 4.5-1 8-6 8-12V6l-8-4z" stroke="url(#sg)" strokeWidth="1.5"/><path d="M10 13l2 2 3-4" stroke="url(#sg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
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

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="scanner-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="secondary-btn" onClick={onCancel}>إلغاء</button>
          <button className="primary-btn" style={{ background: 'var(--danger)', boxShadow: 'none' }} onClick={onConfirm}>تأكيد الحذف</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ course, onClose, onSaved }: { course: Course; onClose: () => void; onSaved: () => void }) {
  const [activityName, setActivityName] = useState(course.activityName || '');
  const [venue, setVenue] = useState(course.venue || '');
  const [startDate, setStartDate] = useState(course.startDate ? course.startDate.split('T')[0] : '');
  const [endDate, setEndDate] = useState(course.endDate ? course.endDate.split('T')[0] : '');
  const [participantCount, setParticipantCount] = useState(course.participantCount?.toString() || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityName, venue, startDate: startDate || null, endDate: endDate || null, participantCount: participantCount ? Number(participantCount) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSaved();
      onClose();
    } catch { alert('فشل الحفظ'); }
    finally { setSaving(false); }
  }

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <h3>تعديل الدورة</h3>
        <div className="edit-modal-fields">
          <div className="field"><label>اسم النشاط</label><input className="input" value={activityName} onChange={e => setActivityName(e.target.value)} /></div>
          <div className="field"><label>مقر الانعقاد</label><input className="input" value={venue} onChange={e => setVenue(e.target.value)} /></div>
          <div className="edit-row">
            <div className="field"><label>تاريخ البداية</label><input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="field"><label>تاريخ النهاية</label><input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          </div>
          <div className="field"><label>عدد المشاركين</label><input className="input" type="number" min="0" value={participantCount} onChange={e => setParticipantCount(e.target.value)} /></div>
        </div>
        <div className="confirm-actions">
          <button className="secondary-btn" onClick={onClose}>إلغاء</button>
          <button className="primary-btn" disabled={saving} onClick={handleSave}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ c, onDeleted, onEdited }: { c: Course; onDeleted: (id: string) => void; onEdited: (id: string) => void }) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const pct = coursePct(c);
  const target = c.participantCount || c._count.submissions;

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${c.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      onDeleted(c.id);
    } catch { alert('فشل الحذف'); }
    finally { setDeleting(false); setShowDelete(false); }
  }

  return (
    <div className="course-card">
      {showDelete && <ConfirmDialog message={`هل أنت متأكد من حذف "${c.activityName || 'الدورة'}"؟`} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
      {showEdit && <EditModal course={c} onClose={() => setShowEdit(false)} onSaved={() => onEdited(c.id)} />}
      <div className="course-card-top">
        <div>
          <span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`}>
            {c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}
          </span>
          <strong className="course-card-title">{c.activityName || 'دورة تدريبية'}</strong>
          <div className="course-card-meta">
            <span><IconLoc /> {c.venue || '—'}</span>
            <span><IconCal /> {formatDate(c.startDate)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
          <div className="course-card-figure">
            <div className="big-stat">{c._count.submissions}</div>
            <div className="big-stat-label">/ {target}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="secondary-btn" style={{ minHeight: 34, padding: '0 10px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => setShowEdit(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              تعديل
            </button>
            <button className="secondary-btn" style={{ minHeight: 34, padding: '0 10px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(191,61,48,0.08)', color: 'var(--danger)', borderColor: 'rgba(191,61,48,0.12)' }} onClick={() => setShowDelete(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              حذف
            </button>
          </div>
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [managerMode, setManagerMode] = useState<boolean | null>(null);

  function syncRole(apiRole: string) {
    const saved = localStorage.getItem('nauss-active-role');
    setManagerMode(apiRole === 'MANAGER' ? saved !== 'EMPLOYEE' : false);
  }

  useEffect(() => {
    fetch('/api/courses?stats=true')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); syncRole(d.userRole); })
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => { if (data) syncRole(data.userRole); };
    window.addEventListener('nauss-role-change', handler);
    return () => window.removeEventListener('nauss-role-change', handler);
  }, [data]);

  if (loading) return <AppShell title="لوحة المستخدم"><div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div></AppShell>;
  if (!data) return null;

  const isManager = data.userRole === 'MANAGER';
  const showManagerView = isManager && managerMode === true;
  const appRole = isManager ? 'MANAGER' : 'EMPLOYEE';

  function removeCourse(id: string) {
    setData(prev => prev ? { ...prev, recentCourses: prev.recentCourses.filter(c => c.id !== id) } : prev);
  }

  function refreshCourse() {
    fetch('/api/courses?stats=true')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); syncRole(d.userRole); })
      .catch(() => {});
  }

  if (showManagerView) {
    const emp = data.employees || [];
    return (
      <AppShell title="لوحة المدير" role={appRole}>
        <div className="kpi-grid">
          <div className="kpi-card">
            <span><IconCourses /> إجمالي الدورات</span>
            <strong>{data.totalCourses}</strong>
          </div>
          <div className="kpi-card">
            <span><IconUsers /> إجمالي المسجلين</span>
            <strong>{data.totalSubmissions}</strong>
          </div>
          <div className="kpi-card">
            <span><IconUsers /> عدد الموظفين</span>
            <strong>{emp.length}</strong>
          </div>
          <div className="kpi-card">
            <span><IconActivity /> موظفون نشطون</span>
            <strong>{emp.filter(e => e._count.courses > 0).length}</strong>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head"><h3>جميع الدورات ({data.recentCourses?.length || 0})</h3></div>
          {!data.recentCourses?.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <p>لا توجد دورات بعد</p>
            </div>
          ) : (
            <div className="course-grid" style={{ marginTop: 0 }}>
              {data.recentCourses.map(c => (
                <CourseCard key={c.id} c={c} onDeleted={removeCourse} onEdited={refreshCourse} />
              ))}
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="لوحة المستخدم" role={appRole}>
      {/* Hero create button */}
      <Link href="/new-course" className="create-hero">
        <div className="create-hero-icon">＋</div>
        <div>
          <strong>إنشاء دورة جديدة</strong>
          <span>احصل على رابط وأرسله للمتدربين</span>
        </div>
        <span className="create-hero-arrow">←</span>
      </Link>

      {/* My courses */}
      <div className="section-card">
        <div className="section-head">
          <h3>دوراتي ({data.recentCourses?.length || 0})</h3>
          {data.recentCourses?.length ? <Link href="/courses" className="link-btn">عرض الكل</Link> : null}
        </div>
        {!data.recentCourses?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <p>لا توجد دورات بعد. ابدأ بإنشاء أول دورة.</p>
            <Link href="/new-course" className="primary-btn" style={{ display: 'inline-flex', width: 'auto', marginTop: 8 }}>إنشاء دورة جديدة</Link>
          </div>
        ) : (
          <div className="course-grid">
            {data.recentCourses.map(c => (
              <CourseCard key={c.id} c={c} onDeleted={removeCourse} onEdited={refreshCourse} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
