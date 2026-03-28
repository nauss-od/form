'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateFormClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    courseName: '', country: '', organizingEntity: '', startDate: '', endDate: '', expectedParticipants: 0,
    courseCode: '', city: '', venue: '', contactPerson: '', contactEmail: '', contactPhone: '', notes: ''
  });
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setError(data.message || 'تعذر الحفظ');
    router.push(`/forms/${data.form.id}`);
  }

  return (
    <form onSubmit={submit} className="card p-6 grid">
      <div className="grid grid-2">
        <input className="input" placeholder="اسم الدورة" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
        <input className="input" placeholder="رمز الدورة" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} />
        <input className="input" placeholder="البلد" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input className="input" placeholder="الجهة المنظمة" value={form.organizingEntity} onChange={(e) => setForm({ ...form, organizingEntity: e.target.value })} />
        <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        <input className="input" placeholder="المدينة" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="input" placeholder="المكان" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
      </div>
      <textarea className="textarea" placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      {error ? <div className="error">{error}</div> : null}
      <button className="btn btn-primary">حفظ النموذج</button>
    </form>
  );
}
