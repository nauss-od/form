'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export type Course = {
  id: string; activityName: string | null; venue: string | null;
  startDate: string | null; endDate: string | null;
  participantCount: number | null; publicToken: string;
  status: string; _count: { submissions: number };
  createdBy: { name: string };
};

function IconLoc() { return <svg viewBox="0 0 26 26" fill="none" width="14" height="14"><defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><ellipse cx="13" cy="22" rx="6" ry="2" fill="#014948" opacity="0.08"/><path d="M13 2a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8z" fill="url(#lg1)" opacity="0.1"/><path d="M13 2a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8z" stroke="url(#lg1)" strokeWidth="1.5"/><circle cx="13" cy="10" r="3" fill="url(#lg1)" opacity="0.9"/></svg>; }
function IconCal() { return <svg viewBox="0 0 26 26" fill="none" width="15" height="15"><defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="2" y="3" width="20" height="20" rx="4" fill="#014948" opacity="0.08" transform="translate(1,1)"/><rect x="2" y="2" width="20" height="20" rx="4" fill="url(#cg1)" opacity="0.1"/><rect x="2" y="2" width="20" height="20" rx="4" stroke="url(#cg1)" strokeWidth="1.5"/><path d="M2 9h20" stroke="url(#cg1)" strokeWidth="1.5"/><path d="M7 6V2M17 6V2" stroke="url(#cg1)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8.5" cy="13" r="1.5" fill="url(#cg1)"/><circle cx="13" cy="13" r="1.5" fill="url(#cg1)"/><circle cx="17.5" cy="13" r="1.5" fill="url(#cg1)"/></svg>; }
function IconPDF() { return <svg viewBox="0 0 26 26" fill="none" width="18" height="18"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bf3d30"/><stop offset="100%" stopColor="#8b2a1e"/></linearGradient></defs><rect x="4" y="3" width="17" height="21" rx="3" fill="#8b2a1e" opacity="0.08" transform="translate(1,0)"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#pg)" opacity="0.1"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#pg)" strokeWidth="1.8"/><polyline points="14 2 14 8 20 8" stroke="url(#pg)" strokeWidth="1.8" strokeLinejoin="round"/><text x="10" y="17" fill="url(#pg)" fontSize="5" fontWeight="800" fontFamily="Arial">PDF</text></svg>; }
function IconEML() { return <svg viewBox="0 0 26 26" fill="none" width="18" height="18"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs><rect x="3" y="5" width="20" height="16" rx="3" fill="#014948" opacity="0.08" transform="translate(1,0)"/><rect x="3" y="5" width="20" height="16" rx="3" fill="url(#eg)" opacity="0.08"/><rect x="3" y="5" width="20" height="16" rx="3" stroke="url(#eg)" strokeWidth="1.8"/><path d="M3 7l9 6 9-6" stroke="url(#eg)" strokeWidth="1.8" strokeLinejoin="round" fill="url(#eg)" opacity="0.12"/></svg>; }
function IconCopy() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function IconCheck() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }

export function coursePct(c: Course): number {
  const target = c.participantCount || 0;
  const subs = c._count.submissions;
  return target > 0 ? Math.round((subs / target) * 100) : subs > 0 ? 100 : 0;
}

export function courseUrl(c: Course): string {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/public/form/${c.publicToken}`;
}
export function insuranceUrl(c: Course): string {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/public/insurance/${c.id}`;
}

export function mailtoHref(c: Course): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const subject = encodeURIComponent(`طلب إصدار تأمين طبي — ${c.activityName || 'دورة خارجية'}`);
  const body = encodeURIComponent(
    `السلام عليكم ورحمة الله وبركاته،\n\n` +
    `نرفق لكم بيانات المشاركين في الدورة التدريبية أدناه، ونأمل منكم التكرم بإصدار التأمين الطبي لهم.\n\n` +
    `بيانات الدورة:\n` +
    `- اسم النشاط: ${c.activityName || '—'}\n` +
    `- مقر الانعقاد: ${c.venue || '—'}\n` +
    `- تاريخ البداية: ${formatDate(c.startDate)}\n` +
    `- تاريخ النهاية: ${formatDate(c.endDate)}\n` +
    `- عدد المشاركين: ${c._count.submissions}\n\n` +
    `رابط التأمين: ${origin}/public/insurance/${c.id}\n\n` +
    `وتفضلوا بقبول فائق الاحترام`
  );
  return `mailto:?subject=${subject}&body=${body}`;
}

function CopyLink({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(url).then(() => { setOk(true); setTimeout(() => setOk(false), 1200); }); }}
      style={{ background: ok ? '#dff0ee' : 'transparent', border: 'none', cursor: 'pointer', padding: '3px 4px', borderRadius: 5, display: 'inline-flex', color: ok ? '#0a7d5c' : '#c2d0d0', transition: 'all 0.15s' }}>
      {ok ? <IconCheck /> : <IconCopy />}
    </button>
  );
}

export function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
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

export function EditModal({ course, onClose, onSaved }: { course: Course; onClose: () => void; onSaved: () => void }) {
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
          <div className="field"><label htmlFor="edit-name">اسم النشاط</label><input id="edit-name" className="input" value={activityName} onChange={e => setActivityName(e.target.value)} /></div>
          <div className="field"><label htmlFor="edit-venue">مقر الانعقاد</label><input id="edit-venue" className="input" value={venue} onChange={e => setVenue(e.target.value)} /></div>
          <div className="edit-row">
            <div className="field"><label htmlFor="edit-start">تاريخ البداية</label><input id="edit-start" className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="field"><label htmlFor="edit-end">تاريخ النهاية</label><input id="edit-end" className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          </div>
          <div className="field"><label htmlFor="edit-count">عدد المشاركين</label><input id="edit-count" className="input" type="number" min="0" value={participantCount} onChange={e => setParticipantCount(e.target.value)} /></div>
        </div>
        <div className="confirm-actions">
          <button className="secondary-btn" onClick={onClose}>إلغاء</button>
          <button className="primary-btn" disabled={saving} onClick={handleSave}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
        </div>
      </div>
    </div>
  );
}

export function CourseCard({ c, onDeleted, onEdited }: { c: Course; onDeleted: (id: string) => void; onEdited: (id: string) => void }) {
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
    <div className="course-card" style={{ padding: '12px 16px', gap: 8, borderRadius: 16 }}>
      {showDelete && <ConfirmDialog message={`هل أنت متأكد من حذف "${c.activityName || 'الدورة'}"؟`} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
      {showEdit && <EditModal course={c} onClose={() => setShowEdit(false)} onSaved={() => onEdited(c.id)} />}
      <div className="course-card-top" style={{ gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className={`status-chip ${c.status === 'PUBLISHED' ? 'is-open' : ''}`} style={{ minHeight: 22, fontSize: '0.62rem', padding: '0 8px' }}>
              {c.status === 'PUBLISHED' ? 'نشط' : 'مغلق'}
            </span>
            <strong style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--nauss-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{c.activityName || 'دورة تدريبية'}</strong>
            <div className="course-card-figure" style={{ flexShrink: 0 }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--nauss-green-dark)' }}>{c._count.submissions}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--nauss-muted)' }}>&nbsp;/ {target}</span>
            </div>
          </div>
          <div className="course-card-meta" style={{ fontSize: '0.68rem', marginTop: 1, gap: 6 }}>
            <span><IconLoc /> {c.venue || '—'}</span>
            <span><IconCal /> {formatDate(c.startDate)}</span>
          </div>
        </div>
      </div>
      <div className="progress-section" style={{ padding: 0 }}>
        <div className="progress-bar" style={{ margin: 0, height: 3 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="secondary-btn" style={{ minHeight: 26, padding: '0 6px', fontSize: '0.62rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }} onClick={() => setShowEdit(true)}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            تعديل
          </button>
          <button className="secondary-btn" disabled={deleting} style={{ minHeight: 26, padding: '0 6px', fontSize: '0.62rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(191,61,48,0.08)', color: 'var(--danger)', borderColor: 'rgba(191,61,48,0.12)', opacity: deleting ? 0.5 : 1 }} onClick={() => setShowDelete(true)}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            حذف
          </button>
          <a href={`/api/export/${c.id}/pdf`} className="ghost-btn" style={{ minHeight: 26, padding: '0 6px', fontSize: '0.6rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }} title="تصدير PDF"><IconPDF /> PDF</a>
          <a href={mailtoHref(c)} className="ghost-btn" style={{ minHeight: 26, padding: '0 6px', fontSize: '0.6rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }} title="ارسال بالبريد"><IconEML /> بريد</a>
        </div>
        <Link href={`/courses/${c.id}`} className="secondary-btn" style={{ minHeight: 26, padding: '0 10px', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>عرض</Link>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, background: '#f7fafa', borderRadius: 6, border: '1px solid #e4ebeb', padding: '4px 6px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#667777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#667777' }}>للمشاركين</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ flex: 1, fontSize: '0.52rem', color: '#014948', direction: 'ltr', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{courseUrl(c)}</span>
            <CopyLink url={courseUrl(c)} />
          </div>
        </div>
        <div style={{ flex: 1, background: '#f7fafa', borderRadius: 6, border: '1px solid #e4ebeb', padding: '4px 6px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#667777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#667777' }}>لإدارة التأمين</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ flex: 1, fontSize: '0.52rem', color: '#014948', direction: 'ltr', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insuranceUrl(c)}</span>
            <CopyLink url={insuranceUrl(c)} />
          </div>
        </div>
      </div>
    </div>
  );
}
