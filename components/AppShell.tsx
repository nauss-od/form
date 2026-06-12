'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type Role = 'MANAGER' | 'EMPLOYEE' | string;

type AppShellProps = {
  title: string;
  children: ReactNode;
  role?: Role;
  forceManager?: boolean;
};

function Icon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    employees: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    courses: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    audit: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6M9 18h6M9 10h6"/></svg>,
    chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
    plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
    participants: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
    logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>,
  };
  return icons[name] || null;
}

interface NavItem { href: string; label: string; icon: string; }

const managerNav: NavItem[] = [
  { href: '/', label: 'لوحة المعلومات', icon: 'dashboard' },
  { href: '/employees', label: 'الموظفين', icon: 'employees' },
  { href: '/courses', label: 'الدورات', icon: 'courses' },
  { href: '/participants', label: 'قائمة المشاركين', icon: 'participants' },
  { href: '/admin/users', label: 'إدارة الحسابات', icon: 'settings' },
  { href: '/admin/audit', label: 'سجل التدقيق', icon: 'audit' },
  { href: '/admin/reports', label: 'التقارير', icon: 'chart' },
];

const employeeNav: NavItem[] = [
  { href: '/', label: 'لوحة المستخدم', icon: 'dashboard' },
  { href: '/new-course', label: 'إنشاء دورة جديدة', icon: 'plus' },
  { href: '/courses', label: 'الدورات', icon: 'courses' },
  { href: '/participants', label: 'قائمة المشاركين', icon: 'participants' },
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function UserMenu({ forceManager, isManagerAccount, activeRole, onRoleSwitch, onLogout }:
  { forceManager: boolean; isManagerAccount: boolean; activeRole: 'MANAGER' | 'EMPLOYEE'; onRoleSwitch: (r: 'MANAGER' | 'EMPLOYEE') => void; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/account').then(r => r.json()).then(d => {
      if (d.user) { setUserName(d.user.name); setUserEmail(d.user.email); }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const av = userName ? initials(userName) : '..';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 8px',
          borderRadius: 99, border: '1.5px solid var(--nauss-line)', background: '#fff',
          cursor: 'pointer', color: 'var(--nauss-ink)', maxWidth: 'min(200px, 40vw)',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #016564, #014948)',
          display: 'grid', placeItems: 'center',
          color: '#fff', fontSize: '0.72rem', fontWeight: 900, flexShrink: 0,
        }}>{av}</div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || '...'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div style={{
          position: 'fixed', top: 'auto', right: 12, left: 12,
          minWidth: 220, maxWidth: 340, marginLeft: 'auto',
          background: '#ffffff',
          border: '1.5px solid var(--nauss-line)', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 9999, overflow: 'hidden',
        }}>
          {/* User info header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--nauss-line)', display: 'flex', alignItems: 'center', gap: 10, background: '#fff' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #016564, #014948)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontSize: '0.82rem', fontWeight: 900, flexShrink: 0,
            }}>{av}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--nauss-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--nauss-muted)', direction: 'ltr', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
            </div>
          </div>

          {/* Role toggle for managers */}
          {!forceManager && isManagerAccount && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--nauss-line)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--nauss-muted)', fontWeight: 700, marginBottom: 6 }}>عرض القائمة بصفة</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => { onRoleSwitch('MANAGER'); setOpen(false); }}
                  style={{ flex: 1, padding: '5px 0', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', background: activeRole === 'MANAGER' ? 'var(--nauss-green-dark)' : 'transparent', color: activeRole === 'MANAGER' ? '#fff' : 'var(--nauss-muted)', borderColor: activeRole === 'MANAGER' ? 'var(--nauss-green-dark)' : 'var(--nauss-line)' }}
                >مدير</button>
                <button
                  onClick={() => { onRoleSwitch('EMPLOYEE'); setOpen(false); }}
                  style={{ flex: 1, padding: '5px 0', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', background: activeRole === 'EMPLOYEE' ? 'var(--nauss-green-dark)' : 'transparent', color: activeRole === 'EMPLOYEE' ? '#fff' : 'var(--nauss-muted)', borderColor: activeRole === 'EMPLOYEE' ? 'var(--nauss-green-dark)' : 'var(--nauss-line)' }}
                >موظف</button>
              </div>
            </div>
          )}

          {/* Profile link */}
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--nauss-ink)', textDecoration: 'none', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f4f8f8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <span style={{ opacity: 0.6 }}><Icon name="user" /></span>
            الملف الشخصي
          </Link>

          {/* Logout */}
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger)', background: '#fff', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--nauss-line)', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(191,61,48,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <Icon name="logout" />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ title, role = 'EMPLOYEE', forceManager = false, children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isManagerAccount = useMemo(() => forceManager || String(role).toUpperCase() === 'MANAGER', [forceManager, role]);
  const [activeRole, setActiveRole] = useState<'MANAGER' | 'EMPLOYEE'>(isManagerAccount ? 'MANAGER' : 'EMPLOYEE');

  useEffect(() => {
    if (!isManagerAccount) { setActiveRole('EMPLOYEE'); return; }
    if (forceManager) { setActiveRole('MANAGER'); return; }
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('nauss-active-role') : null;
    if (saved === 'EMPLOYEE' || saved === 'MANAGER') setActiveRole(saved);
  }, [isManagerAccount, forceManager]);

  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch('/api/analytics/pageview', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname }),
    }).catch(() => {});
  }, [pathname]);

  function handleRoleSwitch(nextRole: 'MANAGER' | 'EMPLOYEE') {
    setActiveRole(nextRole);
    if (typeof window !== 'undefined') window.localStorage.setItem('nauss-active-role', nextRole);
    window.dispatchEvent(new Event('nauss-role-change'));
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
          <img src="/images/nauss-logo-gold.png" alt="جامعة نايف العربية للعلوم الأمنية" className="sidebar-logo" />
        </div>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <span className="sidebar-icon"><Icon name={item.icon} /></span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="sidebar-credit">طُوّر بواسطة نايف الشهراني</div>
        </div>
      </aside>

      {open ? <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="إغلاق" /> : null}

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-side">
            <button className="menu-btn" onClick={() => setOpen(true)} aria-label="فتح القائمة"><Icon name="menu" /></button>
            <h1 className="page-title">{title}</h1>
          </div>
          <div className="topbar-side">
            <UserMenu
              forceManager={forceManager}
              isManagerAccount={isManagerAccount}
              activeRole={activeRole}
              onRoleSwitch={handleRoleSwitch}
              onLogout={logout}
            />
          </div>
        </header>
        <main className="page-body">
          <div className="page-stack">{children}</div>
        </main>
      </div>
    </div>
  );
}
