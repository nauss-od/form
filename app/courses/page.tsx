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
    <AppShell title="الدورات" role={session.role}>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>اسم النشاط</th><th>الفترة</th><th>العدد</th><th>الاستجابات</th><th>الرابط</th><th>التفاصيل</th></tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.activityName || '—'}</td>
                <td>{formatDate(course.startDate)} - {formatDate(course.endDate)}</td>
                <td>{course.participantCount ?? '—'}</td>
                <td>{course.submissions.length}</td>
                <td><a href={coursePublicUrl(course.publicToken)} target="_blank">الرابط العام</a></td>
                <td><Link href={`/courses/${course.id}`}>فتح</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
