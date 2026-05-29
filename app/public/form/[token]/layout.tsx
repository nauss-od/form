import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forms-tan-xi.vercel.app';

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const course = await prisma.course.findUnique({
    where: { publicToken: params.token },
    select: { activityName: true },
  });

  const title = 'منصة تأمين المتدربين | جامعة نايف العربية للعلوم الأمنية';
  const description = course
    ? `تعبئة نموذج التأمين الطبي لدورة "${course.activityName}" — جامعة نايف العربية للعلوم الأمنية`
    : 'نموذج تأمين المشاركين — جامعة نايف العربية للعلوم الأمنية';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_SA',
      siteName: 'منصة تأمين المتدربين',
      images: [{ url: `${baseUrl}/images/nauss-logo-gold.png`, width: 800, height: 240, alt: 'NAUSS' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/images/nauss-logo-gold.png`],
    },
    other: {
      'theme-color': '#016564',
    },
  };
}

export default async function PublicFormLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  const course = await prisma.course.findUnique({
    where: { publicToken: params.token },
    select: { id: true, endDate: true, activityName: true },
  });

  if (!course) notFound();

  if (course.endDate && new Date() > course.endDate) {
    return (
      <div className="public-page">
        <div className="public-card" style={{ maxWidth: 480, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <svg viewBox="0 0 60 60" fill="none" width="60" height="60" style={{ margin: '0 auto 16px', display: 'block' }}>
              <circle cx="30" cy="30" r="28" stroke="#dc2626" strokeWidth="2.5" fill="rgba(220,38,38,0.06)" />
              <path d="M20 20l20 20M40 20l-20 20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <h2 style={{ color: '#014948', marginBottom: 8, fontSize: '1.4rem', fontWeight: 900 }}>النموذج منتهي الصلاحية</h2>
            <p style={{ color: '#64748b', lineHeight: 2, margin: 0 }}>
              الدورة &laquo;{course.activityName || 'غير محددة'}&raquo; قد انتهت. لم يعد النموذج متاحًا لتعبئة البيانات.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
