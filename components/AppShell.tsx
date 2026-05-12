'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';

type Role = 'MANAGER' | 'EMPLOYEE' | string;

type AppShellProps = {
  title: string;
  children: ReactNode;
  role?: Role;
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const managerNav: NavItem[] = [
  { href: '/', label: 'لوحة المعلومات', icon: '📊' },
  { href: '/employees', label: 'الموظفين', icon: '👥' },
  { href: '/courses', label: 'الدورات النشطة', icon: '📋' },
  { href: '/admin/users', label: 'إدارة المستخدمين', icon: '⚙️' },
  { href: '/admin/audit', label: 'سجل التدقيق', icon: '📝' },
  { href: '/admin/analysis', label: 'تحليل الأداء', icon: '📈' },
  { href: '/account', label: 'الحساب', icon: '👤' },
];

const employeeNav: NavItem[] = [
  { href: '/', label: 'لوحة المستخدم', icon: '📊' },
  { href: '/new-course', label: 'إنشاء دورة جديدة', icon: '➕' },
  { href: '/courses', label: 'الدورات', icon: '📋' },
  { href: '/account', label: 'الحساب', icon: '👤' },
];

export default function AppShell({ title, role = 'EMPLOYEE', children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isManagerAccount = useMemo(() => String(role).toUpperCase() === 'MANAGER', [role]);
  const [activeRole, setActiveRole] = useState<'MANAGER' | 'EMPLOYEE'>(isManagerAccount ? 'MANAGER' : 'EMPLOYEE');

  useEffect(() => {
    if (!isManagerAccount) {
      setActiveRole('EMPLOYEE');
      return;
    }
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('nauss-active-role') : null;
    if (saved === 'EMPLOYEE' || saved === 'MANAGER') setActiveRole(saved);
  }, [isManagerAccount]);

  function handleRoleSwitch(nextRole: 'MANAGER' | 'EMPLOYEE') {
    setActiveRole(nextRole);
    if (typeof window !== 'undefined') window.localStorage.setItem('nauss-active-role', nextRole);
    window.dispatchEvent(new Event('storage'));
  }

  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } finally { window.location.href = '/login'; }
  }

  const isManagerView = isManagerAccount && activeRole === 'MANAGER';
  const navItems = isManagerView ? managerNav : employeeNav;

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <div className="shell-root">
      <aside className={`shell-sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand-wrap">
          <div className="brand-mark">
            <img src="/images/nauss-mark.svg" alt="NAUSS" />
          </div>
          <div className="brand-copy">
            <strong>منصة التأمين</strong>
            <span>الدورات الخارجية</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {open ? <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="إغلاق" /> : null}

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-side">
            <button className="menu-btn" onClick={() => setOpen(true)} aria-label="فتح القائمة">
              ☰
            </button>
            <h1 className="page-title">{title}</h1>
          </div>

          <div className="topbar-side">
            {isManagerAccount ? (
              <div className="role-toggle">
                <button type="button" className={`role-toggle-btn ${activeRole === 'MANAGER' ? 'active' : ''}`} onClick={() => handleRoleSwitch('MANAGER')}>مدير</button>
                <button type="button" className={`role-toggle-btn ${activeRole === 'EMPLOYEE' ? 'active' : ''}`} onClick={() => handleRoleSwitch('EMPLOYEE')}>موظف</button>
              </div>
            ) : null}
            <button className="logout-btn" onClick={logout}>تسجيل الخروج</button>
          </div>
        </header>

        <main className="page-body">
          <div className="page-stack">{children}</div>
        </main>
      </div>
    </div>
  );
}
