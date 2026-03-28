'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const links = [
  { href: '/dashboard', label: 'لوحة التحكم' },
  { href: '/courses', label: 'الدورات الخارجية' },
  { href: '/new-course', label: 'إصدار نموذج جديد' },
  { href: '/users', label: 'إدارة المستخدمين' },
];

type AppShellProps = {
  title: string;
  subtitle?: string;
  description?: string;
  role?: string;
  children: ReactNode;
};

export default function AppShell({
  title,
  subtitle,
  description,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const headerText = subtitle ?? description;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Image src="/images/nauss-logo-gold.png" alt="NAUSS" width={56} height={56} />
          <div>
            <h1>منصة تأمين المشاركين</h1>
            <p>للدورات الخارجية</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
            >
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <form action="/api/auth/logout" method="post">
            <button className="logout-btn" type="submit">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            {headerText ? <div className="subtitle">{headerText}</div> : null}
          </div>
          <Image src="/images/nauss-logo-gold.png" alt="NAUSS" width={84} height={84} />
        </header>

        <main className="page-wrap">{children}</main>
      </div>
    </div>
  );
}