'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Employee = {
  id: string; name: string; email: string; mobile: string | null;
  createdAt: string; lastLoginAt: string | null;
  _count: { courses: number }; submissionCount: number;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => { if (!r.ok) throw new Error('401'); return r.json(); })
      .then(d => { if (d.users) setEmployees(d.users); else setError(d.message || 'خطأ'); })
      .catch(e => { if (e.message === '401') window.location.href = '/login'; else setError('تعذر التحميل'); })
      .finally(() => setLoading(false));
  }, []);

  const totalCourses = employees.reduce((s, e) => s + e._count.courses, 0);
  const totalSubmissions = employees.reduce((s, e) => s + e.submissionCount, 0);
  const activeEmps = employees.filter(e => e._count.courses > 0 || e.submissionCount > 0);

  return (
    <AppShell title="الموظفون" role="MANAGER" forceManager>
      <div className="dashboard-grid">
        <div className="stat-card"><span className="stat-value">{employees.length}</span><span className="stat-label">إجمالي الموظفين</span></div>
        <div className="stat-card accent"><span className="stat-value">{activeEmps.length}</span><span className="stat-label">موظفون نشطون</span></div>
        <div className="stat-card"><span className="stat-value">{totalCourses}</span><span className="stat-label">إجمالي الدورات</span></div>
        <div className="stat-card"><span className="stat-value">{totalSubmissions}</span><span className="stat-label">إجمالي المسجلين</span></div>
      </div>

      <div className="section-card">
        <div className="section-head"><h3>قائمة الموظفين</h3></div>
        {loading ? <p style={{padding:24}}>جاري التحميل...</p> : error ? <p style={{padding:24,color:'var(--danger)'}}>{error}</p> : employees.length === 0 ? <p style={{padding:24}} className="muted">لا يوجد موظفون</p> : (
          <table className="data-table">
            <thead><tr><th>الموظف</th><th>البريد</th><th>الجوال</th><th>الحالة</th><th>الدورات</th><th>المسجلون</th><th>آخر نشاط</th></tr></thead>
            <tbody>
              {employees.map(e => {
                const isActive = e._count.courses > 0 || e.submissionCount > 0;
                return (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{e.email}</td>
                    <td dir="ltr">{e.mobile || '—'}</td>
                    <td><span className={`metric-chip ${isActive ? 'badge-primary' : ''}`} style={!isActive ? {background:'#f1f5f9',color:'#94a3b8'} : undefined}>{isActive ? 'نشط' : 'غير نشط'}</span></td>
                    <td>{e._count.courses}</td>
                    <td>{e.submissionCount}</td>
                    <td>{e.lastLoginAt ? new Date(e.lastLoginAt).toLocaleDateString('ar-SA') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
