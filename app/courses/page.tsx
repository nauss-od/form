import AppShell from '@/components/AppShell';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { coursePublicUrl, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CoursesPage() {
  const session = getCurrentSession();
  if (!session) redirect('/login');

  const courses = await prisma.course.findMany({
    where: session.role === 'MANAGER' ? {} : { createdByUserId: session.userId },
    include: { submissions: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AppShell title="الدورات الخارجية" description="كل دورة تمثل نموذجًا مستقلًا برابط خاص واستجابات منفصلة." role={session.role}>
      <section className="hero">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <div>
            <h2>إدارة النماذج الصادرة</h2>
            <p>تابع النماذج التي أنشأتها، وانسخ الروابط العامة، وافتح التفاصيل أو المخرجات النهائية لكل دورة.</p>
          </div>
          <Link href="/new-course" className="btn btn-ghost">إصدار نموذج جديد</Link>
        </div>
      </section>

      <div style={{ marginTop: 22 }}>
        {courses.length === 0 ? (
          <div className="card empty-state">لا توجد دورات محفوظة حاليًا.</div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <article key={course.id} className="course-card">
                <div className="course-card-top">
                  <div>
                    <h3>{course.activityName || 'نشاط بدون اسم'}</h3>
                    <div className="muted">{course.venue || 'مقر غير محدد'}</div>
                  </div>
                  <span className="badge badge-gold">{course.submissions.length} استجابة</span>
                </div>

                <div className="course-meta">
                  <div className="course-meta-row"><span>الفترة</span><strong>{formatDate(course.startDate)} — {formatDate(course.endDate)}</strong></div>
                  <div className="course-meta-row"><span>عدد المشاركين</span><strong>{course.participantCount ?? '—'}</strong></div>
                  <div className="course-meta-row"><span>موافقة المعالي</span><strong>{course.approvalFileName || 'غير مرفقة'}</strong></div>
                </div>

                <div className="course-actions">
                  <Link href={`/courses/${course.id}`} className="btn btn-primary">التفاصيل</Link>
                  <a href={coursePublicUrl(course.publicToken)} target="_blank" className="btn btn-outline">الرابط العام</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
