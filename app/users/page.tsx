import AppShell from '@/components/AppShell';

export default function UsersPage() {
  return (
    <AppShell title="إدارة المستخدمين" subtitle="واجهة أكثر اتزانًا لإدارة الحسابات والصلاحيات." role="MANAGER">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>الحسابات</h3>
            <p>تنسيق واضح للأسماء، الأدوار، والحالة التشغيلية.</p>
          </div>
          <button className="secondary-btn">إضافة مستخدم</button>
        </div>
        <div className="section-body data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>مدير النظام</td>
                <td>Nalshahrani@nauss.edu.sa</td>
                <td>مدير</td>
                <td>فعّال</td>
                <td><button className="ghost-btn">تعديل</button></td>
              </tr>
              <tr>
                <td>موظف تشغيل</td>
                <td>employee@nauss.edu.sa</td>
                <td>موظف</td>
                <td>فعّال</td>
                <td><button className="ghost-btn">تعديل</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
