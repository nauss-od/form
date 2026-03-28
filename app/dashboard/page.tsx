import AppShell from '@/components/AppShell';

export default function DashboardPage() {
  return (
    <AppShell title="لوحة التحكم" subtitle="نظرة تنفيذية سريعة على المنصة">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <h3>واجهة أقوى. حضور بصري يليق بالجامعة.</h3>
            <p>
              هذه النسخة تضبط الهوية البصرية، تحسن وضوح التنقل، وتعيد تقديم النظام بشكل
              مؤسسي أجمل وأوضح للمستخدمين.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/images/nauss-logo-gold.png" alt="NAUSS" />
          </div>
        </div>
      </section>

      <div className="cards-grid">
        <div className="stat-card"><strong>0</strong><span>إجمالي الدورات</span></div>
        <div className="stat-card"><strong>0</strong><span>الاستجابات المستلمة</span></div>
        <div className="stat-card"><strong>0</strong><span>الروابط النشطة</span></div>
        <div className="stat-card"><strong>0</strong><span>مخرجات Word / EML</span></div>
      </div>
    </AppShell>
  );
}
