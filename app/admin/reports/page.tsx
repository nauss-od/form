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
  const [data, setData] = useState<{
    enriched: EmployeeReport[]; allCourses: CourseBrief[];
    allEmployees: { id: string; name: string }[]; kpis: KPI;
  } | null>(null);
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
      if (!r.ok) { setError(body.message || body.error || 'خطأ'); return; }
      setData(body);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const employees = useMemo(() => data?.enriched || [], [data]);
  const kpis = data?.kpis;
  const allCourses = useMemo(() => data?.allCourses || [], [data]);
  const allEmployees = useMemo(() => data?.allEmployees || [], [data]);

  const statusDist = useMemo(() => {
    const pub = allCourses.filter(c => c.status === 'PUBLISHED').length;
    return { published: pub, closed: allCourses.length - pub };
  }, [allCourses]);

  const sorted = useMemo(() => {
    const arr = [...employees];
    arr.sort((a, b) => {
      if (sortKey === 'createdAt') {
        return sortDir === 'asc'
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt);
      }
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return arr;
  }, [employees, sortKey, sortDir]);

  const maxVal = useMemo(() => Math.max(...employees.map(e => e.totalSubmissions), 1), [employees]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const handleFilter = (key: string, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () =>
    setFilters({ employeeId: '', status: '', from: '', to: '' });

  const hasFilters = filters.employeeId || filters.status || filters.from || filters.to;

  const filterBtn: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 8, border: '1px solid #e2ebeb',
    fontSize: '0.75rem', background: '#fff', color: '#2d4141',
    outline: 'none', minWidth: 110,
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
        <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bf3d30" strokeWidth="1.8" strokeLinecap="round" style={{ marginBottom: 12 }}>
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p style={{ fontSize: '0.82rem', color: '#667777', lineHeight: 1.6 }}>{error}</p>
          <button onClick={fetchReports}
            style={{ marginTop: 16, padding: '8px 20px', borderRadius: 10, border: '1px solid #e2ebeb', background: '#fff', color: '#014948', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            إعادة المحاولة
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="التقارير" role="MANAGER" forceManager>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(145deg, #014a49 0%, #016564 40%, #017877 100%)',
          borderRadius: 24, padding: '24px 28px 20px', marginBottom: 20, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(208,178,132,0.06)', border: '1px solid rgba(208,178,132,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/images/nauss-logo-gold.png" alt="" style={{ width: 56, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.12)', paddingRight: 18 }}>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>التقارير</h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#bcd0d0' }}>
                نظرة شاملة على أداء ونشاط الموظفين
              </p>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <select value={filters.employeeId} onChange={e => handleFilter('employeeId', e.target.value)} style={filterBtn}>
            <option value="">جميع الموظفين</option>
            {allEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={filters.status} onChange={e => handleFilter('status', e.target.value)} style={filterBtn}>
            <option value="">جميع الحالات</option>
            <option value="PUBLISHED">منشور</option>
            <option value="CLOSED">مغلق</option>
          </select>
          <input type="date" value={filters.from} onChange={e => handleFilter('from', e.target.value)}
            style={{ ...filterBtn, direction: 'ltr' }} />
          <input type="date" value={filters.to} onChange={e => handleFilter('to', e.target.value)}
            style={{ ...filterBtn, direction: 'ltr' }} />
          {hasFilters && (
            <button onClick={clearFilters}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#f0f5f5', color: '#667777', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
              إلغاء
            </button>
          )}
        </div>

        {/* ── Summary banner ── */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb',
          padding: '18px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#014948', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            ملخص
          </span>
          {[
            { label: 'الموظفين', value: kpis?.totalEmployees ?? 0 },
            { label: 'الدورات', value: kpis?.totalCourses ?? 0 },
            { label: 'التسجيلات', value: kpis?.totalSubmissions ?? 0 },
            { label: 'معدل النشاط', value: `${kpis?.activeRate ?? 0}%` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#014948', lineHeight: 1 }}>
                {item.value}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a8a8', fontWeight: 500 }}>
                {item.label}
              </span>
            </div>
          ))}
          {kpis && (
            <span style={{ fontSize: '0.65rem', color: '#b0c4c4', marginRight: 'auto' }}>
              {kpis.totalActive} دورات نشطة · {kpis.totalClosed} مغلقة
            </span>
          )}
        </div>

        {/* ── Charts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 16 }}>
              ترتيب الموظفين حسب التسجيلات
            </div>
            <BarChart data={sorted} maxVal={maxVal} hoveredEmp={hoveredEmp} setHoveredEmp={setHoveredEmp} />
          </div>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 16 }}>
              توزيع حالات الدورات
            </div>
            <DonutChart published={statusDist.published} closed={statusDist.closed} />
          </div>
        </div>

        {/* ── Employee table ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 16 }}>
            قائمة الموظفين
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2ebeb' }}>
                  {([
                    ['name', 'الاسم'],
                    ['totalCourses', 'الدورات'],
                    ['totalSubmissions', 'التسجيلات'],
                    ['activeCourses', 'النشطة'],
                    ['createdAt', 'تاريخ الإنشاء'],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k} onClick={() => toggleSort(k)}
                      style={{
                        padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '0.7rem',
                        color: '#667777', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                        letterSpacing: '0.02em',
                      }}>
                      {label}
                      {sortKey === k && (
                        <span style={{ color: '#016564', marginRight: 2 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((emp, idx) => (
                  <tr key={emp.id}
                    onMouseEnter={() => setHoveredEmp(emp.id)}
                    onMouseLeave={() => setHoveredEmp(null)}
                    style={{
                      borderBottom: '1px solid #f0f5f5',
                      background: hoveredEmp === emp.id ? '#f7fbfb' : idx % 2 === 1 ? '#fafcfc' : 'transparent',
                      transition: 'background 0.12s',
                    }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#2d4141' }}>{emp.name}</td>
                    <td style={{ padding: '10px 12px', color: '#667777' }}>{emp.totalCourses}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: '#0165640d', color: '#016564', fontWeight: 700,
                        padding: '1px 10px', borderRadius: 6, fontSize: '0.72rem',
                      }}>
                        {emp.totalSubmissions}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#667777' }}>{emp.activeCourses}</td>
                    <td style={{ padding: '10px 12px', color: '#b0c4c4', fontSize: '0.68rem', direction: 'ltr' }}>
                      {new Date(emp.createdAt).toLocaleDateString('en-CA')}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a8a8' }}>لا توجد بيانات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Courses ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 16 }}>
            جميع الدورات
            <span style={{ fontWeight: 400, color: '#94a8a8', marginRight: 6, fontSize: '0.72rem' }}>
              ({allCourses.length})
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2ebeb' }}>
                  {['النشاط', 'الحالة', 'التسجيلات', 'المشاركون', 'تاريخ الإنشاء'].map(label => (
                    <th key={label}
                      style={{
                        padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '0.7rem',
                        color: '#667777', letterSpacing: '0.02em',
                      }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allCourses.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f5f5', background: i % 2 === 1 ? '#fafcfc' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#2d4141' }}>
                      {c.activityName || '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        display: 'inline-block', padding: '1px 10px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 600,
                        background: c.status === 'PUBLISHED' ? '#0165640d' : '#f0f5f5',
                        color: c.status === 'PUBLISHED' ? '#016564' : '#667777',
                      }}>
                        {c.status === 'PUBLISHED' ? 'منشور' : 'مغلق'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#667777' }}>{c.submissions}</td>
                    <td style={{ padding: '10px 12px', color: '#667777' }}>{c.participantCount ?? '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#b0c4c4', fontSize: '0.68rem', direction: 'ltr' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-CA')}
                    </td>
                  </tr>
                ))}
                {allCourses.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a8a8' }}>لا توجد دورات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

/* ─── Bar chart ─── */

function BarChart({ data, maxVal, hoveredEmp, setHoveredEmp }: {
  data: EmployeeReport[]; maxVal: number; hoveredEmp: string | null; setHoveredEmp: (id: string | null) => void;
}) {
  return (
    <div style={{ direction: 'ltr' }}>
      {data.map((e, i) => {
        const pct = (e.totalSubmissions / maxVal) * 100;
        const hue = 175 - i * 3;
        const isHovered = hoveredEmp === e.id;
        const dim = hoveredEmp !== null && !isHovered;
        return (
          <div key={e.id}
            onMouseEnter={() => setHoveredEmp(e.id)}
            onMouseLeave={() => setHoveredEmp(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
              opacity: dim ? 0.35 : 1, transition: 'opacity 0.15s',
            }}>
            <span style={{
              width: 20, fontSize: '0.62rem', fontWeight: 700, color: '#b0c4c4',
              textAlign: 'center', flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <span style={{
              width: 90, fontSize: '0.72rem', fontWeight: 600, color: '#2d4141',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0,
            }} title={e.name}>
              {e.name}
            </span>
            <div style={{ flex: 1, height: 22, background: '#f2f6f6', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.max(pct, 1)}%`, borderRadius: 6,
                background: `linear-gradient(90deg, hsl(${hue}, 55%, 40%) 0%, hsl(${hue - 8}, 50%, 50%) 100%)`,
                transition: 'width 0.5s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6,
              }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  {e.totalSubmissions}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Donut chart ─── */

function DonutChart({ published, closed }: { published: number; closed: number }) {
  const total = published + closed;
  if (total === 0) return (
    <div style={{ textAlign: 'center', padding: 32, color: '#94a8a8', fontSize: '0.78rem' }}>
      لا توجد بيانات
    </div>
  );
  const pct = Math.round((published / total) * 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const gap = circ - dash;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <svg width="130" height="130" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="dpub" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/>
          </linearGradient>
          <linearGradient id="dclo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d0dddd"/><stop offset="100%" stopColor="#94a8a8"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f5f5" strokeWidth="16"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#dpub)" strokeWidth="16"
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
        <text x="60" y="52" textAnchor="middle" fontSize="20" fontWeight="800" fill="#014948">
          {pct}%
        </text>
        <text x="60" y="66" textAnchor="middle" fontSize="8" fill="#94a8a8">نشط</text>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#016564' }}/>
          <span style={{ fontSize: '0.72rem', color: '#2d4141' }}>منشور <strong>{published}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#94a8a8' }}/>
          <span style={{ fontSize: '0.72rem', color: '#667777' }}>مغلق <strong>{closed}</strong></span>
        </div>
      </div>
    </div>
  );
}