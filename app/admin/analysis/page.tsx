'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

export default function AnalysisPage() {
  const [data, setData] = useState<{analysis: string; rawData: unknown[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/analysis')
      .then(r => { if (!r.ok) throw new Error('401'); return r.json(); })
      .then(d => {
        if (d.analysis) setData(d);
        else setError(d.message || d.error || 'خطأ');
      })
      .catch(e => { if (e.message === '401') window.location.href = '/login'; else setError('تعذر الاتصال'); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="تحليل أداء الموظفين" role="MANAGER" forceManager>
      {loading ? <div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحليل...</p></div> : error ? <div className="empty-state"><p style={{color:'var(--danger)'}}>{error}</p></div> : data ? (
        <>
          <div className="section-card">
            <div className="section-head"><h3>تحليل مدعوم بالذكاء الاصطناعي</h3></div>
            <div className="section-body">
              {data.analysis.startsWith('مفتاح API') ? (
                <p>تفعيل التحليل: أضف <code style={{background:'#f1f5f9',padding:'2px 8px',borderRadius:6}}>OPENAI_API_KEY</code> إلى إعدادات Vercel Environment Variables.</p>
              ) : (
                <div style={{whiteSpace:'pre-wrap',lineHeight:2,fontSize:'0.95rem',background:'#f8fafc',borderRadius:16,padding:20,border:'1px solid #e2e8f0'}}>
                  {data.analysis}
                </div>
              )}
            </div>
          </div>
          {data.rawData?.length ? (
            <div className="section-card" style={{marginTop:16}}>
              <div className="section-head"><h3>البيانات الأولية</h3></div>
              <div className="section-body">
                <pre style={{fontSize:'0.78rem',maxHeight:400,overflow:'auto',background:'#f8fafc',borderRadius:12,padding:16}}>
                  {JSON.stringify(data.rawData, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="muted">لا توجد بيانات</p>
      )}
    </AppShell>
  );
}
