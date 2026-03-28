import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'منصة إدارة طلبات التأمين الطبي',
  description: 'جامعة نايف العربية للعلوم الأمنية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
