import AppShell from '@/components/AppShell';

export default function CoursesPage() {
  return (
    <AppShell title="الدورات الخارجية" subtitle="عرض النماذج المنشأة ومتابعة عدد الاستجابات لكل دورة." role="MANAGER">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>قائمة الدورات</h3>
            <p>واجهة أكثر تنظيمًا لعرض الأنشطة الخارجية وروابطها التشغيلية.</p>
          </div>
          <div className="section-actions">
            <a className="secondary-btn" href="/new-course">
              إصدار نموذج جديد
            </a>
          </div>
        </div>

        <div className="section-body">
          <div className="inline-toolbar">
            <div className="field" style={{ margin: 0, width: '100%', maxWidth: 420 }}>
              <input placeholder="ابحث باسم النشاط أو المقر" />
            </div>
            <div className="topbar-chip">إجمالي الدورات: 12</div>
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
                  <td className="td-title">
                    <strong>برنامج الأمن السيبراني المتقدم</strong>
                    <span>نشاط خارجي بمتابعة حالية</span>
                  </td>
                  <td>فيينا</td>
                  <td>12 / 05 / 2026</td>
                  <td>18</td>
                  <td>10</td>
                  <td>
                    <span className="status-chip is-open">جاهز</span>
                  </td>
                  <td>
                    <div className="data-actions">
                      <a className="ghost-btn" href="/courses/1">
                        عرض
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="td-title">
                    <strong>دورة القيادة الأمنية</strong>
                    <span>تم اكتمال جميع المشاركات</span>
                  </td>
                  <td>الرباط</td>
                  <td>18 / 05 / 2026</td>
                  <td>12</td>
                  <td>12</td>
                  <td>
                    <span className="status-chip is-done">جاهز</span>
                  </td>
                  <td>
                    <div className="data-actions">
                      <a className="ghost-btn" href="/courses/2">
                        عرض
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="td-title">
                    <strong>برنامج الجرائم المالية</strong>
                    <span>نموذج ما زال يستقبل البيانات</span>
                  </td>
                  <td>باريس</td>
                  <td>22 / 05 / 2026</td>
                  <td>15</td>
                  <td>8</td>
                  <td>
                    <span className="status-chip is-open">جاهز</span>
                  </td>
                  <td>
                    <div className="data-actions">
                      <a className="ghost-btn" href="/courses/3">
                        عرض
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}