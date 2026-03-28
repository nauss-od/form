import PublicSubmissionForm from '@/components/PublicSubmissionForm';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export default async function PublicFormPage({ params }: { params: { token: string } }) {
  const course = await prisma.course.findUnique({ where: { publicToken: params.token } });
  if (!course) return <div className="container"><div className="notice">الرابط غير صالح.</div></div>;

  return (
    <div className="public-shell">
      <div className="public-top">
        <section className="hero">
          <div>
            <h1>منصة تأمين المشاركين للدورات الخارجية</h1>
            <p>يرجى تعبئة البيانات الرسمية ورفع المرفقات المطلوبة بدقة. بعد الإرسال سيظهر لك رابط تعديل خاص بك.</p>
          </div>
          <div className="public-brand-box">
            <img src="/images/nauss-official-logo.png" alt="شعار جامعة نايف" />
          </div>
        </section>
      </div>

      <div className="form-stack">
        <div className="form-intro-grid">
          <div className="form-field-card"><div className="muted">اسم النشاط</div><strong>{course.activityName || '—'}</strong></div>
          <div className="form-field-card"><div className="muted">مقر الانعقاد</div><strong>{course.venue || '—'}</strong></div>
          <div className="form-field-card"><div className="muted">تاريخ البداية</div><strong>{formatDate(course.startDate)}</strong></div>
          <div className="form-field-card"><div className="muted">تاريخ النهاية</div><strong>{formatDate(course.endDate)}</strong></div>
          <div className="form-field-card"><div className="muted">عدد المشاركين</div><strong>{course.participantCount ?? '—'}</strong></div>
          <div className="form-field-card"><div className="muted">موافقة معالي الرئيس</div><strong>{course.approvalFileName || 'مرفقة داخليًا'}</strong></div>
        </div>

        <PublicSubmissionForm actionUrl={`/api/public/form/${params.token}/submit`} />
        <div className="footer-note">جامعة نايف العربية للعلوم الأمنية — منصة تأمين المشاركين للدورات الخارجية</div>
      </div>
    </div>
  );
}
