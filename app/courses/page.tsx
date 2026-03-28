import AppShell from '@/components/AppShell';

export default function CoursesPage() {
  return (
    <AppShell title="الدورات الخارجية" subtitle="عرض النماذج المنشأة ومتابعة عدد الاستجابات لكل دورة." role="MANAGER">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>قائمة الدورات</h3>
            <p>واجهة أوضح وأكثر مهنية لعرض الأنشطة الخارجية.</p>
          </div>
          <a className="secondary-btn" href="/new-course">إصدار نموذج جديد</a>
        </div>
        <div className="section-body">
          <div className="field" style={{ marginBottom: 18 }}>
            <input placeholder="ابحث باسم النشاط أو المقر" />
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم النشاط</th>
                  <th>المقر</th>
                  <th>التاريخ</th>
                  <th>عدد المشاركين</th>
                  <th>الاستجابات</th>
                  <th>الرابط</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>برنامج الأمن السيبراني المتقدم</td>
                  <td>فيينا</td>
                  <td>12 / 05 / 2026</td>
                  <td>18</td>
                  <td>10</td>
                  <td>جاهز</td>
                  <td><a className="ghost-btn" href="/courses/1">عرض</a></td>
                </tr>
                <tr>
                  <td>دورة القيادة الأمنية</td>
                  <td>الرباط</td>
                  <td>18 / 05 / 2026</td>
                  <td>12</td>
                  <td>12</td>
                  <td>جاهز</td>
                  <td><a className="ghost-btn" href="/courses/2">عرض</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
