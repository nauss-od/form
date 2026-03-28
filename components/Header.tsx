'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const links = [
    { href: '/dashboard', label: 'لوحة التحكم' },
    { href: '/users', label: 'المستخدمون' },
    { href: '/forms', label: 'النماذج' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <div>
          <div style={{ fontWeight: 800, color: 'var(--primary)' }}>منصة إدارة طلبات التأمين الطبي</div>
          <div className="small">جامعة نايف العربية للعلوم الأمنية</div>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button className="btn btn-secondary" onClick={logout}>تسجيل الخروج</button>
      </div>
    </header>
  );
}
