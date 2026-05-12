'use client';

import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
          mobile: formData.get('mobile'),
          extension: formData.get('extension'),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'تعذر إنشاء الحساب');
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
          <h1 className="visual-title">إنشاء حساب جديد</h1>
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
            <h2>بيانات الموظف</h2>
            <p>إنشاء حساب للوصول إلى المنصة وإصدار روابط النماذج</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>الاسم الكامل *</label>
              <input name="name" required placeholder="الاسم الرباعي" />
            </div>
            <div className="field">
              <label>البريد الإلكتروني (اسم المستخدم) *</label>
              <input name="email" type="email" dir="ltr" required placeholder="example@nauss.edu.sa" />
            </div>
            <div className="field">
              <label>كلمة المرور *</label>
              <input name="password" type="password" required minLength={6} placeholder="6 أحرف على الأقل" />
            </div>
            <div className="field">
              <label>رقم الجوال</label>
              <input name="mobile" dir="ltr" placeholder="+966501234567" />
            </div>
            <div className="field">
              <label>رقم التحويلة</label>
              <input name="extension" dir="ltr" placeholder="مثال: 1234" />
            </div>
            {error ? <div className="login-error">{error}</div> : null}
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
            <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.85rem' }}>
              لديك حساب بالفعل؟ <a href="/login" style={{ color: '#014f4d', fontWeight: 600 }}>تسجيل الدخول</a>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
