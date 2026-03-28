import Header from '@/components/Header';
import UsersClient from '@/components/UsersClient';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const user = await requireUser();
  if (!user) redirect('/login');
  if (user.role !== 'MANAGER') redirect('/dashboard');

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const serialized = users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));

  return (
    <>
      <Header />
      <div className="container">
        <h1 className="page-title">إدارة المستخدمين</h1>
        <UsersClient initialUsers={serialized} />
      </div>
    </>
  );
}
