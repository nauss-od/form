'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import AppShell from '@/components/AppShell';

interface CourseBrief {
  activityName: string | null;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  participantCount: number | null;
  status: string;
  submissions: number;
  createdAt: string;
}

interface EmployeeReport {
  id: string;
  name: string;
  email: string;
  totalCourses: number;
  totalSubmissions: number;
  activeCourses: number;
  createdAt: string;
  lastLoginAt: string | null;
  courses: CourseBrief[];
}

interface KPI {
  totalEmployees: number;
  totalCourses: number;
  totalSubmissions: number;
  totalActive: number;
  totalClosed: number;
  activeRate: number;
}

type SortKey = 'name' | 'totalCourses' | 'totalSubmissions' | 'activeCourses' | 'createdAt';

export default function ReportsPage() {
  const [data, setData] = useState<{ enriched: EmployeeReport[]; allCourses: CourseBrief[]; allEmployees: { id: string; name: string }[]; kpis: KPI } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ employeeId: '', status: '', from: '', to: '' });
  const [sortKey, setSortKey] = useState<SortKey>('totalSubmissions');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [hoveredEmp, setHoveredEmp] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.set('employeeId', filters.employeeId);
      if (filters.status) params.set('status', filters.status);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const qs = params.toString();
      const r = await fetch(`/api/admin/reports${qs ? `?${qs}` : ''}`);
      if (r.status === 401) { window.location.href = '/login'; return; }
      const body = await r.json();
      if (!r.ok) { setError(body.message || body.error || 'خطأ في تحميل التقارير'); return; }
      setData(body);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const employees = useMemo(() => data?.enriched || [], [data]);
  const kpis = useMemo(() => data?.kpis, [data]);
  const allCourses = useMemo(() => data?.allCourses || [], [data]);
  const allEmployees = useMemo(() => data?.allEmployees || [], [data]);

  const statusDist = useMemo(() => {
    const pub = allCourses.filter(c => c.status === 'PUBLISHED').length;
    const closed = allCourses.filter(c => c.status === 'CLOSED').length;
    return { published: pub, closed };
  }, [allCourses]);

  const sorted = useMemo(() => {
    const arr = [...employees];
    arr.sort((a, b) => {
      let va: number | string = a[sortKey], vb: number | string = b[sortKey];
      if (sortKey === 'createdAt') { va = a.createdAt; vb = b.createdAt; }
      if (typeof va === 'string' && typeof vb === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return arr;
  }, [employees, sortKey, sortDir]);

  const maxVal = useMemo(() => Math.max(...employees.map(e => e.totalSubmissions), 1), [employees]);
  const barAreaW = 300;

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };
  const sortArrow = (k: SortKey) => sortKey === k ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 10, border: '1px solid #d4e0e0', fontSize: '0.75rem',
    background: '#fff', color: '#2d4141', outline: 'none', minWidth: 120,
  };

  if (loading) {
    return (
      <AppShell title="التقارير" role="MANAGER" forceManager>
        <div style={{ maxWidth: 1100, margin: '60px auto', textAlign: 'center', color: '#94a8a8', fontSize: '0.85rem' }}>
          جارٍ تحميل التقارير...
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="التقارير" role="MANAGER" forceManager>
        <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fef2f2', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
              <defs><linearGradient id="re-eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bf3d30"/><stop offset="100%" stopColor="#8b2a1e"/></linearGradient></defs>
              <circle cx="13" cy="13" r="11" fill="url(#re-eg)" opacity="0.08"/>
              <circle cx="13" cy="13" r="11" stroke="url(#re-eg)" strokeWidth="1.8"/>
              <line x1="8" y1="8" x2="18" y2="18" stroke="url(#re-eg)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="18" y1="8" x2="8" y2="18" stroke="url(#re-eg)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.05rem', color: '#014948', margin: '0 0 6px' }}>خطأ في تحميل التقارير</h2>
          <p style={{ fontSize: '0.82rem', color: '#667777', margin: '0 0 4px', lineHeight: 1.6 }}>{error}</p>
          <button onClick={fetchReports}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 12, border: '1px solid #d4e0e0', background: '#fff', color: '#014948', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            إعادة المحاولة
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="التقارير" role="MANAGER" forceManager>
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
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>التقارير</h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#bcd0d0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                نظرة شاملة على أداء ونشاط الموظفين
              </p>
            </div>
          </div>
        </div>

        {/* ════════ FILTER BAR ════════ */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '14px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#014948' }}>تصفية:</span>

          <select value={filters.employeeId} onChange={e => handleFilterChange('employeeId', e.target.value)} style={inputStyle}>
            <option value="">جميع الموظفين</option>
            {allEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} style={inputStyle}>
            <option value="">جميع الحالات</option>
            <option value="PUBLISHED">منشور</option>
            <option value="CLOSED">مغلق</option>
          </select>

          <input type="date" value={filters.from} onChange={e => handleFilterChange('from', e.target.value)}
            style={{ ...inputStyle, direction: 'ltr' }} placeholder="من تاريخ" />

          <input type="date" value={filters.to} onChange={e => handleFilterChange('to', e.target.value)}
            style={{ ...inputStyle, direction: 'ltr' }} placeholder="إلى تاريخ" />

          {(filters.employeeId || filters.status || filters.from || filters.to) && (
            <button onClick={() => setFilters({ employeeId: '', status: '', from: '', to: '' })}
              style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid #d4e0e0', background: '#f7fafa', color: '#667777', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
              إلغاء التصفية
            </button>
          )}
        </div>

        {/* ════════ KPI CARDS ════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            label="الموظفين" value={String(kpis?.totalEmployees || 0)}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
            label="الدورات" value={String(kpis?.totalCourses || 0)}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            label="التسجيلات" value={String(kpis?.totalSubmissions || 0)}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
            label="معدل النشاط" value={`${kpis?.activeRate || 0}%`} sub={`${kpis?.totalActive || 0} من ${kpis?.totalCourses || 0} دورات نشطة`}
          />
        </div>

        {/* ════════ CHARTS ════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {/* Bar Chart */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              ترتيب الموظفين حسب التسجيلات
            </div>
            <HorizontalBarChart data={sorted} maxVal={maxVal} barAreaW={barAreaW} hoveredEmp={hoveredEmp} setHoveredEmp={setHoveredEmp} />
          </div>

          {/* Donut Chart */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>
              توزيع حالات الدورات
            </div>
            <DonutChart published={statusDist.published} closed={statusDist.closed} />
          </div>
        </div>

        {/* ════════ EMPLOYEE TABLE ════════ */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            قائمة الموظفين
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2ebeb' }}>
                  {([['name', 'الاسم'], ['totalCourses', 'الدورات'], ['totalSubmissions', 'التسجيلات'], ['activeCourses', 'النشطة'], ['createdAt', 'تاريخ الإنشاء']] as [SortKey, string][]).map(([k, l]) => (
                    <th key={k} onClick={() => toggleSort(k)}
                      style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#014948', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                      {l}{sortArrow(k)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(emp => (
                  <tr key={emp.id}
                    onMouseEnter={() => setHoveredEmp(emp.id)}
                    onMouseLeave={() => setHoveredEmp(null)}
                    style={{ borderBottom: '1px solid #f0f5f5', background: hoveredEmp === emp.id ? '#f7fbfb' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#2d4141' }}>{emp.name}</td>
                    <td style={{ padding: '8px 10px', color: '#667777' }}>{emp.totalCourses}</td>
                    <td style={{ padding: '8px 10px', color: '#667777' }}>
                      <span style={{ background: '#01656410', color: '#016564', fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{emp.totalSubmissions}</span>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#667777' }}>{emp.activeCourses}</td>
                    <td style={{ padding: '8px 10px', color: '#94a8a8', fontSize: '0.7rem', direction: 'ltr' }}>{new Date(emp.createdAt).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a8a8' }}>لا توجد بيانات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════ COURSES LIST ════════ */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            جميع الدورات ({allCourses.length})
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2ebeb' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#014948' }}>النشاط</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#014948' }}>الحالة</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#014948' }}>التسجيلات</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#014948' }}>المشاركون</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#014948' }}>تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {allCourses.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f5f5' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#2d4141' }}>{c.activityName || '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 600,
                        background: c.status === 'PUBLISHED' ? '#01656410' : '#f0f5f5',
                        color: c.status === 'PUBLISHED' ? '#016564' : '#667777',
                      }}>
                        {c.status === 'PUBLISHED' ? 'منشور' : 'مغلق'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#667777' }}>{c.submissions}</td>
                    <td style={{ padding: '8px 10px', color: '#667777' }}>{c.participantCount ?? '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#94a8a8', fontSize: '0.7rem', direction: 'ltr' }}>{new Date(c.createdAt).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
                {allCourses.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a8a8' }}>لا توجد دورات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

/* ═══════════════════════════ COMPONENTS ═══════════════════════════ */

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12, transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(1,101,100,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: '#01656410', display: 'grid', placeItems: 'center', color: '#016564', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#014948', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a8a8', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.62rem', color: '#b0c4c4', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function HorizontalBarChart({ data, maxVal, barAreaW, hoveredEmp, setHoveredEmp }: {
  data: EmployeeReport[]; maxVal: number; barAreaW: number; hoveredEmp: string | null; setHoveredEmp: (id: string | null) => void;
}) {
  return (
    <div style={{ direction: 'ltr' }}>
      {data.map((e, i) => {
        const w = (e.totalSubmissions / maxVal) * barAreaW;
        const hue = 175 - i * 4;
        const isHovered = hoveredEmp === e.id;
        return (
          <div key={e.id}
            onMouseEnter={() => setHoveredEmp(e.id)}
            onMouseLeave={() => setHoveredEmp(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, opacity: hoveredEmp !== null && !isHovered ? 0.4 : 1, transition: 'opacity 0.15s' }}>
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
          <linearGradient id="dGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
          <linearGradient id="dGrad2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c4d6d6"/><stop offset="100%" stopColor="#94a8a8"/></linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f5f5" strokeWidth="18" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#dGrad)" strokeWidth="18" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="60" y="52" textAnchor="middle" fontSize="18" fontWeight="800" fill="#014948">{pct}%</text>
        <text x="60" y="66" textAnchor="middle" fontSize="8" fill="#94a8a8">نشط</text>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#016564' }} />
          <span style={{ fontSize: '0.72rem', color: '#2d4141' }}>منشور: <strong>{published}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#94a8a8' }} />
          <span style={{ fontSize: '0.72rem', color: '#667777' }}>مغلق: <strong>{closed}</strong></span>
        </div>
      </div>
    </div>
  );
}