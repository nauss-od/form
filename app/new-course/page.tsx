import AppShell from '@/components/AppShell';
import CourseForm from '@/components/CourseForm';
import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function NewCoursePage() {
  const session = getCurrentSession();
  if (!session) redirect('/login');

  return (
    <AppShell title="إصدار نموذج جديد" description="املأ بيانات النشاط الأساسية وارفع موافقة المعالي لإصدار الرابط المخصص للمتدربين." role={session.role}>
      <section className="hero">
        <h2>إصدار رابط مستقل لكل نشاط خارجي</h2>
        <p>جميع الحقول هنا اختيارية. بعد الحفظ سيُنشأ رابط خاص بهذه الدورة فقط دون أي خلط مع بقية الاستجابات.</p>
      </section>
      <div style={{ marginTop: 22 }}>
        <CourseForm />
      </div>
    </AppShell>
  );
}
