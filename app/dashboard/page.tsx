import AppShell from '@/components/AppShell';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = getCurrentSession();
  if (!session) redirect('/login');

  const where = session.role === 'MANAGER' ? {} : { createdByUserId: session.userId };
  const [coursesCount, submissionsCount, usersCount, latestCourses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.submission.count({ where: session.role === 'MANAGER' ? {} : { course: { createdByUserId: session.userId } } }),
    session.role === 'MANAGER' ? prisma.user.count() : Promise.resolve(0),
    prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { submissions: true }
    })
  ]);

  return (
    <AppShell
      title="لوحة التحكم"
      description="إدارة النماذج الخارجية، متابعة الاستجابات، وإخراج الملفات النهائية ضمن واجهة مؤسسية متوافقة مع هوية الجامعة."
      role={session.role}
    >
      <section className="hero">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <div>
            <h2>مرحبًا، {session.name}</h2>
            <p>
              هذه الواجهة تعكس المسار التشغيلي الصحيح: دورة مستقلة، رابط متدرب، رابط تعديل خاص، وتصدير Word و EML.
            </p>
          </div>
          <div className="public-brand-box" style={{ minWidth: 220 }}>
            <img src="/images/nauss-official-logo.png" alt="شعار جامعة نايف" />
          </div>
        </div>
      </section>

      <div className="stats" style={{ marginTop: 22 }}>
        <div className="stat">
          <div className="stat-label">إجمالي الدورات الخارجية</div>
          <div className="stat-value">{coursesCount}</div>
        </div>
        <div className="stat">
          <div className="stat-label">إجمالي الاستجابات</div>
          <div className="stat-value">{submissionsCount}</div>
        </div>
        <div className="stat">
          <div className="stat-label">إجمالي المستخدمين</div>
          <div className="stat-value">{session.role === 'MANAGER' ? usersCount : '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="section-head">
          <div>
            <h3>آخر الدورات</h3>
            <p>استعراض سريع لأحدث النماذج التي تم إصدارها داخل النظام.</p>
          </div>
          <Link href="/new-course" className="btn btn-primary">إصدار نموذج جديد</Link>
        </div>

        {latestCourses.length === 0 ? (
          <div className="empty-state">لا توجد دورات بعد. ابدأ بإصدار أول نموذج.</div>
        ) : (
          <div className="course-grid">
            {latestCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-top">
                  <div>
                    <h3>{course.activityName || 'نشاط بدون اسم'}</h3>
                    <div className="muted">عدد الاستجابات الحالية: {course.submissions.length}</div>
                  </div>
                  <span className="badge badge-primary">نشط</span>
                </div>
                <div className="course-actions">
                  <Link href={`/courses/${course.id}`} className="btn btn-outline">فتح التفاصيل</Link>
                  <a href={`/public/form/${course.publicToken}`} target="_blank" className="btn btn-outline">فتح الرابط العام</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
