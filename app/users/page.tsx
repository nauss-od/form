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
    <AppShell title="إدارة المستخدمين" role={session.role}>
      <div className="card">
        <table className="table">
          <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الحالة</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role === 'MANAGER' ? 'مدير' : 'موظف'}</td>
                <td>{user.isActive ? 'نشط' : 'معطل'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
