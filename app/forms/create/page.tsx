import Header from '@/components/Header';
import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateFormClient from '@/components/CreateFormClient';

export default async function CreateFormPage() {
  const user = await requireUser();
  if (!user) redirect('/login');

  return (
    <>
      <Header />
      <div className="container">
        <h1 className="page-title">إنشاء نموذج جديد</h1>
        <CreateFormClient />
      </div>
    </>
  );
}
