'use client';

import { useState } from 'react';

export default function CourseForm() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      const response = await fetch('/api/courses', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('فشل حفظ الدورة');
      const data = await response.json();
      window.location.href = `/courses/${data.course.id}`;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={onSubmit} className="card grid" style={{ gap: 16 }}>
      <div className="grid grid-2">
        <div>
          <label className="label">اسم النشاط</label>
          <input className="input" name="activityName" />
        </div>
        <div>
          <label className="label">مقر انعقاد النشاط</label>
          <input className="input" name="venue" />
        </div>
      </div>
      <div className="grid grid-2">
        <div>
          <label className="label">تاريخ البداية</label>
          <input className="input" type="date" name="startDate" />
        </div>
        <div>
          <label className="label">تاريخ النهاية</label>
          <input className="input" type="date" name="endDate" />
        </div>
      </div>
      <div className="grid grid-2">
        <div>
          <label className="label">عدد المشاركين</label>
          <input className="input" type="number" name="participantCount" min="0" />
        </div>
        <div>
          <label className="label">مرفق موافقة المعالي</label>
          <input className="input" type="file" name="approvalFile" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
        </div>
      </div>
      <div>
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'جاري الحفظ...' : 'إصدار النموذج والرابط'}</button>
      </div>
    </form>
  );
}
