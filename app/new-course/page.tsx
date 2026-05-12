import AppShell from '@/components/AppShell';
import CourseForm from '@/components/CourseForm';

export default function NewCoursePage() {
  return (
    <AppShell title="إنشاء دورة جديدة">
      <CourseForm />
    </AppShell>
  );
}
