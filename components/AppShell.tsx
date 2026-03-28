'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'لوحة التحكم' },
  { href: '/courses', label: 'الدورات' },
  { href: '/new-course', label: 'إصدار نموذج جديد' },
  { href: '/users', label: 'إدارة المستخدمين', managerOnly: true }
];

export default function AppShell({
  title,
  description,
  children,
  role = 'EMPLOYEE'
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  role?: 'MANAGER' | 'EMPLOYEE';
}) {
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/images/nauss-official-logo.png" alt="شعار جامعة نايف العربية للعلوم الأمنية" />
          <div>
            <div className="sidebar-brand-title">منصة تأمين المشاركين</div>
            <div className="sidebar-brand-subtitle">للدورات الخارجية</div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">القائمة الرئيسية</div>
          <nav>
            {links
              .filter((item) => !item.managerOnly || role === 'MANAGER')
              .map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
                    <span>{item.label}</span>
                    <span>‹</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="badge user-pill">{role === 'MANAGER' ? 'مدير' : 'موظف'}</span>
            <button type="button" className="btn btn-ghost" onClick={logout}>تسجيل الخروج</button>
          </div>
          <div style={{ fontSize: 12, opacity: .78 }}>
            جامعة نايف العربية للعلوم الأمنية<br />
            واجهة تشغيلية مخصصة للدورات الخارجية
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            <p>{description || 'نظام مؤسسي لتجهيز روابط المتدربين، جمع الاستجابات، والتصدير بصيغ العمل الرسمية.'}</p>
          </div>
          <div className="topbar-actions">
            <span className="badge topbar-badge">{role === 'MANAGER' ? 'مدير النظام' : 'موظف التشغيل'}</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
