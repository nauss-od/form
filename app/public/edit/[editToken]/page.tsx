import EditSubmissionForm from '@/components/EditSubmissionForm';
import { prisma } from '@/lib/prisma';

export default async function PublicEditPage({ params }: { params: { editToken: string } }) {
  const submission = await prisma.submission.findUnique({ where: { editToken: params.editToken }, include: { course: true } });
  if (!submission) return <div className="container"><div className="notice">رابط التعديل غير صالح.</div></div>;

  return (
    <div className="public-shell">
      <div className="public-top">
        <section className="hero">
          <div>
            <h1>تعديل بيانات المتدرب</h1>
            <p>استخدم هذا الرابط الخاص لتحديث البيانات أو استبدال المرفقات عند الحاجة دون الحاجة إلى إنشاء حساب.</p>
          </div>
          <div className="public-brand-box">
            <img src="/images/nauss-official-logo.png" alt="شعار جامعة نايف" />
          </div>
        </section>
      </div>

      <div className="form-stack">
        <div className="form-intro-grid">
          <div className="form-field-card"><div className="muted">اسم النشاط</div><strong>{submission.course.activityName || '—'}</strong></div>
          <div className="form-field-card"><div className="muted">مقر الانعقاد</div><strong>{submission.course.venue || '—'}</strong></div>
          <div className="form-field-card"><div className="muted">حالة الرابط</div><strong>نشط</strong></div>
        </div>

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
        <div className="footer-note">جامعة نايف العربية للعلوم الأمنية — رابط تعديل خاص بالمتدرب</div>
      </div>
    </div>
  );
}
