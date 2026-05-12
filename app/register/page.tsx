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
      body: JSON.stringify({ name: formData.get('name'), email: formData.get('email'), password: formData.get('password') }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return alert(data.message || 'تعذر إنشاء الحساب');
    window.location.href = '/';
  }

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <img className="auth-card-mini-logo" src="/images/nauss-official-logo.png" alt="جامعة نايف" />
            <h1 className="auth-title">تسجيل موظف جديد</h1>
            <p className="auth-subtitle">إنشاء حساب للوصول إلى المنصة وإصدار روابط النماذج</p>
          </div>
          <div className="auth-card-body">
            <div>
              <label className="label">الاسم الكامل</label>
              <input className="input" name="name" required />
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label">البريد الإلكتروني</label>
              <input className="input" type="email" name="email" required />
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label">كلمة المرور</label>
              <input className="input" type="password" name="password" minLength={8} required />
            </div>
            <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" disabled={loading}>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}</button>
              <a className="btn btn-outline" href="/login">العودة للدخول</a>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
