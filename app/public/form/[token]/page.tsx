'use client';

import { FormEvent, useState } from 'react';

export default function PublicFormPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/public/form/${params.token}/submit`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'حدث خطأ');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="public-page">
        <div className="public-card">
          <h2>✅ تم استلام بياناتك</h2>
          <p>شكراً لك، تم إرسال بياناتك بنجاح. سيتم التواصل معك عند الحاجة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <div className="public-card">
        <div className="public-header">
          <img src="/images/nauss-logo-gold.png" alt="NAUSS" height="48" />
          <h2>نموذج تأمين المشاركين</h2>
          <p>يرجى تعبئة البيانات بدقة حسب جواز السفر</p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="field">
            <label>الاسم حسب جواز السفر (English) *</label>
            <input name="fullNamePassport" required pattern="[A-Za-z\s.\-']+" title="أحرف إنجليزية فقط" placeholder="Full name as in passport" />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label>رقم جواز السفر *</label>
              <input name="passportNumber" required placeholder="مثال: P1234567" />
            </div>
            <div className="field">
              <label>تاريخ انتهاء الجواز *</label>
              <input name="passportExpiry" type="date" required />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label>رقم الهوية الوطنية * (10 أرقام)</label>
              <input name="nationalId" required pattern="\d{10}" title="10 أرقام" placeholder="مثال: 1234567890" maxLength={10} />
            </div>
            <div className="field">
              <label>رقم الجوال * (+966XXXXXXXXX)</label>
              <input name="mobile" required dir="ltr" pattern="\+966\d{9}" title="+966 متبوعاً بـ 9 أرقام" placeholder="+966501234567" />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label>تاريخ الميلاد *</label>
              <input name="birthDate" type="date" required />
            </div>
            <div className="field">
              <label>رقم الآيبان البنكي * (SA + 22 رقم)</label>
              <input name="iban" required dir="ltr" pattern="SA\d{22}" title="SA متبوعة بـ 22 رقماً" placeholder="SA0380000000608010167519" maxLength={24} />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label>صورة جواز السفر *</label>
              <input name="passportFile" type="file" accept="image/*,application/pdf" required />
            </div>
            <div className="field">
              <label>صورة الهوية الوطنية *</label>
              <input name="nationalIdFile" type="file" accept="image/*,application/pdf" required />
            </div>
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 20 }}>
            {loading ? 'جاري الإرسال...' : 'إرسال'}
          </button>
        </form>
      </div>
    </div>
  );
}
