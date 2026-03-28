import AppShell from '@/components/AppShell';

export default function UsersPage() {
  return (
    <AppShell title="إدارة المستخدمين" subtitle="إنشاء وتعطيل حسابات الموظفين والمديرين">
      <div className="panel">
        <div className="panel-title">
          <div>
            <h3>المستخدمون</h3>
            <p>واجهة إدارة أبسط وأجمل من النسخة الحالية.</p>
          </div>
          <button className="btn btn-primary">إضافة مستخدم</button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>لا توجد بيانات</td>
                <td>—</td>
                <td>—</td>
                <td><span className="badge badge-closed">فارغ</span></td>
                <td><button className="btn btn-secondary">إدارة</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
