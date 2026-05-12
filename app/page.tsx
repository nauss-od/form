import AppShell from '@/components/AppShell';

export default function UsersPage() {
  return (
    <AppShell title="إدارة المستخدمين" subtitle="تنسيق بصري أنضج لإظهار الحسابات، الصلاحيات، والحالة التشغيلية بوضوح." role="MANAGER">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>الحسابات</h3>
            <p>واجهة مرتبة لإدارة المستخدمين دون ازدحام بصري أو ضعف في الهرمية.</p>
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
                <td className="td-title">
                  <strong>مدير النظام</strong>
                  <span>صلاحية كاملة لإدارة المنصة والاطلاع التنفيذي</span>
                </td>
                <td>Nalshahrani@nauss.edu.sa</td>
                <td>مدير</td>
                <td>
                  <span className="status-chip is-done">فعّال</span>
                </td>
                <td>
                  <div className="data-actions">
                    <button className="ghost-btn">تعديل</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="td-title">
                  <strong>موظف تشغيل</strong>
                  <span>حساب مخصص لإنشاء النماذج ومتابعة الاستجابات</span>
                </td>
                <td>employee@nauss.edu.sa</td>
                <td>موظف</td>
                <td>
                  <span className="status-chip is-open">فعّال</span>
                </td>
                <td>
                  <div className="data-actions">
                    <button className="ghost-btn">تعديل</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
