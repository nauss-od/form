'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

type AdminUser = {
  id: string; name: string; email: string; mobile: string | null;
  extension: string | null; role: string; isActive: boolean;
  lastLoginAt: string | null; createdAt: string;
  _count: { courses: number }; submissionCount: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobile: '', extension: '', role: '' });
  const [originalRole, setOriginalRole] = useState('');
  const [pwdId, setPwdId] = useState<string | null>(null);
  const [pwdValue, setPwdValue] = useState('');
  const [msg, setMsg] = useState('');

  function load() {
    setLoading(true);
    setMsg('');
    fetch('/api/admin/users')
      .then(r => { if (!r.ok) throw new Error('401'); return r.json(); })
      .then(d => { if (d.users) setUsers(d.users); else setError(d.message || 'خطأ'); })
      .catch(e => { if (e.message === '401') { window.location.href = '/login'; } else setError('تعذر التحميل'); })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(u: AdminUser) {
    setEditId(u.id);
    setOriginalRole(u.role);
    setEditForm({ name: u.name, email: u.email, mobile: u.mobile || '', extension: u.extension || '', role: u.role });
  }

  function saveEdit() {
    if (!editId) return;
    setMsg('');
    fetch(`/api/admin/users/${editId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(editForm) })
      .then(r => { if (!r.ok) throw new Error('401'); return r.json(); })
      .then(d => {
        if (d.user) {
          const roleChanged = originalRole !== editForm.role;
          setMsg(roleChanged ? 'تم التحديث ✓ — يجب على المستخدم تسجيل الخروج وإعادة الدخول لتفعيل الصلاحية الجديدة' : 'تم التحديث ✓');
          setEditId(null); load();
        } else setMsg(d.message || 'خطأ');
      })
      .catch(e => { if (e.message === '401') window.location.href = '/login'; else setMsg('فشل التحديث'); });
  }

  function toggleStatus(u: AdminUser) {
    setMsg('');
    fetch(`/api/admin/users/${u.id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ isActive: !u.isActive }) })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (d.user) load(); else setMsg(d.message || 'خطأ'); })
      .catch(() => setMsg('فشل تغيير الحالة'));
  }

  function changePassword(id: string) {
    if (!pwdValue || pwdValue.length < 6) { setMsg('كلمة المرور 6 أحرف على الأقل'); return; }
    setMsg('');
    fetch(`/api/admin/users/${id}/password`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password: pwdValue }) })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        if (d.success) { setMsg('تم تغيير كلمة المرور ✓'); setPwdId(null); setPwdValue(''); }
        else setMsg(d.message || 'خطأ');
      })
      .catch(() => setMsg('فشل تغيير كلمة المرور'));
  }

  function deleteUser(id: string, name: string) {
    if (!confirm(`حذف "${name}"؟ سيتم حذف جميع بياناته.`)) return;
    setMsg('');
    fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (d.success) { setMsg('تم الحذف ✓'); load(); } else setMsg(d.message || 'خطأ'); })
      .catch(() => setMsg('فشل الحذف'));
  }

  return (
    <AppShell title="إدارة المستخدمين" role="MANAGER" forceManager>
      {msg && <div style={{ padding: '12px 16px', borderRadius: 12, background: msg.includes('✓') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✓') ? '#014f4d' : '#dc2626', marginBottom: 12, fontWeight:700, fontSize: '0.85rem' }}>{msg}</div>}
      {loading ? <div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div> : error ? <div className="empty-state"><p style={{color:'var(--danger)'}}>{error}</p></div> : (
        <div className="section-card">
          <div className="section-head"><h3>جميع المستخدمين ({users.length})</h3></div>
          <table className="data-table">
            <thead><tr><th>الاسم</th><th>البريد</th><th>الجوال</th><th>الدور</th><th>الحالة</th><th>دورات</th><th>مسجلون</th><th>الإجراءات</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  {editId === u.id ? (
                    <>
                      <td><input className="input" style={{minHeight:36,width:120}} value={editForm.name} onChange={e => setEditForm(f=>({...f,name:e.target.value}))} /></td>
                      <td><input className="input" style={{minHeight:36,width:160,direction:'ltr'}} value={editForm.email} onChange={e => setEditForm(f=>({...f,email:e.target.value}))} /></td>
                      <td><input className="input" style={{minHeight:36,width:120}} value={editForm.mobile} onChange={e => setEditForm(f=>({...f,mobile:e.target.value}))} /></td>
                      <td>
                        <select className="input" style={{minHeight:36}} value={editForm.role} onChange={e => setEditForm(f=>({...f,role:e.target.value}))}>
                          <option value="EMPLOYEE">موظف</option><option value="MANAGER">مدير</option>
                        </select>
                      </td>
                      <td><span className={`metric-chip`} style={{background: u.isActive ? 'rgba(1,101,100,0.1)' : '#f1f5f9', color: u.isActive ? '#016564' : '#94a3b8'}}>{u.isActive ? 'نشط' : 'موقوف'}</span></td>
                      <td>{u._count.courses}</td>
                      <td>{u.submissionCount}</td>
                      <td className="data-actions">
                        <button className="secondary-btn" style={{minHeight:34,fontSize:'0.82rem'}} onClick={saveEdit}>حفظ</button>
                        <button className="ghost-btn" style={{minHeight:34,fontSize:'0.82rem'}} onClick={() => setEditId(null)}>إلغاء</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{u.name}</strong></td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{u.email}</td>
                      <td dir="ltr">{u.mobile || '—'}</td>
                      <td><span className="metric-chip" style={{background: u.role === 'MANAGER' ? 'rgba(208,178,132,0.2)' : 'rgba(1,101,100,0.08)', color: u.role === 'MANAGER' ? '#8a6a39' : '#016564'}}>{u.role === 'MANAGER' ? 'مدير' : 'موظف'}</span></td>
                      <td>
                        <button className="secondary-btn" style={{minHeight:34,fontSize:'0.82rem',background: u.isActive ? 'rgba(1,101,100,0.08)' : 'rgba(191,61,48,0.08)', color: u.isActive ? '#016564' : '#bf3d30'}} onClick={() => toggleStatus(u)}>
                          {u.isActive ? 'نشط' : 'موقوف'}
                        </button>
                      </td>
                      <td>{u._count.courses}</td>
                      <td>{u.submissionCount}</td>
                      <td className="data-actions">
                        <button className="link-btn" onClick={() => startEdit(u)}>تعديل</button>
                        <button className="link-btn" style={{color:'#016564'}} onClick={() => { setPwdId(u.id); setPwdValue(''); }}>كلمة المرور</button>
                        <button className="link-btn" style={{color:'#bf3d30'}} onClick={() => deleteUser(u.id, u.name)}>حذف</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pwdId && (
        <div className="section-card" style={{marginTop:16}}>
          <div className="section-head"><h3>تغيير كلمة المرور</h3></div>
          <div className="section-body" style={{display:'flex',gap:12,alignItems:'center'}}>
            <input className="input" style={{minHeight:44,maxWidth:280}} type="password" placeholder="كلمة المرور الجديدة" value={pwdValue} onChange={e => setPwdValue(e.target.value)} />
            <button className="primary-btn" style={{width:'auto',minHeight:44,padding:'0 24px'}} onClick={() => changePassword(pwdId)}>حفظ</button>
            <button className="ghost-btn" style={{minHeight:44}} onClick={() => { setPwdId(null); setPwdValue(''); }}>إلغاء</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
