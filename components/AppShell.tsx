'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';

type Role = 'MANAGER' | 'EMPLOYEE' | string;

type AppShellProps = {
  title: string;
  subtitle?: string;
  description?: string;
  role?: Role;
  children: ReactNode;
};

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" fill="currentColor" />
  </svg>
);

const CoursesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-13ZM8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const NewCourseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 6a6 6 0 1 1 12 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M16 17l5-5-5-5M21 12H9M12 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: <DashboardIcon /> },
  { href: '/courses', label: 'الدورات', icon: <CoursesIcon /> },
  { href: '/new-course', label: 'إصدار نموذج جديد', icon: <NewCourseIcon /> },
  { href: '/users', label: 'إدارة المستخدمين', icon: <UsersIcon />, managerOnly: true },
];

export default function AppShell({ title, subtitle, description, role = 'EMPLOYEE', children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isManagerAccount = useMemo(() => String(role).toUpperCase() === 'MANAGER', [role]);
  const [activeRole, setActiveRole] = useState<'MANAGER' | 'EMPLOYEE'>(isManagerAccount ? 'MANAGER' : 'EMPLOYEE');
  const text = subtitle || description || '';

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
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  const canSeeManagerLinks = isManagerAccount && activeRole === 'MANAGER';

  return (
    <div className="shell-root">
      <aside className={`shell-sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand-wrap">
          <div className="brand-mark">
            <img src="/images/nauss-mark.svg" alt="جامعة نايف" />
          </div>
          <div className="brand-copy">
            <strong>منصة تأمين المشاركين</strong>
            <span>واجهة تشغيل وهوية مؤسسية راقية</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {navItems
            .filter((item) => !item.managerOnly || canSeeManagerLinks)
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
            <small>حالة الوصول الحالية</small>
            <strong>
              {canSeeManagerLinks
                ? 'عرض إداري كامل مع صلاحيات المتابعة والإدارة.'
                : 'عرض تشغيلي مخصص للأعمال اليومية وإصدار النماذج.'}
            </strong>
            <div className="role-chip">{canSeeManagerLinks ? 'مدير' : 'موظف'}</div>
          </div>
        </div>
      </aside>

      {open ? <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="إغلاق القائمة" /> : null}

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-side">
            <button className="menu-btn" onClick={() => setOpen(true)} aria-label="فتح القائمة">
              <MenuIcon />
            </button>

            <div className="topbar-stack">
              <h1 className="page-title">{title}</h1>
              {text ? <p className="page-subtitle">{text}</p> : null}
            </div>
          </div>

          <div className="topbar-side">
            {isManagerAccount ? (
              <div className="role-toggle" aria-label="تبديل الدور">
                <button
                  type="button"
                  className={`role-toggle-btn ${activeRole === 'MANAGER' ? 'active' : ''}`}
                  onClick={() => handleRoleSwitch('MANAGER')}
                  title="عرض المدير"
                >
                  مدير
                </button>
                <button
                  type="button"
                  className={`role-toggle-btn ${activeRole === 'EMPLOYEE' ? 'active' : ''}`}
                  onClick={() => handleRoleSwitch('EMPLOYEE')}
                  title="عرض الموظف"
                >
                  موظف
                </button>
              </div>
            ) : (
              <div className="topbar-chip">عرض تشغيلي</div>
            )}

            <button className="logout-btn" onClick={logout} title="تسجيل الخروج" aria-label="تسجيل الخروج">
              <LogoutIcon />
              <span className="label-text">تسجيل الخروج</span>
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
