import AppShell from '@/components/AppShell';

export default function NewCoursePage() {
  return (
    <AppShell title="إصدار نموذج جديد" subtitle="إدخال بيانات النشاط ثم إنشاء رابط مستقل لإرساله إلى المشاركين." role="EMPLOYEE">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>بيانات النشاط</h3>
            <p>نموذج مرتب بصريًا، واضح في الحقول، ومناسب للاستخدام اليومي السريع.</p>
          </div>
          <div className="topbar-chip">إجراء تشغيلي</div>
        </div>

        <div className="section-body">
          <div className="split-info" style={{ marginBottom: 18 }}>
            <div className="info-card">
              <small>نوع الإجراء</small>
              <strong>إصدار رابط مستقل للدورة</strong>
            </div>
            <div className="info-card">
              <small>المخرجات</small>
              <strong>رابط + متابعة استجابات + مخرجات رسمية</strong>
            </div>
            <div className="info-card">
              <small>الهدف</small>
              <strong>تنظيم جمع بيانات المشاركين بدقة</strong>
            </div>
          </div>

          <form className="form-grid">
            <div className="field">
              <label>اسم النشاط</label>
              <input placeholder="أدخل اسم النشاط" />
            </div>

            <div className="field">
              <label>مقر انعقاد النشاط</label>
              <input placeholder="أدخل المقر" />
            </div>

            <div className="field">
              <label>تاريخ البداية</label>
              <input type="date" />
            </div>

            <div className="field">
              <label>تاريخ النهاية</label>
              <input type="date" />
            </div>

            <div className="field">
              <label>عدد المشاركين</label>
              <input type="number" placeholder="0" />
            </div>

            <div className="field">
              <label>الحالة الأولية</label>
              <select defaultValue="draft">
                <option value="draft">مسودة</option>
                <option value="ready">جاهز للإرسال</option>
              </select>
            </div>

            <div className="field full">
              <label>مرفق موافقة المعالي</label>
              <div className="upload-box">
                <div>
                  <strong>اسحب الملف هنا أو اضغط للاختيار</strong>
                  <span>PDF / DOC / DOCX / صور</span>
                </div>
              </div>
            </div>

            <div className="field full">
              <label>ملاحظات داخلية</label>
              <textarea placeholder="أي توجيهات أو بيانات تشغيلية مساندة" />
              <div className="field-hint">هذا الحقل اختياري ويستخدم فقط للتوثيق الداخلي.</div>
            </div>

            <div className="field full">
              <button className="primary-btn" type="button">
                إصدار النموذج
              </button>
            </div>
          </form>
        </div>
      </section>
    </AppShell>
  );
}