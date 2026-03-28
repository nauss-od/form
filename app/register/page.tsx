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
        password: formData.get('password'),
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return alert(data.message || 'تعذر إنشاء الحساب');
    window.location.href = '/dashboard';
  }

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <img className="auth-card-mini-logo" src="/images/nauss-official-logo.png" alt="شعار جامعة نايف" />
            <h1 className="auth-title">تسجيل موظف جديد</h1>
            <p className="auth-subtitle">إنشاء حساب داخلي للوصول إلى النظام وإصدار روابط النماذج الخارجية بصورة مؤسسية منظمة.</p>
          </div>

          <div className="auth-card-body">
            <div>
              <label className="label">الاسم الكامل</label>
              <input className="input" name="name" placeholder="الاسم الرباعي" required />
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="label">البريد الإلكتروني</label>
              <input className="input" type="email" name="email" placeholder="example@nauss.edu.sa" required />
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="label">كلمة المرور</label>
              <input className="input" type="password" name="password" minLength={8} placeholder="8 أحرف على الأقل" required />
            </div>

            <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" disabled={loading}>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}</button>
              <a className="btn btn-outline" href="/login">العودة للدخول</a>
            </div>
          </div>
        </form>
      </section>

      <section className="auth-brand">
        <div className="auth-brand-card">
          <img className="auth-logo" src="/images/nauss-official-logo.png" alt="شعار جامعة نايف العربية للعلوم الأمنية" />
          <h1>إدارة رقمية أنيقة لرحلة تأمين المشاركين</h1>
          <p>
            الواجهة الجديدة تعزز الوضوح، تحسن اتزان التكوين البصري، وتمنح المنصة حضورًا أرقى يليق ببيئة جامعية مؤسسية
            ذات طابع تنفيذي رفيع.
          </p>
          <div className="auth-features">
            <div className="auth-feature">إنشاء النماذج الخارجية ببيانات أولية مختصرة ومنظمة.</div>
            <div className="auth-feature">استقبال المرفقات وربطها بكل استجابة بدقة أعلى.</div>
            <div className="auth-feature">تهيئة المخرجات الرسمية ضمن مظهر بصري احترافي وواضح.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
