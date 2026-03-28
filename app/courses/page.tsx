import AppShell from '@/components/AppShell';

export default function CoursesPage() {
  return (
    <AppShell title="الدورات الخارجية" subtitle="إدارة النماذج والروابط والاستجابات">
      <div className="panel">
        <div className="panel-title">
          <div>
            <h3>قائمة الدورات</h3>
            <p>شكل جدولي أوضح وأكثر اتزانًا بصريًا.</p>
          </div>
          <button className="btn btn-primary">إصدار نموذج جديد</button>
        </div>

        <div className="toolbar">
          <input className="input" placeholder="ابحث باسم النشاط أو المكان" style={{ maxWidth: 340 }} />
          <select className="select" style={{ maxWidth: 180 }}>
            <option>كل الحالات</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>اسم النشاط</th>
                <th>المقر</th>
                <th>الفترة</th>
                <th>المشاركون</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>لا توجد بيانات بعد</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td><span className="badge badge-closed">فارغ</span></td>
                <td>
                  <button className="btn btn-secondary" type="button">عرض</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
