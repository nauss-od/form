import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ParticipantPublicForm from '@/components/ParticipantPublicForm';
import { formatDate } from '@/lib/utils';

export default async function PublicFormPage({ params }: { params: { token: string } }) {
  const form = await prisma.insuranceForm.findFirst({ where: { publicLinkToken: params.token, status: 'PUBLISHED' } });
  if (!form) notFound();

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <div className="card p-6 mb-6">
        <h1 className="page-title">نموذج التسجيل العام</h1>
        <div className="grid grid-2">
          <div>اسم الدورة: <strong>{form.courseName}</strong></div>
          <div>البلد: <strong>{form.country}</strong></div>
          <div>الجهة المنظمة: <strong>{form.organizingEntity}</strong></div>
          <div>الفترة: <strong>{formatDate(form.startDate)} - {formatDate(form.endDate)}</strong></div>
        </div>
      </div>
      <ParticipantPublicForm token={params.token} />
    </div>
  );
}
