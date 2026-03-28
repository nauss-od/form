import Link from 'next/link';

export default function AppShell({
  title,
  children,
  role = 'EMPLOYEE'
}: {
  title: string;
  children: React.ReactNode;
  role?: 'MANAGER' | 'EMPLOYEE';
}) {
  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>منصة تأمين المشاركين</div>
          <div style={{ opacity: 0.8, fontSize: 13 }}>للدورات الخارجية</div>
        </div>
        <nav>
          <Link href="/dashboard" className="active">لوحة التحكم</Link>
          <Link href="/courses">الدورات</Link>
          <Link href="/new-course">إصدار نموذج جديد</Link>
          {role === 'MANAGER' ? <Link href="/users">إدارة المستخدمين</Link> : null}
        </nav>
      </aside>
      <main className="content">
        <div className="topbar">
          <h1 style={{ margin: 0, fontSize: 24 }}>{title}</h1>
          <div className="badge badge-muted">{role === 'MANAGER' ? 'مدير' : 'موظف'}</div>
        </div>
        {children}
      </main>
    </div>
  );
}
