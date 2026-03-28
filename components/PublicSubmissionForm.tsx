'use client';

import { useState } from 'react';

export default function PublicSubmissionForm({ actionUrl }: { actionUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [editLink, setEditLink] = useState('');

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      const response = await fetch(actionUrl, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'تعذر إرسال البيانات');
      setEditLink(data.editUrl || '');
      alert('تم إرسال البيانات بنجاح');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="card grid" style={{ gap: 16 }}>
      <div className="grid grid-2">
        <div><label className="label">الاسم الكامل كما في الجواز</label><input className="input" name="fullNamePassport" required /></div>
        <div><label className="label">رقم جواز السفر</label><input className="input" name="passportNumber" required /></div>
      </div>
      <div className="grid grid-2">
        <div><label className="label">تاريخ انتهاء جواز السفر</label><input className="input" type="date" name="passportExpiry" required /></div>
        <div><label className="label">رقم الهوية الوطنية</label><input className="input" name="nationalId" required /></div>
      </div>
      <div className="grid grid-2">
        <div><label className="label">رقم الهاتف المحمول</label><input className="input" name="mobile" required /></div>
        <div><label className="label">تاريخ الميلاد</label><input className="input" type="date" name="birthDate" required /></div>
      </div>
      <div><label className="label">رقم الآيبان</label><input className="input" name="iban" required /></div>
      <div className="grid grid-2">
        <div><label className="label">مرفق جواز السفر</label><input className="input" type="file" name="passportFile" required /></div>
        <div><label className="label">مرفق الهوية الوطنية</label><input className="input" type="file" name="nationalIdFile" required /></div>
      </div>
      <div><button className="btn btn-primary" disabled={loading}>{loading ? 'جاري الإرسال...' : 'إرسال البيانات'}</button></div>
      {editLink ? <div className="notice">رابط التعديل الخاص بك: <a href={editLink} target="_blank">{editLink}</a></div> : null}
    </form>
  );
}
