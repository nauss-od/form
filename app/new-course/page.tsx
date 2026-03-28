import AppShell from '@/components/AppShell';
import CourseForm from '@/components/CourseForm';
import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function NewCoursePage() {
  const session = getCurrentSession();
  if (!session) redirect('/login');
  return (
    <AppShell title="إصدار نموذج جديد" role={session.role}>
      <CourseForm />
    </AppShell>
  );
}
