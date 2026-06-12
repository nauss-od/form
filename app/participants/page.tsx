'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

interface Course {
  id: string;
  activityName?: string | null;
  title?: string | null;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  _count?: { submissions: number };
}

interface StaffMember {
  id: string;
  name: string;
  passportNo: string | null;
  jobTitle: string;
}

const JOB_TITLES = [
  'Scientific Supervisor',
  'Translator',
  'Trainer 1',
  'Trainer 2',
  'Coordinator',
];

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StaffPanel({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [jobTitle, setJobTitle] = useState(JOB_TITLES[0]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`/api/courses/${courseId}/staff`)
      .then(r => r.json())
      .then(d => setStaff(d.staff || []))
      .finally(() => setLoading(false));
  }, [courseId]);

  async function addMember() {
    setMsg('');
    if (!name.trim()) { setMsg('الاسم مطلوب'); return; }
    setSaving(true);
    const res = await fetch(`/api/courses/${courseId}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), passportNo: passportNo.trim() || null, jobTitle }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.message || 'خطأ'); setSaving(false); return; }
    setStaff(prev => [...prev, data.member]);
    setName(''); setPassportNo('');
    setSaving(false);
  }

  async function removeMember(staffId: string) {
    await fetch(`/api/courses/${courseId}/staff?staffId=${staffId}`, { method: 'DELETE' });
    setStaff(prev => prev.filter(m => m.id !== staffId));
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1b4f6b' }}>إدارة كادر NAUSS</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>المشرفون والمترجمون والمدربون</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ overflow: 'auto', flex: 1, padding: '16px 24px' }}>
          {/* Add form */}
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1b4f6b', marginBottom: 12 }}>إضافة فرد</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>الاسم (إنجليزي فقط) *</label>
                  <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="JOHN DOE"
                    dir="ltr"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>رقم الجواز</label>
                  <input
                    className="input"
                    value={passportNo}
                    onChange={e => setPassportNo(e.target.value.toUpperCase())}
                    placeholder="AB123456"
                    dir="ltr"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>المسمى الوظيفي</label>
                <select
                  className="input"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  dir="ltr"
                  style={{ width: '100%' }}
                >
                  {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {msg && <div style={{ color: '#dc2626', fontSize: 12 }}>{msg}</div>}
              <button
                onClick={addMember}
                disabled={saving}
                className="primary-btn"
                style={{ width: 'auto', padding: '0 24px', minHeight: 40, fontSize: 13 }}
              >
                {saving ? '...' : '+ إضافة'}
              </button>
            </div>
          </div>

          {/* Staff list */}
          {loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>جاري التحميل...</div>
          ) : staff.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24, border: '1px dashed #cbd5e1', borderRadius: 8, fontSize: 13 }}>
              لم يُضف أي فرد من الكادر بعد
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {staff.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#f8fafc', borderRadius: 8, padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', direction: 'ltr' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', direction: 'ltr' }}>
                      {m.jobTitle}{m.passportNo ? ` · ${m.passportNo}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(m.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18, lineHeight: 1 }}
                    title="حذف"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="primary-btn" style={{ width: 'auto', padding: '0 28px', minHeight: 40, fontSize: 13 }}>
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ParticipantsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'MANAGER' | 'EMPLOYEE'>('EMPLOYEE');
  const [forceManager, setForceManager] = useState(false);
  const [managingStaff, setManagingStaff] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('activeRole') as 'MANAGER' | 'EMPLOYEE' | null;
    if (stored) setRole(stored);
    const fm = localStorage.getItem('forceManager') === 'true';
    setForceManager(fm);

    fetch('/api/courses?stats=true')
      .then(r => r.json())
      .then(data => {
        setCourses(data.recentCourses ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppShell title="قائمة المشاركين" role={role} forceManager={forceManager}>
      {managingStaff && (
        <StaffPanel courseId={managingStaff} onClose={() => setManagingStaff(null)} />
      )}

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1b4f6b', margin: 0 }}>قائمة المشاركين</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
            أضف كادر NAUSS (مشرف، مترجم، ...) ثم صدّر قائمة PDF احترافية
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
            {courses.map(c => {
              const title = c.activityName || c.title || '—';
              return (
                <div key={c.id} style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '16px 20px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{title}</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                      {c.venue && <span style={{ marginLeft: 12 }}>📍 {c.venue}</span>}
                      {c.startDate && (
                        <span>{fmtDate(c.startDate)}{c.endDate ? ` — ${fmtDate(c.endDate)}` : ''}</span>
                      )}
                    </div>
                    {c._count?.submissions != null && (
                      <div style={{ color: '#0ea5e9', fontSize: 12, marginTop: 4 }}>
                        {c._count.submissions} مشارك
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setManagingStaff(c.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#f1f5f9', color: '#475569',
                        padding: '8px 14px', borderRadius: 8, fontSize: 13,
                        fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      كادر NAUSS
                    </button>
                    <a
                      href={`/api/export/${c.id}/participants-list`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#1b4f6b', color: '#fff',
                        padding: '8px 16px', borderRadius: 8, fontSize: 13,
                        fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
