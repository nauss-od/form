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

  if (!course) return <div className="container"><div className="notice">الدورة غير موجودة.</div></div>;
  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) redirect('/courses');

  return (
    <AppShell title="تفاصيل الدورة" description="مراجعة بيانات النشاط، الروابط، الاستجابات، ومخرجات التصدير النهائية." role={session.role}>
      <section className="hero">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <div>
            <h2>{course.activityName || 'نشاط بدون اسم'}</h2>
            <p>{course.venue || 'مقر غير محدد'} • {formatDate(course.startDate)} — {formatDate(course.endDate)}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="btn btn-ghost" href={coursePublicUrl(course.publicToken)} target="_blank">الرابط العام</a>
            <a className="btn btn-ghost" href={`/api/export/${course.id}/word`} target="_blank">تصدير Word</a>
            <a className="btn btn-ghost" href={`/api/export/${course.id}/eml`} target="_blank">إنشاء EML</a>
          </div>
        </div>
      </section>

      <div className="kv" style={{ marginTop: 22 }}>
        <div className="item"><div className="muted">اسم النشاط</div><strong>{course.activityName || '—'}</strong></div>
        <div className="item"><div className="muted">مقر الانعقاد</div><strong>{course.venue || '—'}</strong></div>
        <div className="item"><div className="muted">عدد المشاركين</div><strong>{course.participantCount ?? '—'}</strong></div>
        <div className="item"><div className="muted">موافقة المعالي</div><strong>{course.approvalFileName || 'غير مرفقة بعد'}</strong></div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="section-head">
          <div>
            <h3>استجابات المتدربين</h3>
            <p>روابط التعديل الخاصة بكل متدرب متاحة من نفس الصفحة.</p>
          </div>
          <span className="badge badge-primary">{course.submissions.length} استجابة</span>
        </div>

        {course.submissions.length === 0 ? (
          <div className="empty-state">لا توجد استجابات بعد لهذه الدورة.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم الكامل</th>
                  <th>رقم الجواز</th>
                  <th>الجوال</th>
                  <th>الآيبان</th>
                  <th>رابط التعديل</th>
                </tr>
              </thead>
              <tbody>
                {course.submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.fullNamePassport}</td>
                    <td>{submission.passportNumber}</td>
                    <td>{submission.mobile}</td>
                    <td>{submission.iban}</td>
                    <td>
                      <a className="btn btn-outline" href={courseEditUrl(submission.editToken)} target="_blank">فتح رابط التعديل</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
