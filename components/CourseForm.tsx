'use client';

import { useState } from 'react';

export default function CourseForm() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ publicUrl: string; courseId: string } | null>(null);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/courses', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'فشل الحفظ');
      const base = window.location.origin;
      setResult({ publicUrl: `${base}/public/form/${data.course.publicToken}`, courseId: data.course.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="section-card success-card">
        <h3>تم إنشاء الدورة ✅</h3>
        <p>انسخ الرابط أدناه وأرسله للمشاركين:</p>
        <div className="link-preview" dir="ltr">{result.publicUrl}</div>
        <div className="hero-actions">
          <button className="secondary-btn" onClick={() => { navigator.clipboard.writeText(result.publicUrl); alert('تم النسخ'); }}>نسخ الرابط</button>
          <a href={`/courses/${result.courseId}`} className="btn btn-primary">متابعة الدورة</a>
        </div>
      </div>
    );
  }

  return (
    <form className="form-panel" onSubmit={onSubmit}>
      <h2>بيانات الدورة</h2>
      <div className="grid grid-2">
        <div>
          <label className="label">اسم النشاط *</label>
          <input className="input" name="activityName" required placeholder="مثال: دورة الأمن السيبراني" />
        </div>
        <div>
          <label className="label">مقر الانعقاد</label>
          <input className="input" name="venue" placeholder="المدينة أو الدولة" />
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
          <input className="input" type="number" name="participantCount" min="0" />
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div style={{ marginTop: 22 }}>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'جاري الإنشاء...' : 'إنشاء الدورة والحصول على الرابط'}
        </button>
      </div>
    </form>
  );
}
