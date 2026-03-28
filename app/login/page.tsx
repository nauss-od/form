import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="login-shell">
      <section className="login-visual">
        <div className="login-visual-card">
          <Image src="/images/nauss-logo-gold.png" alt="NAUSS" width={320} height={150} />
          <h1>منصة تأمين المشاركين للدورات الخارجية</h1>
          <p>
            واجهة مؤسسية أنيقة لإدارة النماذج الخارجية، إصدار الروابط، جمع الاستجابات،
            وتصدير المخرجات الإدارية بشكل احترافي.
          </p>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-card">
          <div className="brand">
            <Image src="/images/nauss-logo-gold.png" alt="NAUSS" width={170} height={80} />
          </div>
          <h2>تسجيل الدخول</h2>
          <p>أدخل بيانات حسابك للوصول إلى النظام</p>

          <form action="/api/auth/login" method="post">
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input className="input" name="email" type="email" required dir="ltr" />
            </div>
            <div className="form-group">
              <label>كلمة المرور</label>
              <input className="input" name="password" type="password" required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', height: 50 }} type="submit">
              تسجيل الدخول
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
