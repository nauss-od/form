'use client';

import { useState } from 'react';

type InitialValues = {
  fullNamePassport: string;
  passportNumber: string;
  passportExpiry: string;
  nationalId: string;
  mobile: string;
  birthDate: string;
  iban: string;
};

export default function EditSubmissionForm({ actionUrl, initialValues }: { actionUrl: string; initialValues: InitialValues; }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      const response = await fetch(actionUrl, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'تعذر تحديث البيانات');
      alert('تم تحديث البيانات بنجاح');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="card grid" style={{ gap: 16 }}>
      <div className="grid grid-2">
        <div><label className="label">الاسم الكامل كما في الجواز</label><input className="input" name="fullNamePassport" defaultValue={initialValues.fullNamePassport} required /></div>
        <div><label className="label">رقم جواز السفر</label><input className="input" name="passportNumber" defaultValue={initialValues.passportNumber} required /></div>
      </div>
      <div className="grid grid-2">
        <div><label className="label">تاريخ انتهاء جواز السفر</label><input className="input" type="date" name="passportExpiry" defaultValue={initialValues.passportExpiry} required /></div>
        <div><label className="label">رقم الهوية الوطنية</label><input className="input" name="nationalId" defaultValue={initialValues.nationalId} required /></div>
      </div>
      <div className="grid grid-2">
        <div><label className="label">رقم الهاتف المحمول</label><input className="input" name="mobile" defaultValue={initialValues.mobile} required /></div>
        <div><label className="label">تاريخ الميلاد</label><input className="input" type="date" name="birthDate" defaultValue={initialValues.birthDate} required /></div>
      </div>
      <div><label className="label">رقم الآيبان</label><input className="input" name="iban" defaultValue={initialValues.iban} required /></div>
      <div className="grid grid-2">
        <div><label className="label">استبدال مرفق جواز السفر</label><input className="input" type="file" name="passportFile" /></div>
        <div><label className="label">استبدال مرفق الهوية الوطنية</label><input className="input" type="file" name="nationalIdFile" /></div>
      </div>
      <div><button className="btn btn-primary" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button></div>
    </form>
  );
}
