import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

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
