import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'منصة تأمين المشاركين للدورات الخارجية',
  description: 'منصة تشغيلية لإدارة روابط تأمين المشاركين للدورات الخارجية'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
