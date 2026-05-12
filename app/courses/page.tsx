import AppShell from '@/components/AppShell';

export default function CourseDetailsPage() {
  return (
    <AppShell title="تفاصيل الدورة" subtitle="مراجعة البيانات، الروابط، والاستجابات، ضمن واجهة أكثر ترتيبًا ودقة." role="MANAGER">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>بيانات النشاط</h3>
            <p>عرض متوازن للبيانات الأساسية مع حضور أوضح للرابط والمخرجات.</p>
          </div>
          <span className="status-chip is-open">نشط</span>
        </div>

        <div className="section-body">
          <div className="form-grid">
            <div className="field">
              <label>اسم النشاط</label>
              <input value="برنامج الأمن السيبراني المتقدم" readOnly />
            </div>
            <div className="field">
              <label>مقر انعقاد النشاط</label>
              <input value="فيينا" readOnly />
            </div>
            <div className="field">
              <label>تاريخ البداية</label>
              <input value="2026-05-12" readOnly />
            </div>
            <div className="field">
              <label>تاريخ النهاية</label>
              <input value="2026-05-18" readOnly />
            </div>
            <div className="field">
              <label>عدد المشاركين</label>
              <input value="18" readOnly />
            </div>
            <div className="field">
              <label>موافقة المعالي</label>
              <input value="attached-approval.pdf" readOnly />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 800 }}>رابط النموذج</label>
            <div className="link-preview">https://forms.example.com/public/form/secure-token-12345</div>
          </div>

          <div className="hero-actions" style={{ marginTop: 18 }}>
            <button className="secondary-btn">نسخ الرابط</button>
            <button className="secondary-btn">تصدير Word</button>
            <button className="secondary-btn">تصدير EML</button>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <h3>الاستجابات</h3>
            <p>مظهر أكثر نظافة لترتيب بيانات المشاركين ومراجعتها.</p>
          </div>
        </div>

        <div className="section-body list-card">
          <article className="record-card">
            <div className="record-grid">
              <div className="record-field">
                <small>الاسم الكامل</small>
                <strong>أحمد محمد علي</strong>
              </div>
              <div className="record-field">
                <small>رقم الجواز</small>
                <strong>P1234567</strong>
              </div>
              <div className="record-field">
                <small>رقم الهوية</small>
                <strong>1029384756</strong>
              </div>
              <div className="record-field">
                <small>رقم الجوال</small>
                <strong>0500000000</strong>
              </div>
              <div className="record-field">
                <small>IBAN</small>
                <strong>SA0380000000608010167519</strong>
              </div>
              <div className="record-field">
                <small>المرفقات</small>
                <strong>جواز + هوية</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
