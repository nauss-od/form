import AppShell from '@/components/AppShell';

export default function DashboardPage() {
  return (
    <AppShell title="لوحة التحكم" subtitle="نظرة تنفيذية واضحة على حالة المنصة والدورات الجارية." role="MANAGER">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <h2>واجهة تشغيل بهوية هادئة ومظهر مؤسسي رفيع</h2>
            <p>
              تركز هذه اللوحة على إبراز أهم المؤشرات، تسهيل الوصول إلى النماذج، وإظهار الحالة التشغيلية للدورات الخارجية
              بأسلوب بصري منظم وواضح.
            </p>
            <div className="hero-actions">
              <a className="secondary-btn" href="/new-course">
                إصدار نموذج جديد
              </a>
              <a className="ghost-btn" href="/courses">
                عرض جميع الدورات
              </a>
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-mini-card">
              <small>الحالة العامة</small>
              <strong>تشغيل مستقر ومنظم</strong>
            </div>
            <div className="hero-mini-card">
              <small>آخر تحديث</small>
              <strong>اليوم</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <span>إجمالي الدورات</span>
          <strong>12</strong>
          <em>متابعة شاملة للأنشطة</em>
        </div>
        <div className="kpi-card">
          <span>الاستجابات المستلمة</span>
          <strong>47</strong>
          <em>تدفق مستقر للبيانات</em>
        </div>
        <div className="kpi-card">
          <span>الدورات المفتوحة</span>
          <strong>5</strong>
          <em>نماذج قيد الاستكمال</em>
        </div>
        <div className="kpi-card">
          <span>المستخدمون الفعّالون</span>
          <strong>8</strong>
          <em>حسابات تعمل حاليًا</em>
        </div>
      </section>

      <section className="panel-grid">
        <section className="section-card">
          <div className="section-head">
            <div>
              <h3>أحدث الدورات</h3>
              <p>استعراض سريع لأحدث النماذج المنشأة وحالة التفاعل معها.</p>
            </div>
            <div className="section-actions">
              <a className="secondary-btn" href="/courses">
                عرض الكل
              </a>
            </div>
          </div>

          <div className="section-body data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم النشاط</th>
                  <th>المقر</th>
                  <th>الفترة</th>
                  <th>المشاركون</th>
                  <th>الاستجابات</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="td-title">
                    <strong>برنامج الأمن السيبراني المتقدم</strong>
                    <span>رابط فعال وجاهز للاستقبال</span>
                  </td>
                  <td>فيينا</td>
                  <td>12 / 05 / 2026</td>
                  <td>18</td>
                  <td>10</td>
                  <td>
                    <span className="status-chip is-open">مفتوح</span>
                  </td>
                </tr>
                <tr>
                  <td className="td-title">
                    <strong>دورة القيادة الأمنية</strong>
                    <span>اكتملت جميع الاستجابات المطلوبة</span>
                  </td>
                  <td>الرباط</td>
                  <td>18 / 05 / 2026</td>
                  <td>12</td>
                  <td>12</td>
                  <td>
                    <span className="status-chip is-done">مكتمل</span>
                  </td>
                </tr>
                <tr>
                  <td className="td-title">
                    <strong>برنامج الجرائم المالية</strong>
                    <span>نموذج نشط بمتابعة حالية</span>
                  </td>
                  <td>باريس</td>
                  <td>22 / 05 / 2026</td>
                  <td>15</td>
                  <td>8</td>
                  <td>
                    <span className="status-chip is-open">مفتوح</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <h3>مؤشرات مختصرة</h3>
              <p>ملخص سريع للحالة التشغيلية الحالية.</p>
            </div>
          </div>

          <div className="section-body">
            <div className="stats-list">
              <div className="stat-row">
                <div>
                  <strong>الدورات الجاهزة للإرسال</strong>
                  <span>نماذج مكتملة الإعداد</span>
                </div>
                <b>04</b>
              </div>
              <div className="stat-row">
                <div>
                  <strong>استجابات تنتظر الاستكمال</strong>
                  <span>مشاركون لم يكملوا البيانات</span>
                </div>
                <b>09</b>
              </div>
              <div className="stat-row">
                <div>
                  <strong>مخرجات جاهزة للإجراء</strong>
                  <span>ملفات يمكن اعتمادها مباشرة</span>
                </div>
                <b>11</b>
              </div>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}