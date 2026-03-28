import EditSubmissionForm from '@/components/EditSubmissionForm';
import { prisma } from '@/lib/prisma';

export default async function PublicEditPage({ params }: { params: { editToken: string } }) {
  const submission = await prisma.submission.findUnique({ where: { editToken: params.editToken } });
  if (!submission) return <div className="container"><div className="notice">رابط التعديل غير صالح</div></div>;

  return (
    <div className="page-shell">
      <div className="container">
        <div className="hero">
          <h1 style={{ marginTop: 0 }}>تعديل بيانات المتدرب</h1>
          <p>يمكنك تحديث البيانات واستبدال المرفقات من نفس الرابط الخاص بك.</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <EditSubmissionForm
            actionUrl={`/api/public/edit/${params.editToken}/submit`}
            initialValues={{
              fullNamePassport: submission.fullNamePassport,
              passportNumber: submission.passportNumber,
              passportExpiry: submission.passportExpiry.toISOString().slice(0, 10),
              nationalId: submission.nationalId,
              mobile: submission.mobile,
              birthDate: submission.birthDate.toISOString().slice(0, 10),
              iban: submission.iban
            }}
          />
        </div>
      </div>
    </div>
  );
}
