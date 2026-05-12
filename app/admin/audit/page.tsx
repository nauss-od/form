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
    RESET_PASSWORD: 'إعادة تعيين كلمة المرور', EXPORT_WORD: 'تصدير Word', EXPORT_EML: 'تصدير EML',
  };

  function load(p: number) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '50' });
    if (actionFilter) params.set('action', actionFilter);
    fetch(`/api/admin/audit?${params}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setLogs(d.logs); setTotal(d.total); setPage(d.page); setPages(d.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, [actionFilter]);

  return (
    <AppShell title="سجل التدقيق" role="MANAGER">
      <div className="section-card">
        <div className="section-head">
          <h3>السجل ({total})</h3>
          <select className="input" style={{minHeight:42,maxWidth:200}} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">جميع العمليات</option>
            {Object.entries(actionLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {loading ? <p style={{padding:24}}>جاري التحميل...</p> : logs.length === 0 ? <p style={{padding:24}} className="muted">لا توجد سجلات</p> : (
          <table className="data-table">
            <thead><tr><th>التاريخ</th><th>المستخدم</th><th>العملية</th><th>الكيان</th><th>معرف الكيان</th><th>تفاصيل</th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{fontSize:'0.82rem',whiteSpace:'nowrap'}}>{new Date(l.createdAt).toLocaleString('ar-SA')}</td>
                  <td>{l.user ? `${l.user.name}` : '—'}</td>
                  <td><span className="metric-chip" style={{fontSize:'0.78rem'}}>{actionLabels[l.action] || l.action}</span></td>
                  <td style={{fontSize:'0.85rem'}}>{l.entityType}</td>
                  <td style={{fontSize:'0.78rem',direction:'ltr',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis'}}>{l.entityId}</td>
                  <td style={{fontSize:'0.82rem',color:'#64748b'}}>{l.metaJson ? JSON.stringify(l.metaJson).slice(0,60) : '—'}</td>
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
