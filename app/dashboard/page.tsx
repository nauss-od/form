import AppShell from '@/components/AppShell';

export default function DashboardPage() {
  return (
    <AppShell title="لوحة التحكم" subtitle="قراءة تنفيذية مركزة لحالة المنصة، الدورات، وسير العمل الحالي." role="MANAGER">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <h2>واجهة مؤسسية أكثر نضجًا واتزانًا</h2>
            <p>
              إعادة ضبط بصرية أشمل للمنصة، مع هرمية أوضح للمحتوى، حضور أقوى للهوية، وعناصر تحكم أنظف تسهّل
              الوصول إلى الإجراءات الأساسية دون تشويش بصري.
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
              <small>الحالة التشغيلية</small>
              <strong>مستقرة ومهيأة للعمل</strong>
            </div>
            <div className="hero-mini-card">
              <small>آخر مزامنة</small>
              <strong>اليوم — 10:30 صباحًا</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <span>إجمالي الدورات</span>
          <strong>12</strong>
          <em>مشمولة بالمتابعة</em>
        </div>
        <div className="kpi-card">
          <span>الاستجابات المستلمة</span>
          <strong>47</strong>
          <em>قيد المعالجة والتنظيم</em>
        </div>
        <div className="kpi-card">
          <span>الدورات المفتوحة</span>
          <strong>5</strong>
          <em>نماذج نشطة حاليًا</em>
        </div>
        <div className="kpi-card">
          <span>المستخدمون الفعّالون</span>
          <strong>8</strong>
          <em>حسابات تشغيلية معتمدة</em>
        </div>
      </section>

      <section className="panel-grid">
        <section className="section-card">
          <div className="section-head">
            <div>
              <h3>أحدث الدورات</h3>
              <p>عرض أكثر ترتيبًا لأهم الأنشطة الأخيرة وحالة الاستجابة لكل منها.</p>
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
                    <span>رابط مفعل واستجابات قيد التحديث</span>
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
                    <span>اكتملت الاستجابات المطلوبة بالكامل</span>
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
                    <span>حالة تشغيلية نشطة ومستمرة</span>
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
              <p>ملخص سريع للحالة اليومية داخل المنصة.</p>
            </div>
          </div>

          <div className="section-body">
            <div className="stats-list">
              <div className="stat-row">
                <div>
                  <strong>نماذج جاهزة للإرسال</strong>
                  <span>تم إعدادها ويمكن مشاركتها مباشرة</span>
                </div>
                <b>04</b>
              </div>

              <div className="stat-row">
                <div>
                  <strong>استجابات ناقصة</strong>
                  <span>تحتاج إلى متابعة أو استكمال بيانات</span>
                </div>
                <b>09</b>
              </div>

              <div className="stat-row">
                <div>
                  <strong>مخرجات جاهزة للإجراء</strong>
                  <span>ملفات قابلة للاستخدام الإداري مباشرة</span>
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
