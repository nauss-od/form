import AppShell from '@/components/AppShell';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { coursePublicUrl, courseEditUrl, formatDate } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session) redirect('/login');

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { submissions: { include: { files: true }, orderBy: { createdAt: 'desc' } } }
  });

  if (!course) return <div>الدورة غير موجودة</div>;
  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) redirect('/courses');

  return (
    <AppShell title="تفاصيل الدورة" role={session.role}>
      <div className="grid" style={{ gap: 20 }}>
        <div className="card kv">
          <div className="item"><div className="muted">اسم النشاط</div><strong>{course.activityName || '—'}</strong></div>
          <div className="item"><div className="muted">مقر الانعقاد</div><strong>{course.venue || '—'}</strong></div>
          <div className="item"><div className="muted">الفترة</div><strong>{formatDate(course.startDate)} - {formatDate(course.endDate)}</strong></div>
          <div className="item"><div className="muted">الرابط العام</div><a href={coursePublicUrl(course.publicToken)} target="_blank">فتح</a></div>
          <div className="item"><div className="muted">موافقة المعالي</div><strong>{course.approvalFileName || 'غير مرفقة بعد'}</strong></div>
        </div>
        <div className="card">
          <div className="topbar"><strong>الاستجابات</strong><span className="badge badge-muted">{course.submissions.length}</span></div>
          <table className="table">
            <thead><tr><th>الاسم</th><th>الجواز</th><th>الجوال</th><th>الآيبان</th><th>رابط التعديل</th></tr></thead>
            <tbody>
              {course.submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.fullNamePassport}</td>
                  <td>{submission.passportNumber}</td>
                  <td>{submission.mobile}</td>
                  <td>{submission.iban}</td>
                  <td><a href={courseEditUrl(submission.editToken)} target="_blank">رابط التعديل</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ display: 'flex', gap: 12 }}>
          <a className="btn btn-outline" href={`/api/export/${course.id}/word`} target="_blank">تصدير Word</a>
          <a className="btn btn-outline" href={`/api/export/${course.id}/eml`} target="_blank">إنشاء EML</a>
        </div>
      </div>
    </AppShell>
  );
}
