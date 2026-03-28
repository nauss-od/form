import AppShell from '@/components/AppShell';

export default function DashboardPage() {
  return (
    <AppShell title="لوحة التحكم" subtitle="نظرة تنفيذية مختصرة على حالة المنصة والدورات الجارية." role="MANAGER">
      <section className="hero">
        <div className="hero-content">
          <h2>منصة مؤسسية بهوية جامعة نايف</h2>
          <p>تصميم أكثر أناقة وهدوءًا، مع تسلسل بصري واضح يجعل الوصول إلى النماذج، الروابط، والمخرجات أسرع وأسهل.</p>
          <div className="hero-actions">
            <a className="ghost-btn" href="/new-course">إصدار نموذج جديد</a>
            <a className="ghost-btn" href="/courses">عرض جميع الدورات</a>
          </div>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card"><span>إجمالي الدورات</span><strong>12</strong></div>
        <div className="kpi-card"><span>الاستجابات المستلمة</span><strong>47</strong></div>
        <div className="kpi-card"><span>الدورات المفتوحة</span><strong>5</strong></div>
        <div className="kpi-card"><span>المستخدمون الفعّالون</span><strong>8</strong></div>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>أحدث الدورات</h3>
            <p>استعراض سريع لأحدث النماذج المنشأة.</p>
          </div>
          <a className="secondary-btn" href="/courses">عرض الكل</a>
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
              <tr><td>برنامج الأمن السيبراني المتقدم</td><td>فيينا</td><td>12 / 05 / 2026</td><td>18</td><td>10</td><td><span className="metric-chip">مفتوح</span></td></tr>
              <tr><td>دورة القيادة الأمنية</td><td>الرباط</td><td>18 / 05 / 2026</td><td>12</td><td>12</td><td><span className="metric-chip">مكتمل</span></td></tr>
              <tr><td>برنامج الجرائم المالية</td><td>باريس</td><td>22 / 05 / 2026</td><td>15</td><td>8</td><td><span className="metric-chip">مفتوح</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
