'use client';

import { useState } from 'react';
import AppShell from '@/components/AppShell';

export default function AccountPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, password: password || undefined })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'حدث خطأ');
      setMessage('تم حفظ التعديلات');
      setPassword('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }

  return (
    <AppShell title="إدارة الحساب">
      <div className="section-card">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>الاسم</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الجديد (اترك فارغاً لعدم التغيير)" />
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>كلمة المرور الجديدة</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة مرور جديدة (اترك فارغاً لعدم التغيير)" />
          </div>
          {message ? <p className={message.includes('خطأ') ? 'form-error' : 'success-msg'}>{message}</p> : null}
          <button className="btn btn-primary" type="submit" style={{ marginTop: 20 }}>حفظ التعديلات</button>
        </form>
      </div>
    </AppShell>
  );
}
