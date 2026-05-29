'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AppShell from '@/components/AppShell';

interface KPI {
  totalEmployees: number; totalCourses: number; totalSubmissions: number;
  totalActive: number; totalClosed: number; activeRate: number;
  coursesWithSubmissions: number; coursesWithoutSubmissions: number;
  avgSubmissionsPerCourse: string;
  exportPdfCount: number; exportEmlCount: number; exportExcelCount: number; totalExports: number;
  loginCount: number; insuranceViewCount: number; submitFormCount: number; pageViewCount: number;
}

interface TrendPoint { month: string; total: number; published: number; closed: number; }
interface ExportTrendPoint { month: string; pdf: number; eml: number; excel: number; total: number; }

interface TopEmp { id: string; name: string; count: number; }

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const fmtMonth = (m: string) => { const [y, mo] = m.split('-'); return `${monthNames[parseInt(mo) - 1]} ${y}`; };

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch('/api/admin/reports');
      if (r.status === 401) { window.location.href = '/login'; return; }
      const body = await r.json();
      if (!r.ok) { setError(body.message || body.error || 'خطأ'); return; }
      setData(body);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const kpis = data?.kpis as KPI | undefined;
  const employees = data?.enriched || [];
  const trend = data?.trend || [];
  const exportTrend = data?.exportTrend || [];
  const top = data?.topEmployees || {};
  const allCourses = data?.allCourses || [];

  const maxSubs = useMemo(() => Math.max(...employees.map((e: any) => e.totalSubmissions), 1), [employees]);
  const maxTrend = useMemo(() => Math.max(...trend.map((t: any) => t.total), 1), [trend]);
  const maxExport = useMemo(() => Math.max(...exportTrend.map((t: any) => t.total), 1), [exportTrend]);

  const kpiList = useMemo(() => {
    if (!kpis) return [];
    return [
      { value: kpis.totalCourses, label: 'الروابط المصدرة', desc: 'إجمالي الدورات المنشأة', icon: 'links' },
      { value: kpis.totalSubmissions, label: 'المتدربين', desc: 'إجمالي التسجيلات في النماذج', icon: 'users' },
      { value: kpis.totalEmployees, label: 'الموظفين النشطين', desc: 'عدد الموظفين المسجلين', icon: 'employees' },
      { value: kpis.avgSubmissionsPerCourse, label: 'متوسط التسجيلات/دورة', desc: 'معدل الإقبال لكل دورة', icon: 'avg' },
      { value: kpis.coursesWithSubmissions, label: 'دورات عليها تسجيلات', desc: 'دورات بها متدربون', icon: 'active' },
      { value: kpis.coursesWithoutSubmissions, label: 'دورات بدون تسجيلات', desc: 'دورات صفر متدربين', icon: 'empty' },
      { value: kpis.exportPdfCount, label: 'PDF مصدر', desc: 'عدد مرات تصدير PDF', icon: 'pdf' },
      { value: kpis.exportEmlCount, label: 'إيميلات مصدرة', desc: 'عدد مرات تصدير الإيميل', icon: 'eml' },
      { value: kpis.exportExcelCount, label: 'Excel مصدر', desc: 'عدد مرات تصدير Excel', icon: 'excel' },
      { value: kpis.insuranceViewCount, label: 'زيارات التأمين الطبي', desc: 'مشاهدات صفحة التأمين', icon: 'insurance' },
      { value: kpis.loginCount, label: 'زيارات الموقع', desc: 'إجمالي عمليات تسجيل الدخول', icon: 'visits' },
      { value: kpis.pageViewCount, label: 'مشاهدات الصفحات', desc: 'إجمالي مشاهدات جميع الصفحات', icon: 'views' },
    ];
  }, [kpis]);

  return (
    <AppShell title="التقرير التنفيذي" role="MANAGER" forceManager>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ════════ HERO HEADER ════════ */}
        <header style={{
          background: 'linear-gradient(145deg, #014a49 0%, #016564 40%, #017877 100%)',
          borderRadius: 24, padding: '28px 32px', marginBottom: 20, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: 220, height: 220, borderRadius: '50%', background: 'rgba(208,178,132,0.06)', border: '1px solid rgba(208,178,132,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18 }}>
            <img src="/images/nauss-logo-gold.png" alt="" style={{ width: 60, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.12)', paddingRight: 20 }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em' }}>التقرير التنفيذي</h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#bcd0d0' }}>
                مؤشرات شاملة لأداء المنصة — إحصاءات دقيقة لاتخاذ القرار
              </p>
            </div>
            {kpis && (
              <div style={{ marginRight: 'auto', display: 'flex', gap: 24, alignItems: 'center' }}>
                <MiniKPI value={kpis.totalCourses} label="رابط" />
                <MiniKPI value={kpis.totalSubmissions} label="متدرب" />
                <MiniKPI value={kpis.totalExports} label="تصدير" />
                <MiniKPI value={kpis.activeRate + '%'} label="نشاط" />
              </div>
            )}
          </div>
        </header>

        {/* ════════ LOADING / ERROR ════════ */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a8a8', fontSize: '0.85rem' }}>جارٍ التحميل...</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchReports} />
        ) : (
          <>
            {/* ════════ 12 KPI GRID ════════ */}
            <KpiGrid items={kpiList} />

            {/* ════════ TOP EMPLOYEES ════════ */}
            <TopEmployeesSection top={top} />

            {/* ════════ CHARTS ROW ════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 20 }}>
              <ChartCard title="ترتيب الموظفين حسب التسجيلات">
                <BarChart data={employees} maxVal={maxSubs} />
              </ChartCard>
              <ChartCard title="توزيع حالات الدورات">
                <DonutChart
                  published={allCourses.filter((c: any) => c.status === 'PUBLISHED').length}
                  closed={allCourses.filter((c: any) => c.status === 'CLOSED').length}
                />
              </ChartCard>
            </div>

            {/* ════════ EXPORT TREND CHART ════════ */}
            {exportTrend.length > 0 && (
              <ChartCard title="اتجاه الصادرات الشهرية (PDF - إيميل - Excel)" style={{ marginBottom: 20 }}>
                <ExportAreaChart data={exportTrend} maxVal={maxExport} />
              </ChartCard>
            )}

            {/* ════════ SUBMISSION TREND CHART ════════ */}
            {trend.length > 0 && (
              <ChartCard title="اتجاه التسجيلات الشهرية" style={{ marginBottom: 20 }}>
                <AreaChart data={trend} maxVal={maxTrend} />
              </ChartCard>
            )}

            {/* ════════ EMPLOYEE TABLE ════════ */}
            <EmployeeTable employees={employees} />

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
                    {allCourses.map((c: any, i: number) => (
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

/* ═══════════════════════════ KPI GRID ═══════════════════════════ */

function KpiGrid({ items }: { items: { value: string | number; label: string; desc: string; icon: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e2ebeb',
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          transition: 'box-shadow 0.15s',
        }}>
          <KpiIcon name={item.icon} />
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2e2e' }}>{item.value}</div>
            <div style={{ fontSize: '0.65rem', color: '#667777', fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: '0.6rem', color: '#b0c4c4', marginTop: 1 }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiIcon({ name }: { name: string }) {
  const sz = 20;
  const icons: Record<string, JSX.Element> = {
    links: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    users: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    employees: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#c4956a" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    avg: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    active: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    empty: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#bf3d30" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    pdf: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#bf3d30" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 18h6"/></svg>,
    eml: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    excel: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>,
    insurance: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    visits: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    views: <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#667777" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  };
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f4fafa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icons[name] || null}
    </div>
  );
}

/* ═══════════════════════════ TOP EMPLOYEES ═══════════════════════════ */

function TopEmployeesSection({ top }: { top: { bySubmissions: TopEmp[]; byLogins: TopEmp[]; byExports: TopEmp[] } }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
      <TopCard title="الأكثر تسجيلاً" items={top.bySubmissions || []} icon="📋" />
      <TopCard title="الأكثر دخولاً" items={top.byLogins || []} icon="🔑" />
      <TopCard title="الأكثر تصديراً" items={top.byExports || []} icon="📤" />
    </div>
  );
}

function TopCard({ title, items, icon }: { title: string; items: TopEmp[]; icon: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2ebeb', padding: '14px 16px' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#014948', marginBottom: 10 }}>{icon} {title}</div>
      {items.length === 0 ? (
        <div style={{ fontSize: '0.68rem', color: '#94a8a8' }}>لا توجد بيانات</div>
      ) : items.map((item, i) => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
          borderBottom: i < items.length - 1 ? '1px solid #f0f5f5' : 'none',
        }}>
          <RankBadge n={i + 1} />
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a2e2e', flex: 1 }}>{item.name}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#016564' }}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════ EMPLOYEE TABLE ═══════════════════════════ */

type SortKey = 'name' | 'totalCourses' | 'totalSubmissions' | 'activeCourses' | 'logins' | 'exports' | 'createdAt';

function EmployeeTable({ employees }: { employees: any[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('totalSubmissions');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [chartHover, setChartHover] = useState<string | null>(null);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const sorted = useMemo(() => {
    const arr = [...employees];
    arr.sort((a, b) => {
      if (sortKey === 'name') return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortKey === 'createdAt') return sortDir === 'asc' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt);
      return sortDir === 'asc' ? (a[sortKey] as number) - (b[sortKey] as number) : (b[sortKey] as number) - (a[sortKey] as number);
    });
    return arr;
  }, [employees, sortKey, sortDir]);

  return (
    <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 0', fontSize: '0.78rem', fontWeight: 700, color: '#014948' }}>
        قائمة الموظفين
        <span style={{ fontWeight: 400, color: '#94a8a8', marginRight: 6, fontSize: '0.72rem' }}>
          ({employees.length})
        </span>
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
                ['logins', 'الدخول'],
                ['exports', 'التصدير'],
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
            {sorted.map((emp: any, idx: number) => {
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
                  <td style={tdStyle}>{emp.logins || 0}</td>
                  <td style={tdStyle}>{emp.exports || 0}</td>
                  <td style={{ ...tdStyle, color: '#b0c4c4', fontSize: '0.68rem', direction: 'ltr' }}>
                    {new Date(emp.createdAt).toLocaleDateString('en-CA')}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a8a8' }}>لا توجد بيانات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ═══════════════════════════ CHARTS ═══════════════════════════ */

function BarChart({ data, maxVal }: { data: any[]; maxVal: number }) {
  const [chartHover, setChartHover] = useState<string | null>(null);
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
            <span style={{ width: 18, fontSize: '0.6rem', fontWeight: 700, color: '#b0c4c4', textAlign: 'center', flexShrink: 0 }}>
              {i + 1}
            </span>
            <span style={{ width: 90, fontSize: '0.72rem', fontWeight: 600, color: '#1a2e2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
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

function AreaChart({ data, maxVal }: { data: TrendPoint[]; maxVal: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; data: TrendPoint } | null>(null);
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
  const linePath = points.length > 1 ? `M${points.map(p => `${p.x},${p.y}`).join(' L')}` : '';
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
          for (const p of points) { const d = Math.abs(p.x - mx); if (d < minDist) { minDist = d; closest = p; } }
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
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = P.t + ih * (1 - f);
          return (<g key={f}>
            <line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke="#f0f5f5" strokeWidth="1" />
            <text x={P.l - 6} y={y + 3} textAnchor="end" fill="#b0c4c4" fontSize="9">{Math.round(maxVal * f)}</text>
          </g>);
        })}
        {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
        {linePath && <path d={linePath} fill="none" stroke="#016564" strokeWidth="2" strokeLinejoin="round" />}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#016564" style={{ transition: 'r 0.12s', cursor: 'pointer' }}
            onMouseEnter={() => setHover({ x: p.x, data: p.data })} />
        ))}
        {hoverIdx >= 0 && (
          <>
            <line x1={points[hoverIdx].x} y1={P.t} x2={points[hoverIdx].x} y2={H - P.b} stroke="#016564" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r="5" fill="#016564" stroke="#fff" strokeWidth="2" />
          </>
        )}
        {points.filter((_, i) => i % Math.max(1, Math.floor(n / 6)) === 0 || i === n - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fill="#b0c4c4" fontSize="8">{fmtMonth(p.data.month)}</text>
        ))}
      </svg>
      {hover && (<div style={{
        position: 'absolute', top: 8, left: `${(hover.x / W) * 100}%`, transform: 'translateX(-50%)',
        background: '#1a2e2e', color: '#fff', borderRadius: 10, padding: '8px 14px', fontSize: '0.72rem',
        lineHeight: 1.5, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{fmtMonth(hover.data.month)}</div>
        <div style={{ color: '#bcd0d0' }}>التسجيلات: <strong style={{ color: '#fff' }}>{hover.data.total}</strong></div>
        {hover.data.published > 0 && <div style={{ color: '#bcd0d0' }}>منشور: <strong style={{ color: '#7ad0c0' }}>{hover.data.published}</strong></div>}
        {hover.data.closed > 0 && <div style={{ color: '#bcd0d0' }}>مغلق: <strong style={{ color: '#c4a0a0' }}>{hover.data.closed}</strong></div>}
      </div>)}
    </div>
  );
}

function ExportAreaChart({ data, maxVal }: { data: ExportTrendPoint[]; maxVal: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; data: ExportTrendPoint } | null>(null);
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
  const linePath = points.length > 1 ? `M${points.map(p => `${p.x},${p.y}`).join(' L')}` : '';
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
          for (const p of points) { const d = Math.abs(p.x - mx); if (d < minDist) { minDist = d; closest = p; } }
          if (minDist < step * 1.2) setHover({ x: closest.x, data: closest.data });
          else setHover(null);
        }}
        style={{ display: 'block' }}>
        <defs>
          <linearGradient id="exportGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a843" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#d4a843" stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = P.t + ih * (1 - f);
          return (<g key={f}>
            <line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke="#f0f5f5" strokeWidth="1" />
            <text x={P.l - 6} y={y + 3} textAnchor="end" fill="#b0c4c4" fontSize="9">{Math.round(maxVal * f)}</text>
          </g>);
        })}
        {areaPath && <path d={areaPath} fill="url(#exportGrad)" />}
        {linePath && <path d={linePath} fill="none" stroke="#d4a843" strokeWidth="2" strokeLinejoin="round" />}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#d4a843" style={{ transition: 'r 0.12s', cursor: 'pointer' }}
            onMouseEnter={() => setHover({ x: p.x, data: p.data })} />
        ))}
        {hoverIdx >= 0 && (
          <>
            <line x1={points[hoverIdx].x} y1={P.t} x2={points[hoverIdx].x} y2={H - P.b} stroke="#d4a843" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r="5" fill="#d4a843" stroke="#fff" strokeWidth="2" />
          </>
        )}
        {points.filter((_, i) => i % Math.max(1, Math.floor(n / 6)) === 0 || i === n - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fill="#b0c4c4" fontSize="8">{fmtMonth(p.data.month)}</text>
        ))}
      </svg>
      {hover && (<div style={{
        position: 'absolute', top: 8, left: `${(hover.x / W) * 100}%`, transform: 'translateX(-50%)',
        background: '#1a2e2e', color: '#fff', borderRadius: 10, padding: '8px 14px', fontSize: '0.72rem',
        lineHeight: 1.5, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{fmtMonth(hover.data.month)}</div>
        <div style={{ color: '#bcd0d0' }}>الإجمالي: <strong style={{ color: '#fff' }}>{hover.data.total}</strong></div>
        <div style={{ color: '#bcd0d0' }}>PDF: <strong style={{ color: '#f08080' }}>{hover.data.pdf}</strong></div>
        <div style={{ color: '#bcd0d0' }}>إيميل: <strong style={{ color: '#7ad0c0' }}>{hover.data.eml}</strong></div>
        <div style={{ color: '#bcd0d0' }}>Excel: <strong style={{ color: '#a0d0a0' }}>{hover.data.excel}</strong></div>
      </div>)}
    </div>
  );
}

/* ═══════════════════════════ HELPERS ═══════════════════════════ */

const thStyle: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '0.68rem',
  color: '#667777', letterSpacing: '0.02em', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px', color: '#4a6363',
};

function MiniKPI({ value, label }: { value: string | number; label: string }) {
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

function ChartCard({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2ebeb', padding: '16px 20px', ...style }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#014948', marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

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