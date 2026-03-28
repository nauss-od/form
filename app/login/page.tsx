export default function LoginPage() {
  return (
    <div className="login-screen">
      <section className="login-visual">
        <div className="pattern-grid" />
        <div className="visual-card">
          <img className="visual-brand" src="/images/nauss-logo-full.svg" alt="جامعة نايف" />
          <h1 className="visual-title">منصة تأمين المشاركين للدورات الخارجية</h1>
          <p className="visual-text">
            واجهة مؤسسية أنيقة لإصدار الروابط، جمع بيانات المشاركين، وتجهيز المخرجات الرسمية بطريقة واضحة ومحكمة.
          </p>
          <div className="visual-pills">
            <div className="visual-pill">رابط مستقل لكل دورة خارجية بدون خلط بين الاستجابات.</div>
            <div className="visual-pill">تعديل خاص لكل متدرب عبر رابط مستقل بعد أول إرسال.</div>
            <div className="visual-pill">تجهيز مخرجات Word و EML بصورة مؤسسية جاهزة للإجراء الإداري.</div>
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
            <p>أدخل بيانات حسابك للوصول إلى المنصة</p>
          </div>

          <form action="/dashboard">
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input defaultValue="Nalshahrani@nauss.edu.sa" type="email" dir="ltr" style={{ textAlign: 'right' }} />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input defaultValue="Zx.321321" type="password" />
            </div>
            <button className="primary-btn" type="submit">تسجيل الدخول</button>
          </form>
        </div>
      </section>
    </div>
  );
}
