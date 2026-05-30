import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function ParticipantPage({ params }: { params: { id: string } }) {
  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: {
      course: { select: { id: true, activityName: true, venue: true, startDate: true, endDate: true, publicToken: true } },
      files: { select: { id: true, fileType: true, fileUrl: true, mimeType: true } },
    },
  });

  if (!submission) notFound();

  const isExpired = submission.course.endDate && new Date() > submission.course.endDate;

  return (
    <div className="public-page">
      <div className="public-card" style={{ maxWidth: 680, padding: 0, overflow: 'hidden' }}>
        {isExpired ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <svg viewBox="0 0 60 60" fill="none" width="60" height="60" style={{ margin: '0 auto 16px', display: 'block' }}>
              <circle cx="30" cy="30" r="28" stroke="#dc2626" strokeWidth="2.5" fill="rgba(220,38,38,0.06)" />
              <path d="M20 20l20 20M40 20l-20 20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <h2 style={{ color: '#014948', marginBottom: 8, fontSize: '1.4rem', fontWeight: 900 }}>الرابط منتهي الصلاحية</h2>
            <p style={{ color: '#64748b', lineHeight: 2, margin: 0 }}>
              هذه الدورة قد انتهت ولم يعد الرابط متاحًا.
            </p>
          </div>
        ) : (
          <>
            <div className="form-header" style={{ textAlign: 'center' }}>
              <img src="/images/nauss-logo-gold.png" alt="NAUSS" className="form-logo" style={{ marginLeft: 'auto', marginRight: 'auto' }} />
              <h2>معلومات المشارك</h2>
              <p style={{ marginLeft: 'auto', marginRight: 'auto' }}>{submission.course.activityName || 'دورة خارجية'} — {submission.course.venue || ''}</p>
            </div>

            <div style={{ padding: '30px 34px 34px', display: 'grid', gap: 24 }}>
              <div className="form-section">
                <div className="section-step">
                  <span className="step-num">1</span>
                  <h3>البيانات الشخصية</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'الاسم الكامل', value: submission.fullNamePassport },
                    { label: 'رقم الجواز', value: submission.passportNumber },
                    { label: 'انتهاء الجواز', value: submission.passportExpiry.toLocaleDateString('en-GB') },
                    { label: 'رقم الهوية', value: submission.nationalId },
                    { label: 'الجوال', value: submission.mobile },
                    { label: 'تاريخ الميلاد', value: submission.birthDate.toLocaleDateString('en-GB') },
                    { label: 'IBAN', value: submission.iban, dir: 'ltr' as const },
                  ].map(f => (
                    <div key={f.label} className="field">
                      <label>{f.label}</label>
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 14,
                          padding: '10px 14px',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          direction: f.dir || 'ltr',
                          textAlign: f.dir === 'ltr' ? 'left' : 'right',
                          wordBreak: 'break-all',
                        }}
                      >
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-divider" />

              <div className="form-section">
                <div className="section-step">
                  <span className="step-num">2</span>
                  <h3>المرفقات</h3>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                  {[
                    { label: 'صورة جواز السفر', file: submission.files.find(f => f.fileType === 'PASSPORT') },
                    { label: 'صورة الهوية الوطنية', file: submission.files.find(f => f.fileType === 'NATIONAL_ID') },
                  ].map(item => (
                    <div key={item.label} className="field">
                      <label>{item.label}</label>
                      {item.file ? (
                        <img
                          src={`/api/files/${item.file.id}`}
                          alt={item.label}
                          style={{
                            width: '100%',
                            maxHeight: 400,
                            objectFit: 'contain',
                            borderRadius: 16,
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding: '24px 16px',
                            textAlign: 'center',
                            color: '#94a3b8',
                            border: '1.5px dashed #e2e8f0',
                            borderRadius: 16,
                            fontSize: '0.9rem',
                          }}
                        >
                          لا توجد صورة مرفوعة
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
