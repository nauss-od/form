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
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'تعذر تسجيل الدخول');
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
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
          <div className="visual-kicker">منصة تشغيل مؤسسية للدورات الخارجية</div>
          <h1 className="visual-title">منصة تأمين المشاركين للدورات الخارجية</h1>
          <p className="visual-text">
            تجربة دخول هادئة وفاخرة، بهوية جامعة نايف، وواجهة مصممة لإدارة البيانات التشغيلية والمخرجات الرسمية
            بأسلوب رصين وواضح.
          </p>

          <div className="visual-pills">
            <div className="visual-pill">إصدار روابط مستقلة لكل دورة خارجية دون تداخل في الاستجابات.</div>
            <div className="visual-pill">تتبع أدق لحالة المشاركين والمرفقات والروابط الخاصة بالتعديل.</div>
            <div className="visual-pill">مظهر مؤسسي حديث يليق بمنصة إدارية احترافية داخل الجامعة.</div>
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
            <p>أدخل بيانات الحساب للوصول إلى لوحة العمل</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input name="email" defaultValue="" type="email" dir="ltr" style={{ textAlign: 'left' }} required />
            </div>

            <div className="field">
              <label>كلمة المرور</label>
              <input name="password" defaultValue="" type="password" required />
            </div>

            {error ? <div className="login-error">{error}</div> : null}

            <div className="login-meta-row">
              <span>الوصول محمي ومخصص للحسابات المعتمدة</span>
              <span className="login-meta-badge">NAUSS</span>
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
