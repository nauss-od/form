'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';

type Role = 'MANAGER' | 'EMPLOYEE' | string;

type AppShellProps = {
  title: string;
  subtitle?: string;
  description?: string;
  role?: Role;
  children: ReactNode;
};

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: '⌂' },
  { href: '/courses', label: 'الدورات', icon: '▤' },
  { href: '/new-course', label: 'إصدار نموذج جديد', icon: '＋' },
  { href: '/users', label: 'إدارة المستخدمين', icon: '◎', managerOnly: true },
];

export default function AppShell({ title, subtitle, description, role = 'EMPLOYEE', children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isManager = useMemo(() => String(role).toUpperCase() === 'MANAGER', [role]);
  const text = subtitle || description || '';

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <div className="shell-root">
      <aside className={`shell-sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand-wrap">
          <div className="brand-mark">
            <img src="/images/nauss-mark.svg" alt="جامعة نايف" />
          </div>
          <div className="brand-copy">
            <strong>منصة تأمين المشاركين</strong>
            <span>جامعة نايف العربية للعلوم الأمنية</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {navItems
            .filter((item) => !item.managerOnly || isManager)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
        </nav>

        <div className="sidebar-foot">
          <div className="role-card">
            <small>الوصول الحالي</small>
            <strong>{isManager ? 'حساب إداري كامل الصلاحية' : 'حساب تشغيلي لتنفيذ الأعمال اليومية'}</strong>
            <div className="role-chip">{isManager ? 'مدير' : 'موظف'}</div>
          </div>
        </div>
      </aside>

      {open ? <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="إغلاق" /> : null}

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-side">
            <button className="menu-btn" onClick={() => setOpen(true)} aria-label="فتح القائمة">
              ☰
            </button>

            <div className="topbar-stack">
              <h1 className="page-title">{title}</h1>
              {text ? <p className="page-subtitle">{text}</p> : null}
            </div>
          </div>

          <div className="topbar-side">
            <div className="topbar-chip">{isManager ? 'عرض إداري' : 'عرض تشغيلي'}</div>
            <button className="logout-btn" onClick={logout}>
              <span>⎋</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </header>

        <main className="page-body">
          <div className="page-stack">{children}</div>
        </main>
      </div>
    </div>
  );
}