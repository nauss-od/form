'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AppShell from '@/components/AppShell';

interface CourseBrief {
  activityName: string | null;
  status: string;
  submissions: number;
  participantCount: number | null;
  startDate: string | null;
  endDate: string | null;
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

interface TrendPoint {
  month: string;
  total: number;
  published: number;
  closed: number;
}

interface KPI {
  totalEmployees: number; totalCourses: number; totalSubmissions: number;
  totalActive: number; totalClosed: number; activeRate: number;
}

type SortKey = 'name' | 'totalCourses' | 'totalSubmissions' | 'activeCourses' | 'createdAt';

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const fmtMonth = (m: string) => { const [y, mo] = m.split('-'); return `${monthNames[parseInt(mo) - 1]} ${y}`; };

export default function ReportsPage() {
  const [data, setData] = useState<{
    enriched: EmployeeReport[]; allCourses: CourseBrief[];
    allEmployees: { id: string; name: string }[];
    kpis: KPI; trend: TrendPoint[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ employeeId: '', status: '', from: '', to: '' });
  const [sortKey, setSortKey] = useState<SortKey>('totalSubmissions');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [chartHover, setChartHover] = useState<string | null>(null);
  const [trendHover, setTrendHover] = useState<{ x: number; data: TrendPoint } | null>(null);

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

  const employees = data?.enriched || [];
  const trend = data?.trend || [];
  const kpis = data?.kpis;
  const allCourses = data?.allCourses || [];
  const allEmployees = data?.allEmployees || [];

  const maxSubs = useMemo(() => Math.max(...employees.map(e => e.totalSubmissions), 1), [employees]);
  const maxTrend = useMemo(() => Math.max(...trend.map(t => t.total), 1), [trend]);

  const sorted = useMemo(() => {
    const arr = [...employees];
    arr.sort((a, b) => {
      if (sortKey === 'createdAt') {
        return sortDir === 'asc'
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt);
      }
      return sortDir === 'asc'
        ? (a[sortKey] as number) - (b[sortKey] as number)
        : (b[sortKey] as number) - (a[sortKey] as number);
    });
    return arr;
  }, [employees, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  return (
    <AppShell title="التقارير" role="MANAGER" forceManager>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ════════ HERO HEADER ════════ */}
        <header style={{
          background: 'linear-gradient(145deg, #014a49 0%, #016564 40%, #017877 100%)',
          borderRadius: 24, padding: '28px 32px', marginBottom: 20, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: 220, height: 220, borderRadius: '50%', background: 'rgba(208,178,132,0.06)', border: '1px solid rgba(208,178,132,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: '20%', right: '45%', width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18 }}>
            <img src="/images/nauss-logo-gold.png" alt="" style={{ width: 60, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.12)', paddingRight: 20 }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em' }}>التقارير</h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#bcd0d0' }}>
                تحليل شامل لأداء الموظفين ونشاط الدورات
              </p>
            </div>
            {kpis && (
              <div style={{ marginRight: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
                <Metric value={String(kpis.totalEmployees)} label="موظف" />
                <Metric value={String(kpis.totalCourses)} label="دورة" />
                <Metric value={String(kpis.totalSubmissions)} label="تسجيل" />
              </div>
            )}
          </div>
        </header>

        {/* ════════ FILTERS ════════ */}
        <FiltersBar
          employees={allEmployees}
          filters={filters}
          onChange={f => setFilters(prev => ({ ...prev, ...f }))}
        />

        {/* ════════ LOADING / ERROR ════════ */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a8a8', fontSize: '0.85rem' }}>جارٍ التحميل...</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchReports} />
        ) : (
          <>
            {/* ════════ CHARTS ROW ════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 20 }}>
              <ChartCard title="ترتيب الموظفين حسب التسجيلات">
                <BarChart data={sorted} maxVal={maxSubs} chartHover={chartHover} setChartHover={setChartHover} />
              </ChartCard>
              <ChartCard title="توزيع حالات الدورات">
                <DonutChart
                  published={allCourses.filter(c => c.status === 'PUBLISHED').length}
                  closed={allCourses.filter(c => c.status === 'CLOSED').length}
                />
              </ChartCard>
            </div>

            {/* ════════ TREND CHART ════════ */}
            {trend.length > 0 && (
              <ChartCard title="اتجاه التسجيلات الشهرية" style={{ marginBottom: 20 }}>
                <AreaChart data={trend} maxVal={maxTrend} hover={trendHover} setHover={setTrendHover} />
              </ChartCard>
            )}

            {/* ════════ EMPLOYEE TABLE ════════ */}
            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 0', fontSize: '0.78rem', fontWeight: 700, color: '#014948' }}>
                قائمة الموظفين
              </div>
              <div style={{ overflowX: 'auto', padding: '0 4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2ebeb' }}>
                      <th style={thStyle}>#</th>
                      {([
                        ['name', 'الاسم'],
                        ['totalCourses', 'الدورات'],
                        ['totalSubmissions', 'التسجيلات'],
                        ['activeCourses', 'النشطة'],
                        ['createdAt', 'تاريخ الإنشاء'],
                      ] as [SortKey, string][]).map(([k, label]) => (
                        <th key={k} onClick={() => toggleSort(k)} style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}>
                          {label}
                          {sortKey === k && <Arrow dir={sortDir} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((emp, idx) => {
                      const rate = emp.totalCourses > 0 ? Math.round((emp.activeCourses / emp.totalCourses) * 100) : 0;
                      return (
                        <tr key={emp.id}
                          onMouseEnter={() => setChartHover(emp.id)}
                          onMouseLeave={() => setChartHover(null)}
                          style={{
                            borderBottom: '1px solid #f0f5f5',
                            background: chartHover === emp.id ? '#f4fafa' : idx % 2 === 1 ? '#fafcfc' : 'transparent',
                            transition: 'background 0.12s',
                          }}>
                          <td style={tdStyle}><RankBadge n={idx + 1} /></td>
                          <td style={{ ...tdStyle, fontWeight: 600, color: '#1a2e2e' }}>{emp.name}</td>
                          <td style={tdStyle}>{emp.totalCourses}</td>
                          <td style={tdStyle}><SubsBadge n={emp.totalSubmissions} /></td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <MiniBar pct={rate} />
                              <span style={{ fontSize: '0.68rem', color: '#667777' }}>{rate}%</span>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, color: '#b0c4c4', fontSize: '0.68rem', direction: 'ltr' }}>
                            {new Date(emp.createdAt).toLocaleDateString('en-CA')}
                          </td>
                        </tr>
                      );
                    })}
                    {sorted.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a8a8' }}>لا توجد بيانات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ════════ COURSES LIST ════════ */}
            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 0', fontSize: '0.78rem', fontWeight: 700, color: '#014948' }}>
                جميع الدورات
                <span style={{ fontWeight: 400, color: '#94a8a8', marginRight: 6, fontSize: '0.72rem' }}>
                  ({allCourses.length})
                </span>
              </div>
              <div style={{ overflowX: 'auto', padding: '0 4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2ebeb' }}>
                      {['النشاط', 'الحالة', 'التسجيلات', 'المشاركون', 'تاريخ الإنشاء'].map(l => (
                        <th key={l} style={thStyle}>{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allCourses.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f5f5', background: i % 2 === 1 ? '#fafcfc' : 'transparent' }}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#1a2e2e' }}>{c.activityName || '—'}</td>
                        <td style={tdStyle}><StatusBadge status={c.status} /></td>
                        <td style={tdStyle}>{c.submissions}</td>
                        <td style={tdStyle}>{c.participantCount ?? '—'}</td>
                        <td style={{ ...tdStyle, color: '#b0c4c4', fontSize: '0.68rem', direction: 'ltr' }}>
                          {new Date(c.createdAt).toLocaleDateString('en-CA')}
                        </td>
                      </tr>
                    ))}
                    {allCourses.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a8a8' }}>لا توجد دورات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

/* ═══════════════════════════ LAYOUT HELPERS ═══════════════════════════ */

const thStyle: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '0.68rem',
  color: '#667777', letterSpacing: '0.02em', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px', color: '#4a6363',
};

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: '#bcd0d0', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Arrow({ dir }: { dir: 'asc' | 'desc' }) {
  return <span style={{ color: '#016564', marginRight: 2, fontSize: '0.6rem' }}>{dir === 'asc' ? '↑' : '↓'}</span>;
}

function RankBadge({ n }: { n: number }) {
  const colors = ['#d4a843', '#94a8a8', '#c4956a'];
  const bg = n <= 3 ? `${colors[n - 1]}18` : '#f0f5f5';
  const fg = n <= 3 ? colors[n - 1] : '#94a8a8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 6, background: bg,
      color: fg, fontSize: '0.65rem', fontWeight: 700,
    }}>
      {n}
    </span>
  );
}

function SubsBadge({ n }: { n: number }) {
  return (
    <span style={{
      background: '#0165640d', color: '#016564', fontWeight: 700,
      padding: '1px 10px', borderRadius: 6, fontSize: '0.72rem',
    }}>
      {n}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPub = status === 'PUBLISHED';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 10, fontSize: '0.67rem', fontWeight: 600,
      background: isPub ? '#0165640d' : '#f0f5f5',
      color: isPub ? '#016564' : '#667777',
    }}>
      {isPub ? 'منشور' : 'مغلق'}
    </span>
  );
}

function MiniBar({ pct }: { pct: number }) {
  return (
    <div style={{ width: 40, height: 4, background: '#e8efef', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: '#016564', borderRadius: 2, transition: 'width 0.4s ease' }} />
    </div>
  );
}

/* ═══════════════════════════ FILTERS ═══════════════════════════ */

function FiltersBar({ employees, filters, onChange }: {
  employees: { id: string; name: string }[];
  filters: Record<string, string>;
  onChange: (f: Record<string, string>) => void;
}) {
  const s: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 8, border: '1px solid #e2ebeb',
    fontSize: '0.74rem', background: '#fff', color: '#2d4141',
    outline: 'none', minWidth: 110,
  };
  const has = Object.values(filters).some(Boolean);
  return (
    <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <select value={filters.employeeId} onChange={e => onChange({ ...filters, employeeId: e.target.value })} style={s}>
        <option value="">جميع الموظفين</option>
        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select>
      <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} style={s}>
        <option value="">جميع الحالات</option>
        <option value="PUBLISHED">منشور</option>
        <option value="CLOSED">مغلق</option>
      </select>
      <input type="date" value={filters.from} onChange={e => onChange({ ...filters, from: e.target.value })} style={{ ...s, direction: 'ltr' }} />
      <input type="date" value={filters.to} onChange={e => onChange({ ...filters, to: e.target.value })} style={{ ...s, direction: 'ltr' }} />
      {has && (
        <button onClick={() => onChange({ employeeId: '', status: '', from: '', to: '' })}
          style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#f0f5f5', color: '#667777', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
          إلغاء
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════ ERROR ═══════════════════════════ */

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bf3d30" strokeWidth="1.8" strokeLinecap="round" style={{ marginBottom: 12 }}>
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <p style={{ fontSize: '0.82rem', color: '#667777', lineHeight: 1.6 }}>{message}</p>
      <button onClick={onRetry}
        style={{ marginTop: 16, padding: '8px 20px', borderRadius: 10, border: '1px solid #e2ebeb', background: '#fff', color: '#014948', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
        إعادة المحاولة
      </button>
    </div>
  );
}

/* ═══════════════════════════ CHART CARD ═══════════════════════════ */

function ChartCard({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb',
      padding: '16px 20px', ...style,
    }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════ BAR CHART ═══════════════════════════ */

function BarChart({ data, maxVal, chartHover, setChartHover }: {
  data: EmployeeReport[]; maxVal: number; chartHover: string | null; setChartHover: (id: string | null) => void;
}) {
  return (
    <div style={{ direction: 'ltr' }}>
      {data.map((e, i) => {
        const pct = (e.totalSubmissions / maxVal) * 100;
        const hue = 175 - i * 3;
        const isHovered = chartHover === e.id;
        return (
          <div key={e.id}
            onMouseEnter={() => setChartHover(e.id)}
            onMouseLeave={() => setChartHover(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7,
              opacity: chartHover !== null && !isHovered ? 0.3 : 1,
              transition: 'opacity 0.15s',
            }}>
            <span style={{
              width: 18, fontSize: '0.6rem', fontWeight: 700, color: '#b0c4c4',
              textAlign: 'center', flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <span style={{
              width: 90, fontSize: '0.72rem', fontWeight: 600, color: '#1a2e2e',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {e.name}
            </span>
            <div style={{ flex: 1, height: 20, background: '#f2f6f6', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.max(pct, 1)}%`, borderRadius: 6,
                background: `linear-gradient(90deg, hsl(${hue}, 55%, 40%) 0%, hsl(${hue - 8}, 50%, 50%) 100%)`,
                transition: 'width 0.5s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6,
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
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

/* ═══════════════════════════ DONUT CHART ═══════════════════════════ */

function DonutChart({ published, closed }: { published: number; closed: number }) {
  const total = published + closed;
  if (total === 0) return <div style={{ textAlign: 'center', padding: 32, color: '#94a8a8', fontSize: '0.78rem' }}>لا توجد بيانات</div>;
  const pct = Math.round((published / total) * 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <svg width="130" height="130" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="dpub" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f5f5" strokeWidth="16"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#dpub)" strokeWidth="16"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
        <text x="60" y="51" textAnchor="middle" fontSize="20" fontWeight="800" fill="#014948">{pct}%</text>
        <text x="60" y="65" textAnchor="middle" fontSize="8" fill="#94a8a8">نشط</text>
      </svg>
      <div>
        <Legend color="#016564" label="منشور" count={published} />
        <div style={{ height: 8 }} />
        <Legend color="#94a8a8" label="مغلق" count={closed} />
      </div>
    </div>
  );
}

function Legend({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontSize: '0.72rem', color: '#2d4141' }}>{label} <strong>{count}</strong></span>
    </div>
  );
}

/* ═══════════════════════════ AREA CHART ═══════════════════════════ */

function AreaChart({ data, maxVal, hover, setHover }: {
  data: TrendPoint[]; maxVal: number;
  hover: { x: number; data: TrendPoint } | null;
  setHover: (h: { x: number; data: TrendPoint } | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 700, H = 200, P = { t: 20, r: 20, b: 30, l: 40 };
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;
  const n = data.length;
  const step = n > 1 ? iw / (n - 1) : iw;

  const points = data.map((d, i) => ({
    x: P.l + i * step,
    y: P.t + ih - (d.total / maxVal) * ih,
    data: d,
  }));

  const areaPath = points.length > 1
    ? `M${points[0].x},${H - P.b} L${points.map(p => `${p.x},${p.y}`).join(' L')} L${points[n - 1].x},${H - P.b} Z`
    : '';

  const linePath = points.length > 1
    ? `M${points.map(p => `${p.x},${p.y}`).join(' L')}`
    : '';

  const hoverIdx = hover ? points.findIndex(p => p.data.month === hover.data.month) : -1;

  return (
    <div style={{ position: 'relative', direction: 'ltr' }} onMouseLeave={() => setHover(null)}>
      <svg ref={svgRef} width="100%" height={H} viewBox={`0 0 ${W} ${H}`}
        onMouseMove={e => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mx = ((e.clientX - rect.left) / rect.width) * W;
          let closest = points[0];
          let minDist = Infinity;
          for (const p of points) {
            const d = Math.abs(p.x - mx);
            if (d < minDist) { minDist = d; closest = p; }
          }
          if (minDist < step * 1.2) setHover({ x: closest.x, data: closest.data });
          else setHover(null);
        }}
        style={{ display: 'block' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#016564" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#016564" stopOpacity="0.02"/>
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = P.t + ih * (1 - f);
          return (
            <g key={f}>
              <line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke="#f0f5f5" strokeWidth="1" />
              <text x={P.l - 6} y={y + 3} textAnchor="end" fill="#b0c4c4" fontSize="9">{Math.round(maxVal * f)}</text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

        {/* Line */}
        {linePath && <path d={linePath} fill="none" stroke="#016564" strokeWidth="2" strokeLinejoin="round" />}

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#016564"
            style={{ transition: 'r 0.12s', cursor: 'pointer' }}
            onMouseEnter={() => setHover({ x: p.x, data: p.data })} />
        ))}

        {/* Hover indicator */}
        {hoverIdx >= 0 && (
          <>
            <line x1={points[hoverIdx].x} y1={P.t} x2={points[hoverIdx].x} y2={H - P.b}
              stroke="#016564" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r="5" fill="#016564" stroke="#fff" strokeWidth="2" />
          </>
        )}

        {/* X labels */}
        {points.filter((_, i) => i % Math.max(1, Math.floor(n / 6)) === 0 || i === n - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fill="#b0c4c4" fontSize="8">
            {fmtMonth(p.data.month)}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div style={{
          position: 'absolute', top: 8, left: `${(hover.x / W) * 100}%`,
          transform: 'translateX(-50%)',
          background: '#1a2e2e', color: '#fff', borderRadius: 10,
          padding: '8px 14px', fontSize: '0.72rem', lineHeight: 1.5,
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{fmtMonth(hover.data.month)}</div>
          <div style={{ color: '#bcd0d0' }}>التسجيلات: <strong style={{ color: '#fff' }}>{hover.data.total}</strong></div>
          {hover.data.published > 0 && <div style={{ color: '#bcd0d0' }}>منشور: <strong style={{ color: '#7ad0c0' }}>{hover.data.published}</strong></div>}
          {hover.data.closed > 0 && <div style={{ color: '#bcd0d0' }}>مغلق: <strong style={{ color: '#c4a0a0' }}>{hover.data.closed}</strong></div>}
        </div>
      )}
    </div>
  );
}