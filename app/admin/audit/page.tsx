'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type AuditEntry = {
  id: string; action: string; entityType: string; entityId: string;
  metaJson: Record<string, unknown> | null;
  createdAt: string;
  user: { name: string; email: string } | null;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const actionLabels: Record<string, string> = {
    LOGIN: 'تسجيل دخول', CREATE_COURSE: 'إنشاء دورة', UPDATE_USER: 'تحديث مستخدم',
    DELETE_USER: 'حذف مستخدم', ACTIVATE_USER: 'تفعيل مستخدم', DEACTIVATE_USER: 'إيقاف مستخدم',
    RESET_PASSWORD: 'إعادة تعيين كلمة المرور', EXPORT_PDF: 'تصدير PDF', EXPORT_EML: 'تصدير EML',
    VIEW_INSURANCE: 'مشاهدة التأمين', SUBMIT_FORM: 'تقديم النموذج', PAGE_VIEW: 'مشاهدة الصفحة',
    EXPORT_EXCEL: 'تصدير Excel', DELETE_COURSE: 'حذف دورة', UPDATE_COURSE: 'تحديث دورة',
    DELETE_SUBMISSION: 'حذف تسجيل',
  };

  const entityLabels: Record<string, string> = {
    Course: 'دورة', User: 'مستخدم', Submission: 'تسجيل', Page: 'صفحة',
  };

  const metaLabels: Record<string, string> = {
    activityName: 'اسم النشاط', updated: 'التحديثات', isActive: 'الحالة',
    name: 'الاسم', email: 'البريد الإلكتروني', role: 'الصلاحية',
  };

  function formatMeta(meta: Record<string, unknown> | null): string {
    if (!meta) return '—';
    return Object.entries(meta)
      .map(([k, v]) => {
        const label = metaLabels[k] || k;
        if (Array.isArray(v)) return `${label}: ${v.join('، ')}`;
        return `${label}: ${String(v)}`;
      })
      .join(' | ');
  }

  function load(p: number) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '50' });
    if (actionFilter) params.set('action', actionFilter);
    fetch(`/api/admin/audit?${params}`)
      .then(r => { if (!r.ok) throw new Error('401'); return r.json(); })
      .then(d => { setLogs(d.logs); setTotal(d.total); setPage(d.page); setPages(d.pages); })
      .catch(e => { if (e.message === '401') window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, [actionFilter]);

  return (
    <AppShell title="سجل التدقيق" role="MANAGER" forceManager>
      <div className="section-card">
        <div className="section-head">
          <h3>السجل ({total})</h3>
          <select className="input" style={{minHeight:42,maxWidth:200}} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">جميع العمليات</option>
            {Object.entries(actionLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {loading ? <div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div> : logs.length === 0 ? <div className="empty-state"><p>لا توجد سجلات</p></div> : (
          <table className="data-table">
            <thead><tr><th>التاريخ</th><th>المستخدم</th><th>العملية</th><th>الكيان</th><th>التفاصيل</th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{fontSize:'0.82rem',whiteSpace:'nowrap'}}>{new Date(l.createdAt).toLocaleString('ar-SA')}</td>
                  <td>{l.user ? `${l.user.name}` : '—'}</td>
                  <td><span className="metric-chip" style={{fontSize:'0.78rem'}}>{actionLabels[l.action] || l.action}</span></td>
                  <td style={{fontSize:'0.85rem'}}><span className="metric-chip" style={{fontSize:'0.78rem'}}>{entityLabels[l.entityType] || l.entityType}</span> <span style={{fontSize:'0.72rem',color:'#94a3b8',fontFamily:'monospace'}}>{l.entityId.slice(0,12)}</span></td>
                  <td style={{fontSize:'0.82rem',color:'#64748b',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{formatMeta(l.metaJson)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pages > 1 && (
          <div style={{display:'flex',gap:8,justifyContent:'center',padding:18}}>
            <button className="ghost-btn" style={{minHeight:38}} disabled={page <= 1} onClick={() => load(page-1)}>السابق</button>
            <span style={{display:'flex',alignItems:'center',fontSize:'0.85rem',color:'#64748b'}}>{page} / {pages}</span>
            <button className="ghost-btn" style={{minHeight:38}} disabled={page >= pages} onClick={() => load(page+1)}>التالي</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
