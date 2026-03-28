'use client';
import { useState } from 'react';

export default function ParticipantPublicForm({ token }: { token: string }) {
  const [form, setForm] = useState({ fullNameAr:'', fullNameEn:'', passportNumber:'', nationalId:'', nationality:'', dateOfBirth:'', gender:'male', mobile:'', email:'', jobTitle:'', department:'', organization:'', phone:'', travelDate:'', returnDate:'', passportExpiry:''});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/public/form/${token}/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const data = await res.json();
    setMessage(data.message || 'تم');
    setSuccess(res.ok);
  }

  return (
    <form onSubmit={submit} className="card p-6 grid">
      {message ? <div className={success ? 'success-box' : 'error'}>{message}</div> : null}
      <div className="grid grid-2">
        <input className="input" placeholder="الاسم بالعربية" value={form.fullNameAr} onChange={e=>setForm({...form, fullNameAr:e.target.value})} />
        <input className="input" placeholder="الاسم بالإنجليزية" value={form.fullNameEn} onChange={e=>setForm({...form, fullNameEn:e.target.value})} />
        <input className="input" placeholder="رقم الجواز" value={form.passportNumber} onChange={e=>setForm({...form, passportNumber:e.target.value})} />
        <input className="input" placeholder="رقم الهوية" value={form.nationalId} onChange={e=>setForm({...form, nationalId:e.target.value})} />
        <input className="input" placeholder="الجنسية" value={form.nationality} onChange={e=>setForm({...form, nationality:e.target.value})} />
        <input className="input" type="date" value={form.dateOfBirth} onChange={e=>setForm({...form, dateOfBirth:e.target.value})} />
        <input className="input" placeholder="رقم الجوال" value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} />
        <input className="input" placeholder="البريد الإلكتروني" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      </div>
      <button className="btn btn-primary">إرسال البيانات</button>
    </form>
  );
}
