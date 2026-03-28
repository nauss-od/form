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
    <div className="auth-shell">
      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <img className="auth-card-mini-logo" src="/images/nauss-official-logo.png" alt="شعار جامعة نايف" />
            <h1 className="auth-title">تسجيل الدخول</h1>
            <p className="auth-subtitle">أدخل بيانات حسابك للوصول إلى منصة تأمين المشاركين للدورات الخارجية.</p>
          </div>
          <div className="auth-card-body">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input className="input" name="email" type="email" placeholder="example@nauss.edu.sa" required />
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label">كلمة المرور</label>
              <input className="input" name="password" type="password" placeholder="أدخل كلمة المرور" required />
            </div>
            <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" disabled={loading}>{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</button>
              <a className="btn btn-outline" href="/register">تسجيل ذاتي</a>
            </div>
          </div>
        </form>
      </section>

      <section className="auth-brand">
        <div className="auth-brand-card">
          <img className="auth-logo" src="/images/nauss-official-logo.png" alt="شعار جامعة نايف العربية للعلوم الأمنية" />
          <h1>منصة تأمين المشاركين للدورات الخارجية</h1>
          <p>
            منصة مؤسسية مخصصة لإصدار روابط مستقلة لكل نشاط خارجي، واستقبال بيانات المشاركين ومرفقاتهم، ثم
            تجميعها وإخراجها بصيغة Word و EML بطريقة منظمة ومهيأة للعمل الإداري الرسمي.
          </p>
          <div className="auth-features">
            <div className="auth-feature">رابط مستقل لكل دورة خارجية بدون خلط بين الاستجابات.</div>
            <div className="auth-feature">تعديل خاص لكل متدرب عبر رابط مستقل بعد أول إرسال.</div>
            <div className="auth-feature">تجهيز مخرجات Word و EML لرفعها مباشرة إلى الموارد البشرية.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
