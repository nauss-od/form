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
      .then(r => r.json())
      .then(d => {
        if (d.analysis) setData(d);
        else setError(d.message || 'خطأ');
      })
      .catch(() => setError('تعذر الاتصال'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="تحليل أداء الموظفين" role="MANAGER">
      {loading ? <p>جاري التحليل...</p> : error ? <p style={{color:'var(--danger)'}}>{error}</p> : data ? (
        <div className="section-card">
          <div className="section-head"><h3>تحليل مدعوم بالذكاء الاصطناعي</h3></div>
          <div className="section-body">
            <div style={{whiteSpace:'pre-wrap',lineHeight:2,fontSize:'0.95rem',background:'#f8fafc',borderRadius:16,padding:20,border:'1px solid #e2e8f0'}}>
              {data.analysis}
            </div>
          </div>
        </div>
      ) : null}

      {data?.rawData && (
        <div className="section-card" style={{marginTop:16}}>
          <div className="section-head"><h3>البيانات الأولية</h3></div>
          <div className="section-body">
            <pre style={{fontSize:'0.78rem',maxHeight:400,overflow:'auto',background:'#f8fafc',borderRadius:12,padding:16}}>
              {JSON.stringify(data.rawData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </AppShell>
  );
}
