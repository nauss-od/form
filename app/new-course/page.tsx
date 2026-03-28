import AppShell from '@/components/AppShell';

export default function NewCoursePage() {
  return (
    <AppShell title="إصدار نموذج جديد" subtitle="إنشاء نموذج خارجي برابط مستقل لكل نشاط">
      <div className="panel" style={{ maxWidth: 860 }}>
        <div className="panel-title">
          <div>
            <h3>بيانات النشاط</h3>
            <p>أدخل الحقول المطلوبة ثم أصدر الرابط الخاص بالمتدربين.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>اسم النشاط</label>
            <input className="input" />
          </div>
          <div className="form-group">
            <label>مقر انعقاد النشاط</label>
            <input className="input" />
          </div>
          <div className="form-group">
            <label>تاريخ البداية</label>
            <input className="input" type="date" />
          </div>
          <div className="form-group">
            <label>تاريخ النهاية</label>
            <input className="input" type="date" />
          </div>
          <div className="form-group">
            <label>عدد المشاركين</label>
            <input className="input" type="number" />
          </div>
          <div className="form-group">
            <label>مرفق موافقة المعالي</label>
            <input className="input" type="file" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-primary">إصدار الرابط</button>
          <button className="btn btn-secondary">إلغاء</button>
        </div>
      </div>
    </AppShell>
  );
}
