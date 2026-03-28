import Header from '@/components/Header';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect('/login');

  const [formsCount, publishedCount, participantsCount, usersCount, latestForms] = await Promise.all([
    prisma.insuranceForm.count(),
    prisma.insuranceForm.count({ where: { status: 'PUBLISHED' } }),
    prisma.participant.count(),
    prisma.user.count(),
    prisma.insuranceForm.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { createdBy: true } }),
  ]);

  return (
    <>
      <Header />
      <div className="container">
        <h1 className="page-title">لوحة التحكم</h1>
        <div className="stats mb-6">
          <div className="card stat"><h3>إجمالي النماذج</h3><p>{formsCount}</p></div>
          <div className="card stat"><h3>النماذج المنشورة</h3><p>{publishedCount}</p></div>
          <div className="card stat"><h3>المشاركون</h3><p>{participantsCount}</p></div>
          <div className="card stat"><h3>المستخدمون</h3><p>{usersCount}</p></div>
        </div>
        <div className="card p-6">
          <h2 className="section-title">أحدث النماذج</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>الدورة</th><th>البلد</th><th>الحالة</th><th>المنشئ</th></tr></thead>
              <tbody>
                {latestForms.map((form) => (
                  <tr key={form.id}>
                    <td>{form.courseName}</td><td>{form.country}</td><td>{form.status}</td><td>{form.createdBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
