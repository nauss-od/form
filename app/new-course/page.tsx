import AppShell from '@/components/AppShell';

export default function NewCoursePage() {
  return (
    <AppShell title="إصدار نموذج جديد" subtitle="إدخال بيانات النشاط ثم إنشاء رابط مستقل لإرساله إلى المشاركين." role="EMPLOYEE">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>بيانات النشاط</h3>
            <p>التصميم صار أنظف، أبسط، وأكثر ملاءمة للاستخدام الفعلي.</p>
          </div>
        </div>
        <div className="section-body">
          <form className="form-grid">
            <div className="field"><label>اسم النشاط</label><input placeholder="أدخل اسم النشاط" /></div>
            <div className="field"><label>مقر انعقاد النشاط</label><input placeholder="أدخل المقر" /></div>
            <div className="field"><label>تاريخ البداية</label><input type="date" /></div>
            <div className="field"><label>تاريخ النهاية</label><input type="date" /></div>
            <div className="field"><label>عدد المشاركين</label><input type="number" placeholder="0" /></div>
            <div className="field full">
              <label>مرفق موافقة المعالي</label>
              <div className="upload-box">اسحب الملف هنا أو اضغط للاختيار</div>
            </div>
            <div className="field full">
              <button className="primary-btn" type="button">إصدار النموذج</button>
            </div>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
