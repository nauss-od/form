import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'منصة تأمين المشاركين للدورات الخارجية',
  description: 'منصة جامعة نايف العربية للعلوم الأمنية لإدارة روابط ونماذج المشاركين في الدورات الخارجية.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
