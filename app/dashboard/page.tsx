import AppShell from '@/components/AppShell';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = getCurrentSession();
  if (!session) redirect('/login');

  const where = session.role === 'MANAGER' ? {} : { createdByUserId: session.userId };
  const [coursesCount, submissionsCount, usersCount] = await Promise.all([
    prisma.course.count({ where }),
    prisma.submission.count({ where: session.role === 'MANAGER' ? {} : { course: { createdByUserId: session.userId } } }),
    session.role === 'MANAGER' ? prisma.user.count() : Promise.resolve(0)
  ]);

  return (
    <AppShell title="لوحة التحكم" role={session.role}>
      <section className="hero">
        <h2 style={{ marginTop: 0 }}>مرحبًا، {session.name}</h2>
        <p>هذه النسخة تُثبت المسار الصحيح للنظام: دورة مستقلة، رابط متدرب، تعديل خاص، Word و EML.</p>
      </section>
      <div className="stats" style={{ marginTop: 20 }}>
        <div className="stat"><div className="muted">إجمالي الدورات</div><div style={{ fontSize: 28, fontWeight: 800 }}>{coursesCount}</div></div>
        <div className="stat"><div className="muted">إجمالي الاستجابات</div><div style={{ fontSize: 28, fontWeight: 800 }}>{submissionsCount}</div></div>
        {session.role === 'MANAGER' ? <div className="stat"><div className="muted">إجمالي المستخدمين</div><div style={{ fontSize: 28, fontWeight: 800 }}>{usersCount}</div></div> : null}
      </div>
    </AppShell>
  );
}
