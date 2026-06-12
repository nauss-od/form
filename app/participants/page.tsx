'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

interface Course {
  id: string;
  activityName?: string | null;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  _count?: { submissions: number };
  insuranceIssuedAt?: string | null;
}

interface StaffMember { id: string; name: string; passportNo: string | null; mobile: string | null; jobTitle: string; }

const JOB_TITLES = ['Scientific Supervisor', 'Translator', 'Trainer 1', 'Trainer 2', 'Coordinator'];

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ─── Staff Modal ─── */
function StaffModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [name, setName] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [jobTitle, setJobTitle] = useState(JOB_TITLES[0]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`/api/courses/${course.id}/staff`)
      .then(r => r.json()).then(d => setStaff(d.staff || [])).finally(() => setLoadingStaff(false));
  }, [course.id]);

  async function addMember() {
    setMsg('');
    if (!name.trim()) { setMsg('الاسم مطلوب'); return; }
    setSaving(true);
    const res = await fetch(`/api/courses/${course.id}/staff`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), passportNo: passportNo.trim() || null, mobile: mobile.trim() || null, jobTitle }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.message || 'خطأ'); setSaving(false); return; }
    setStaff(prev => [...prev, data.member]);
    setName(''); setPassportNo(''); setMobile('');
    setSaving(false);
  }

  async function removeMember(staffId: string) {
    await fetch(`/api/courses/${course.id}/staff?staffId=${staffId}`, { method: 'DELETE' });
    setStaff(prev => prev.filter(m => m.id !== staffId));
  }

  const title = course.activityName || '—';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1b4f6b' }}>{title}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>المرشحون من جامعة نايف</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94a3b8', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>

        <div style={{ overflow: 'auto', flex: 1, padding: '16px 24px' }}>
          {/* Add form */}
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1b4f6b', marginBottom: 12 }}>إضافة فرد من الكادر</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>الاسم (إنجليزي فقط) *</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="JOHN DOE" dir="ltr" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>رقم الجواز</label>
                  <input className="input" value={passportNo} onChange={e => setPassportNo(e.target.value.toUpperCase())} placeholder="AB123456" dir="ltr" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>رقم الجوال</label>
                  <input className="input" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+966XXXXXXXXX" dir="ltr" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>المسمى الوظيفي</label>
                <select className="input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} dir="ltr" style={{ width: '100%' }}>
                  {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {msg && <div style={{ color: '#dc2626', fontSize: 12 }}>{msg}</div>}
              <button onClick={addMember} disabled={saving} className="primary-btn" style={{ width: 'auto', padding: '0 24px', minHeight: 40, fontSize: 13 }}>
                {saving ? '...' : '+ إضافة'}
              </button>
            </div>
          </div>

          {/* Staff list */}
          {loadingStaff ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>جاري التحميل...</div>
          ) : staff.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24, border: '1px dashed #cbd5e1', borderRadius: 8, fontSize: 13 }}>لم يُضف أي فرد من الكادر بعد</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {staff.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', borderRadius: 8, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', direction: 'ltr' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', direction: 'ltr' }}>{m.jobTitle}{m.passportNo ? ` · ${m.passportNo}` : ''}{m.mobile ? ` · ${m.mobile}` : ''}</div>
                  </div>
                  <button onClick={() => removeMember(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 20, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0 20px', minHeight: 40, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>إغلاق</button>
          <a href={`/api/export/${course.id}/participants-list`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1b4f6b', color: '#fff', padding: '0 20px', minHeight: 40, borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            تصدير PDF
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Course Card (employee view) ─── */
function CourseCardItem({ course, onClick }: { course: Course; onClick: () => void }) {
  const title = course.activityName || '—';
  const count = course._count?.submissions ?? 0;
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'right', background: '#fff', border: '1.5px solid #e2e8f0',
      borderRadius: 14, padding: '18px 20px', cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#016564'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(1,101,100,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {course.venue && <span style={{ marginLeft: 12 }}>📍 {course.venue}</span>}
            {course.startDate && <span>{fmtDate(course.startDate)}{course.endDate ? ` — ${fmtDate(course.endDate)}` : ''}</span>}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600 }}>{count} مشارك</span>
            {course.insuranceIssuedAt && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ تم إصدار التأمين</span>}
          </div>
        </div>
        <div style={{ color: '#1b4f6b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          كادر NAUSS والـ PDF
        </div>
      </div>
    </button>
  );
}

/* ─── Main Page ─── */
export default function ParticipantsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiRole, setApiRole] = useState<string>('');
  const [activeRole, setActiveRole] = useState<'MANAGER' | 'EMPLOYEE'>('MANAGER');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const ar = (localStorage.getItem('nauss-active-role') as 'MANAGER' | 'EMPLOYEE') || 'MANAGER';
    setActiveRole(ar);

    fetch('/api/courses?stats=true')
      .then(r => r.json())
      .then(d => {
        setApiRole(d.userRole || '');
        const asEmployee = d.userRole === 'MANAGER' && ar === 'EMPLOYEE';
        if (asEmployee) {
          return fetch('/api/courses?stats=true&asEmployee=true')
            .then(r => r.json()).then(d2 => setCourses(d2.recentCourses ?? []));
        }
        setCourses(d.recentCourses ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isManagerView = apiRole === 'MANAGER' && activeRole === 'MANAGER';

  return (
    <AppShell title="قائمة المشاركين" role={apiRole}>
      {selectedCourse && <StaffModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1b4f6b', margin: 0 }}>قائمة المشاركين</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
            {isManagerView
              ? 'جميع دورات المنصة — تصدير قائمة PDF لأي دورة'
              : 'اضغط على الدورة لإدارة كادر NAUSS وتصدير القائمة'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: 12 }}>
            لا توجد دورات حتى الآن
          </div>
        ) : isManagerView ? (
          /* Manager: simple list + PDF button */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courses.map(c => (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{c.activityName || '—'}</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>
                    {c.venue && <span style={{ marginLeft: 10 }}>📍 {c.venue}</span>}
                    {c.startDate && <span>{fmtDate(c.startDate)}{c.endDate ? ` — ${fmtDate(c.endDate)}` : ''}</span>}
                  </div>
                  {c._count?.submissions != null && <div style={{ color: '#0ea5e9', fontSize: 11, marginTop: 3 }}>{c._count.submissions} مشارك</div>}
                </div>
                <a href={`/api/export/${c.id}/participants-list`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#1b4f6b', color: '#fff', padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  تصدير PDF
                </a>
              </div>
            ))}
          </div>
        ) : (
          /* Employee / manager-as-employee: card grid */
          <div style={{ display: 'grid', gap: 12 }}>
            {courses.map(c => <CourseCardItem key={c.id} course={c} onClick={() => setSelectedCourse(c)} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
