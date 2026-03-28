'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return alert(data.message || 'تعذر تسجيل الدخول');
    window.location.href = '/dashboard';
  }

  return (
    <div className="login-wrap">
      <section className="login-brand">
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>منصة تأمين المشاركين للدورات الخارجية</h1>
          <p style={{ opacity: 0.85 }}>واجهة تشغيلية معاد تنظيمها فوق المرجع البصري المعتمد</p>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0 }}>تسجيل الدخول</h2>
          <p className="muted">أدخل بيانات حساب الموظف أو المدير</p>
          <div style={{ marginTop: 16 }}>
            <label className="label">البريد الإلكتروني</label>
            <input className="input" name="email" type="email" required />
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="label">كلمة المرور</label>
            <input className="input" name="password" type="password" required />
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'جاري الدخول...' : 'دخول'}</button>
            <a className="btn btn-outline" href="/register">حساب جديد</a>
          </div>
        </form>
      </section>
    </div>
  );
}
