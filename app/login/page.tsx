export default function LoginPage() {
  return (
    <div className="login-screen">
      <section className="login-visual">
        <div className="pattern-grid" />

        <div className="visual-card">
          <img className="visual-brand" src="/images/nauss-logo-full.svg" alt="جامعة نايف" />
          <div className="visual-kicker">واجهة تشغيل مؤسسية للدورات الخارجية</div>
          <h1 className="visual-title">منصة تأمين المشاركين للدورات الخارجية</h1>
          <p className="visual-text">
            بيئة رقمية بهوية جامعة نايف، صُمّمت لتوحيد جمع البيانات، إصدار الروابط، وإدارة المخرجات الرسمية بمظهر رصين
            وتسلسل بصري واضح.
          </p>

          <div className="visual-pills">
            <div className="visual-pill">رابط مستقل لكل دورة خارجية مع تنظيم أدق للاستجابات.</div>
            <div className="visual-pill">تعديل خاص لكل مشارك عبر رابط آمن بعد الإرسال الأول.</div>
            <div className="visual-pill">مخرجات جاهزة للإجراء الإداري بصياغة مؤسسية واضحة.</div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-brand-mini">
            <img src="/images/nauss-logo-full.svg" alt="جامعة نايف" />
          </div>

          <div className="login-heading">
            <h2>تسجيل الدخول</h2>
            <p>أدخل بيانات الحساب للوصول إلى لوحة العمل</p>
          </div>

          <form className="login-form" action="/dashboard">
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input defaultValue="Nalshahrani@nauss.edu.sa" type="email" dir="ltr" style={{ textAlign: 'left' }} />
            </div>

            <div className="field">
              <label>كلمة المرور</label>
              <input defaultValue="Zx.321321" type="password" />
            </div>

            <div className="login-meta-row">
              <span>الدخول محمي ومخصص للحسابات المخولة</span>
              <span className="login-meta-badge">NAUSS</span>
            </div>

            <button className="primary-btn" type="submit">
              <span>تسجيل الدخول</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}