'use client';

import { useEffect, useState, useMemo } from 'react';
import AppShell from '@/components/AppShell';

type Employee = {
  id: string; name: string; email: string; createdAt: string; lastLoginAt: string | null;
  totalCourses: number; totalSubmissions: number; activeCourses: number;
  courses: { activityName: string; status: string; submissions: number; createdAt: string }[];
};

function BarChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d0b284" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb',
      padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: 'linear-gradient(135deg, #f0f7f7 0%, #e4efef 100%)',
        display: 'grid', placeItems: 'center', flexShrink: 0, color: '#016564',
      }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.62rem', color: '#889f9f', fontWeight: 600, marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#014948', lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.65rem', color: '#94a8a8', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function HorizontalBarChart({ data }: { data: Employee[] }) {
  if (data.length === 0) return <div style={{ textAlign: 'center', padding: 24, color: '#94a8a8', fontSize: '0.78rem' }}>لا توجد بيانات</div>;
  const sorted = [...data].sort((a, b) => b.totalSubmissions - a.totalSubmissions);
  const maxVal = Math.max(...sorted.map(e => e.totalSubmissions), 1);
  const barAreaW = 320;

  return (
    <div style={{ direction: 'ltr' }}>
      {sorted.map((e, i) => {
        const w = (e.totalSubmissions / maxVal) * barAreaW;
        const hue = 175 - i * 4;
        return (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 110, textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#2d4141', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.name}>
              {e.name}
            </div>
            <div style={{ flex: 1, height: 26, background: '#f2f6f6', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: Math.max(w, 4), borderRadius: 8,
                background: `linear-gradient(90deg, hsl(${hue}, 60%, 42%) 0%, hsl(${hue - 10}, 55%, 52%) 100%)`,
                transition: 'width 0.6s ease',
                display: 'flex', alignItems: 'center', paddingRight: 8,
                justifyContent: 'flex-end',
              }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{e.totalSubmissions}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ published, closed }: { published: number; closed: number }) {
  const total = published + closed;
  if (total === 0) return <div style={{ textAlign: 'center', padding: 24, color: '#94a8a8', fontSize: '0.78rem' }}>لا توجد بيانات</div>;
  const pct = Math.round((published / total) * 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const gap = circ - dash;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f4f4" strokeWidth="14"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#donutGrad)" strokeWidth="14"
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
        <text x="60" y="54" textAnchor="middle" fill="#014948" fontSize="18" fontWeight="800">{pct}%</text>
        <text x="60" y="70" textAnchor="middle" fill="#94a8a8" fontSize="8" fontWeight="600">منشور</text>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#016564' }}/>
          <span style={{ fontSize: '0.75rem', color: '#2d4141' }}>منشور: {published}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#dce5e5' }}/>
          <span style={{ fontSize: '0.75rem', color: '#2d4141' }}>مغلق/آخر: {closed}</span>
        </div>
      </div>
    </div>
  );
}

function EmployeeCard({ emp }: { emp: Employee }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e2ebeb',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #016564, #014948)',
          display: 'grid', placeItems: 'center', color: '#fff',
          fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
        }}>
          {emp.name.charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
          <div style={{ fontSize: '0.62rem', color: '#94a8a8' }}>{emp.email}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, background: '#f6fafa', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#014948' }}>{emp.totalCourses}</div>
          <div style={{ fontSize: '0.55rem', color: '#94a8a8', fontWeight: 600 }}>دورات</div>
        </div>
        <div style={{ flex: 1, background: '#f6fafa', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#016564' }}>{emp.totalSubmissions}</div>
          <div style={{ fontSize: '0.55rem', color: '#94a8a8', fontWeight: 600 }}>تسجيلات</div>
        </div>
        <div style={{ flex: 1, background: '#f6fafa', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8a7440' }}>{emp.activeCourses}</div>
          <div style={{ fontSize: '0.55rem', color: '#94a8a8', fontWeight: 600 }}>نشط</div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const [data, setData] = useState<{analysis: string; rawData: Employee[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analysis')
      .then(r => { if (r.status === 401) throw new Error('401'); if (!r.ok) throw new Error('ERR'); return r.json(); })
      .then(d => setData(d))
      .catch(e => { if (e.message !== '401') console.error(e); })
      .finally(() => setLoading(false));
  }, []);

  const employees = useMemo(() => data?.rawData || [], [data]);
  const totalEmployees = employees.length;
  const totalCourses = employees.reduce((s, e: Employee) => s + e.totalCourses, 0);
  const totalSubmissions = employees.reduce((s, e: Employee) => s + e.totalSubmissions, 0);
  const totalActive = employees.reduce((s, e: Employee) => s + e.activeCourses, 0);
  const activeRate = totalCourses > 0 ? Math.round((totalActive / totalCourses) * 100) : 0;

  const allCourses = employees.flatMap((e: Employee) => e.courses);
  const publishedCourses = allCourses.filter((c: any) => c.status === 'PUBLISHED').length;
  const closedCourses = allCourses.length - publishedCourses;

  return (
    <AppShell title="تحليل أداء الموظفين" role="MANAGER" forceManager>
      {loading ? (
        <div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحليل...</p></div>
      ) : !data ? (
        <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f0f7f7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
              <defs><linearGradient id="an-lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient></defs>
              <circle cx="13" cy="13" r="11" fill="url(#an-lg)" opacity="0.08"/>
              <circle cx="13" cy="13" r="11" stroke="url(#an-lg)" strokeWidth="1.8"/>
              <line x1="13" y1="9" x2="13" y2="14" stroke="url(#an-lg)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="13" cy="17.5" r="1" fill="url(#an-lg)"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.05rem', color: '#014948', margin: '0 0 6px' }}>يتطلب صلاحية المدير</h2>
          <p style={{ fontSize: '0.82rem', color: '#667777', margin: '0 0 4px', lineHeight: 1.6 }}>
            قد يكون حسابك مسجلاً بصلاحية قديمة. إذا كنت تملك صلاحية مدير، جرّب تسجيل الخروج وإعادة تسجيل الدخول.
          </p>
          <button onClick={() => { fetch('/api/auth/logout', { method: 'POST' }).then(() => { window.location.href = '/login'; }); }}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 12, border: '1px solid #d4e0e0', background: '#fff', color: '#014948', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            تسجيل الخروج
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* ════════ HEADER ════════ */}
          <div style={{
            background: 'linear-gradient(145deg, #014a49 0%, #016564 40%, #017877 100%)',
            borderRadius: 24, padding: '24px 28px 20px', marginBottom: 20, color: '#fff',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(208,178,132,0.06)', border: '1px solid rgba(208,178,132,0.08)' }} />
            <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', top: '20%', left: '40%', width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', top: '15%', left: '10%', width: 30, height: 30, borderRadius: 6, background: 'rgba(208,178,132,0.06)', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src="/images/nauss-logo-gold.png" alt="" style={{ width: 56, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.12)', paddingRight: 18 }}>
                <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>تحليل أداء الموظفين</h1>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#bcd0d0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BarChartIcon /> نظرة شاملة على أداء ونشاط الموظفين
                </p>
              </div>
            </div>
          </div>

          {/* ════════ KPI CARDS ════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              label="إجمالي الموظفين" value={String(totalEmployees)}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
              label="إجمالي الدورات" value={String(totalCourses)}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
              label="إجمالي التسجيلات" value={String(totalSubmissions)}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="معدل النشاط" value={`${activeRate}%`} sub={`${totalActive} من ${totalCourses} دورات نشطة`}
            />
          </div>

          {/* ════════ CHARTS ════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                ترتيب الموظفين حسب التسجيلات
              </div>
              <HorizontalBarChart data={employees} />
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>
                حالة الدورات
              </div>
              <DonutChart published={publishedCourses} closed={closedCourses} />
            </div>
          </div>

          {/* ════════ EMPLOYEE CARDS ════════ */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              أداء الموظفين
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {employees.length > 0 ? employees.map((e: Employee) => <EmployeeCard key={e.id} emp={e} />) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, color: '#94a8a8', background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', fontSize: '0.82rem' }}>
                  لا يوجد موظفون لعرض أدائهم
                </div>
              )}
            </div>
          </div>

          {/* ════════ AI ANALYSIS ════════ */}
          {data.analysis && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid #e8efef',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                </svg>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#014948' }}>تحليل مدعوم بالذكاء الاصطناعي</span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {data.analysis.startsWith('مفتاح API') ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: '#fef6e6', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b8933a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#5a4a20', margin: '0 0 6px' }}>التحليل بالذكاء الاصطناعي غير مفعل</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a8a8', margin: 0 }}>أضف <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>OPENAI_API_KEY</code> إلى متغيرات البيئة</p>
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 2, fontSize: '0.88rem', color: '#2d4141' }}>
                    {data.analysis}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
