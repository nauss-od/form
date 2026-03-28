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
    <form action={onSubmit} className="form-panel">
      <div className="form-panel-head">
        <div>
          <h2>بيانات النشاط</h2>
          <p>جميع الحقول أدناه اختيارية. يكتفي الموظف بتعبئتها ثم يصدر الرابط المخصص للمتدربين.</p>
        </div>
        <span className="badge badge-gold">إصدار رابط مستقل</span>
      </div>

      <div className="grid grid-2">
        <div>
          <label className="label">اسم النشاط</label>
          <input className="input" name="activityName" placeholder="مثل: دورة خارجية في رومانيا" />
        </div>
        <div>
          <label className="label">مقر انعقاد النشاط</label>
          <input className="input" name="venue" placeholder="المدينة أو الجهة المستضيفة" />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div>
          <label className="label">تاريخ البداية</label>
          <input className="input" type="date" name="startDate" />
        </div>
        <div>
          <label className="label">تاريخ النهاية</label>
          <input className="input" type="date" name="endDate" />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div>
          <label className="label">عدد المشاركين</label>
          <input className="input" type="number" name="participantCount" min="0" placeholder="العدد المتوقع" />
        </div>
        <div>
          <label className="label">مرفق موافقة المعالي</label>
          <input className="input" type="file" name="approvalFile" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
          <div className="helper">ملف واحد فقط</div>
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'جاري إصدار النموذج...' : 'إصدار النموذج والرابط'}</button>
      </div>
    </form>
  );
}
