'use client';
import { useState } from 'react';

type UserRow = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string };

export default function UsersClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [message, setMessage] = useState('');

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message || 'تم');
    if (res.ok) setUsers([data.user, ...users]);
  }

  return (
    <div className="grid grid-2">
      <div className="card p-6">
        <h2 className="section-title">إضافة مستخدم</h2>
        <form onSubmit={createUser} className="grid" >
          <input className="input" placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="كلمة المرور" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="EMPLOYEE">موظف</option>
            <option value="MANAGER">مدير</option>
          </select>
          <button className="btn btn-primary">حفظ</button>
          {message ? <div className="small">{message}</div> : null}
        </form>
      </div>
      <div className="card p-6">
        <h2 className="section-title">قائمة المستخدمين</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الحالة</th></tr></thead>
            <tbody>
              {users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role === 'MANAGER' ? 'مدير' : 'موظف'}</td><td>{user.isActive ? 'نشط' : 'غير نشط'}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
