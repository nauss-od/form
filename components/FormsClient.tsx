'use client';
import Link from 'next/link';

type FormRow = {
  id: string; courseName: string; country: string; status: string;
  actualParticipants: number; expectedParticipants: number; publicLinkToken: string | null;
};

export default function FormsClient({ forms }: { forms: FormRow[] }) {
  async function publish(id: string) {
    const res = await fetch('/api/forms', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'publish' }) });
    if (res.ok) location.reload();
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">قائمة النماذج</h2>
        <Link className="btn btn-primary" href="/forms/create">نموذج جديد</Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>الدورة</th><th>البلد</th><th>الحالة</th><th>المشاركون</th><th>الإجراءات</th></tr></thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id}>
                <td>{form.courseName}</td>
                <td>{form.country}</td>
                <td><span className={`badge ${form.status === 'PUBLISHED' ? 'green' : form.status === 'DRAFT' ? 'orange' : 'blue'}`}>{form.status}</span></td>
                <td>{form.actualParticipants} / {form.expectedParticipants}</td>
                <td className="flex gap-3">
                  <Link href={`/forms/${form.id}`}>عرض</Link>
                  {form.status === 'DRAFT' ? <button className="btn btn-secondary" onClick={() => publish(form.id)}>نشر</button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
