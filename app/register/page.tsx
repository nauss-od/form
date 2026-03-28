'use client';

import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return alert(data.message || 'تعذر إنشاء الحساب');
    window.location.href = '/dashboard';
  }

  return (
    <div className="login-wrap">
      <section className="login-brand">
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>منصة تأمين المشاركين للدورات الخارجية</h1>
          <p style={{ opacity: 0.85 }}>تسجيل ذاتي للموظفين مع اعتماد المدير على إدارة الصلاحيات والتعطيل</p>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0 }}>حساب جديد</h2>
          <div style={{ marginTop: 16 }}><label className="label">الاسم الكامل</label><input className="input" name="name" required /></div>
          <div style={{ marginTop: 16 }}><label className="label">البريد الإلكتروني</label><input className="input" type="email" name="email" required /></div>
          <div style={{ marginTop: 16 }}><label className="label">كلمة المرور</label><input className="input" type="password" name="password" required minLength={8} /></div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}</button>
            <a className="btn btn-outline" href="/login">رجوع</a>
          </div>
        </form>
      </section>
    </div>
  );
}
