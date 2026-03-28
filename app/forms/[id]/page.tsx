import Header from '@/components/Header';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { notFound, redirect } from 'next/navigation';

export default async function FormDetailsPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) redirect('/login');

  const form = await prisma.insuranceForm.findUnique({ where: { id: params.id }, include: { participants: true, createdBy: true } });
  if (!form) notFound();
  if (user.role === 'EMPLOYEE' && form.createdById !== user.id) redirect('/forms');

  return (
    <>
      <Header />
      <div className="container">
        <h1 className="page-title">{form.courseName}</h1>
        <div className="grid grid-2 mb-6">
          <div className="card p-6">
            <h2 className="section-title">معلومات النموذج</h2>
            <div className="grid">
              <div>الحالة: <strong>{form.status}</strong></div>
              <div>البلد: <strong>{form.country}</strong></div>
              <div>الفترة: <strong>{formatDate(form.startDate)} - {formatDate(form.endDate)}</strong></div>
              <div>الجهة المنظمة: <strong>{form.organizingEntity}</strong></div>
              <div>المنشئ: <strong>{form.createdBy.name}</strong></div>
              {form.publicLinkToken ? <div>الرابط العام: <a href={`/public/form/${form.publicLinkToken}`} target="_blank">فتح الرابط</a></div> : null}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="section-title">إحصاءات</h2>
            <div className="grid">
              <div>المتوقع: <strong>{form.expectedParticipants}</strong></div>
              <div>الفعلي: <strong>{form.actualParticipants}</strong></div>
              <div>المكتمل: <strong>{form.completedRegistrations}</strong></div>
              <div>الناقص: <strong>{form.incompleteRegistrations}</strong></div>
              <div>المكرر: <strong>{form.duplicateRegistrations}</strong></div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="section-title">المشاركون</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>الاسم</th><th>الجواز</th><th>الجنسية</th><th>الحالة</th></tr></thead>
              <tbody>
                {form.participants.map((p) => <tr key={p.id}><td>{p.fullNameAr}</td><td>{p.passportNumber}</td><td>{p.nationality}</td><td>{p.status}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
