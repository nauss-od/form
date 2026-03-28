import AppShell from '@/components/AppShell';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session = getCurrentSession();
  if (!session) redirect('/login');
  if (session.role !== 'MANAGER') redirect('/dashboard');

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <AppShell title="إدارة المستخدمين" description="مراجعة حسابات الموظفين والمديرين داخل النظام." role={session.role}>
      <section className="hero">
        <h2>المستخدمون المسجّلون</h2>
        <p>هذه الشاشة مخصصة للمدير لمراجعة الحسابات النشطة داخل المنصة، تمهيدًا لإضافة إجراءات التعطيل والتحكم الإداري المتقدم.</p>
      </section>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="section-head">
          <div>
            <h3>قائمة المستخدمين</h3>
            <p>عدد الحسابات الحالية داخل النظام: {users.length}</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className="badge badge-primary">{user.role === 'MANAGER' ? 'مدير' : 'موظف'}</span></td>
                  <td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-muted'}`}>{user.isActive ? 'نشط' : 'معطل'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
