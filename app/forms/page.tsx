import Header from '@/components/Header';
import FormsClient from '@/components/FormsClient';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function FormsPage() {
  const user = await requireUser();
  if (!user) redirect('/login');

  const forms = await prisma.insuranceForm.findMany({
    where: user.role === 'EMPLOYEE' ? { createdById: user.id } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header />
      <div className="container">
        <h1 className="page-title">إدارة النماذج</h1>
        <FormsClient forms={forms} />
      </div>
    </>
  );
}
