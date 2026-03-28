import PublicSubmissionForm from '@/components/PublicSubmissionForm';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export default async function PublicFormPage({ params }: { params: { token: string } }) {
  const course = await prisma.course.findUnique({ where: { publicToken: params.token } });
  if (!course) return <div className="container"><div className="notice">الرابط غير صالح</div></div>;

  return (
    <div className="page-shell">
      <div className="container">
        <div className="hero">
          <h1 style={{ marginTop: 0 }}>منصة تأمين المشاركين للدورات الخارجية</h1>
          <p>أدخل بياناتك الإلزامية وارفع الجواز والهوية الوطنية.</p>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="kv">
            <div className="item"><div className="muted">اسم النشاط</div><strong>{course.activityName || '—'}</strong></div>
            <div className="item"><div className="muted">مقر الانعقاد</div><strong>{course.venue || '—'}</strong></div>
            <div className="item"><div className="muted">الفترة</div><strong>{formatDate(course.startDate)} - {formatDate(course.endDate)}</strong></div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <PublicSubmissionForm actionUrl={`/api/public/form/${params.token}/submit`} />
        </div>
      </div>
    </div>
  );
}
