import AppShell from '@/components/AppShell';
import CourseForm from '@/components/CourseForm';

export default function NewCoursePage() {
  return (
    <AppShell title="إصدار نموذج جديد" subtitle="إدخال بيانات النشاط وإنشاء الرابط المستقل للمشاركين بصورة أنيقة وواضحة." role="EMPLOYEE">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <h2>تهيئة النشاط قبل الإرسال</h2>
            <p>
              واجهة إدخال أكثر هدوءًا ونظافة، تركز على الحقول الأساسية فقط، وتخدم المهمة التشغيلية بأعلى قدر من الوضوح.
            </p>
          </div>

          <div className="hero-side">
            <div className="hero-mini-card">
              <small>نوع الإجراء</small>
              <strong>إصدار رابط مستقل</strong>
            </div>
            <div className="hero-mini-card">
              <small>المخرجات</small>
              <strong>رابط — متابعة — مخرجات رسمية</strong>
            </div>
          </div>
        </div>
      </section>

      <CourseForm />
    </AppShell>
  );
}
