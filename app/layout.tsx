import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'منصة تأمين المشاركين للدورات الخارجية',
  description: 'منصة جامعة نايف العربية للعلوم الأمنية لإدارة روابط ونماذج المشاركين في الدورات الخارجية.',
  openGraph: {
    title: 'منصة تأمين المشاركين',
    description: 'جامعة نايف العربية للعلوم الأمنية — منصة إدارة نماذج تأمين المشاركين للدورات الخارجية',
    siteName: 'منصة تأمين المشاركين',
    type: 'website',
    locale: 'ar_SA',
    images: [{ url: '/images/nauss-logo-gold.png', width: 512, height: 160, alt: 'NAUSS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة تأمين المشاركين',
    description: 'جامعة نايف العربية للعلوم الأمنية — منصة إدارة نماذج تأمين المشاركين للدورات الخارجية',
    images: ['/images/nauss-logo-gold.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#016564',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.variable}>{children}</body>
    </html>
  );
}
