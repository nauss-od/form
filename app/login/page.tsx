'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'تعذر تسجيل الدخول');
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <section className="login-visual">
        <div className="pattern-grid" />
        <div className="visual-card">
          <img className="visual-brand" src="/images/nauss-logo-gold.png" alt="جامعة نايف" />
          <h1 className="visual-title">منصة تأمين المشاركين<br />لللدورات الخارجية</h1>
          <p className="visual-text">جامعة نايف العربية للعلوم الأمنية — وكالة التدريب</p>
          <div className="visual-pills">
            <div className="visual-pill">إصدار روابط نماذج لكل دورة خارجية</div>
            <div className="visual-pill">متابعة تعبئة المشاركين للبيانات والمرفقات</div>
            <div className="visual-pill">تصدير ملف منظم لإدارة السفر لإصدار التأمين</div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-brand-mini">
            <img src="/images/nauss-logo-gold.png" alt="جامعة نايف" />
          </div>
          <div className="login-heading">
            <h2>تسجيل الدخول</h2>
            <p>البريد الإلكتروني وكلمة المرور الخاصة بحسابك</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input name="email" type="email" dir="ltr" required />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input name="password" type="password" required />
            </div>
            {error ? <div className="login-error">{error}</div> : null}
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
