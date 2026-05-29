'use client';

import { useState, useEffect, Fragment } from 'react';

export default function PublicInsurancePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/insurance/${params.courseId}`)
      .then(r => r.json())
      .then(data => {
        setCourse(data.course);
        setParticipants(data.participants);
        if (data.participants?.length > 0) {
          setExpandedId(data.participants[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.courseId]);

  const goToPrev = () => {
    if (!expandedId || participants.length === 0) return;
    const idx = participants.findIndex((p: any) => p.id === expandedId);
    if (idx > 0) setExpandedId(participants[idx - 1].id);
  };
  const goToNext = () => {
    if (!expandedId || participants.length === 0) return;
    const idx = participants.findIndex((p: any) => p.id === expandedId);
    if (idx < participants.length - 1) setExpandedId(participants[idx + 1].id);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f2f6f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p style={{ color: '#667777', marginTop: 12 }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f2f6f6' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '40px', textAlign: 'center', color: '#667777' }}>
          الدورة غير موجودة
        </div>
      </div>
    );
  }

  const insuranceStart = course.startDate ? new Date(new Date(course.startDate).getTime() - 86400000) : null;
  const insuranceEnd = course.endDate ? new Date(new Date(course.endDate).getTime() + 86400000 * 3) : null;

  return (
    <div style={{
      minHeight: '100vh', background: '#f2f6f6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px 16px 48px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #016564 0%, #014948 100%)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 20, color: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <img src="/images/nauss-logo-gold.png" alt="" style={{ width: 48, height: 'auto', opacity: 0.9 }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {course.activityName || 'دورة تدريبية'}
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#d0b284', opacity: 0.85 }}>
                {course.venue || ''}
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.78rem', color: '#bcd0d0',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12,
          }}>
            {course.startDate && <span>بداية الدورة: {new Date(course.startDate).toLocaleDateString('ar-SA')}</span>}
            {course.endDate && <span>نهاية الدورة: {new Date(course.endDate).toLocaleDateString('ar-SA')}</span>}
            <span>عدد المشاركين: {participants.length}</span>
            {insuranceStart && <span>بداية التأمين: {insuranceStart.toLocaleDateString('ar-SA')}</span>}
            {insuranceEnd && <span>نهاية التأمين: {insuranceEnd.toLocaleDateString('ar-SA')}</span>}
          </div>
        </div>

        {/* Participant Table */}
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #dce5e5',
          overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #dce5e5',
            fontSize: '0.85rem', fontWeight: 700, color: '#014948',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            قائمة المشاركين
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f6fafa' }}>
                  <th style={thStyle}>م</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>اسم المشارك</th>
                  <th style={thStyle}>رقم الجواز</th>
                  <th style={thStyle}>انتهاء الجواز</th>
                  <th style={thStyle}>رقم الهوية</th>
                  <th style={thStyle}>المرفقات</th>
                  <th style={{ ...thStyle, width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p: any, i: number) => (
                  <Fragment key={p.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      style={{
                        ...(expandedId === p.id ? { background: '#eef6f6' } : i % 2 === 1 ? { background: '#fafcfc' } : {}),
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                        borderBottom: expandedId === p.id ? 'none' : '1px solid #eef3f3',
                      }}
                      onMouseEnter={e => { if (expandedId !== p.id) e.currentTarget.style.background = '#f4f8f8'; }}
                      onMouseLeave={e => { if (expandedId !== p.id) e.currentTarget.style.background = i % 2 === 1 ? '#fafcfc' : '#ffffff'; }}
                    >
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#014948', textAlign: 'right' }}>{p.fullNamePassport}</td>
                      <td style={tdStyle} dir="ltr">{p.passportNumber}</td>
                      <td style={tdStyle}>{p.passportExpiry ? new Date(p.passportExpiry).toLocaleDateString('ar-SA') : '—'}</td>
                      <td style={tdStyle} dir="ltr">{p.nationalId}</td>
                      <td style={tdStyle}>{p.files?.some((f: any) => f.fileType === 'PASSPORT') || p.files?.some((f: any) => f.fileType === 'NATIONAL_ID') ? '📎' : '—'}</td>
                      <td style={tdStyle}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667777" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round"
                          style={{ transition: 'transform 0.2s', transform: expandedId === p.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </td>
                    </tr>
                    {expandedId === p.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid #eef3f3' }}>
                          <ExpandedPreview participant={p} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 14, padding: '0 4px',
        }}>
          <button
            onClick={goToPrev}
            disabled={!expandedId || participants.findIndex((p: any) => p.id === expandedId) <= 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 10, border: '1px solid #dce5e5',
              background: '#ffffff', color: '#014948', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', opacity: !expandedId || participants.findIndex((p: any) => p.id === expandedId) <= 0 ? 0.4 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            السابق
          </button>
          <span style={{ fontSize: '0.78rem', color: '#667777' }}>
            {expandedId ? `${participants.findIndex((p: any) => p.id === expandedId) + 1} / ${participants.length}` : '—'}
          </span>
          <button
            onClick={goToNext}
            disabled={!expandedId || participants.findIndex((p: any) => p.id === expandedId) >= participants.length - 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 10, border: '1px solid #dce5e5',
              background: '#ffffff', color: '#014948', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', opacity: !expandedId || participants.findIndex((p: any) => p.id === expandedId) >= participants.length - 1 ? 0.4 : 1,
            }}
          >
            التالي
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.72rem', color: '#94a3b8' }}>
          طُوِّر بواسطة نايف الشهراني — جامعة نايف العربية للعلوم الأمنية
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#455a5a',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #dce5e5',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  color: '#2d4141',
  fontSize: '0.78rem',
  textAlign: 'center',
};

function ExpandedPreview({ participant }: { participant: any }) {
  const passportFile = participant.files?.find((f: any) => f.fileType === 'PASSPORT');
  const nationalIdFile = participant.files?.find((f: any) => f.fileType === 'NATIONAL_ID');

  return (
    <div style={{ padding: '16px 20px 20px', background: '#f8fbfb' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
        {passportFile && (
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dce5e5', overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', background: '#eef6f6', fontSize: '0.72rem', fontWeight: 700, color: '#014948', borderBottom: '1px solid #dce5e5' }}>
              صورة جواز السفر
            </div>
            <div style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
              <img src={`/api/files/${passportFile.id}`} alt=""
                style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 8, objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
        {nationalIdFile && (
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dce5e5', overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', background: '#f8f5ee', fontSize: '0.72rem', fontWeight: 700, color: '#8a7440', borderBottom: '1px solid #dce5e5' }}>
              صورة الهوية الوطنية
            </div>
            <div style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
              <img src={`/api/files/${nationalIdFile.id}`} alt=""
                style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 8, objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
        {!passportFile && !nationalIdFile && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: '0.82rem' }}>
            لا توجد ملفات مرفوعة لهذا المشارك
          </div>
        )}
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 12, border: '1px solid #dce5e5',
        padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px',
      }}>
        {[
          { label: 'رقم الجوال', value: participant.mobile, ltr: true },
          { label: 'تاريخ الميلاد', value: participant.birthDate ? new Date(participant.birthDate).toLocaleDateString('ar-SA') : '—' },
          { label: 'رقم الهوية', value: participant.nationalId, ltr: true },
          { label: 'رقم الآيبان', value: participant.iban, ltr: true },
        ].map((f: any) => (
          <div key={f.label} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.7rem', color: '#667777', fontWeight: 600, whiteSpace: 'nowrap' }}>{f.label}:</span>
            <span style={{ fontSize: '0.8rem', color: '#014948', direction: f.ltr ? 'ltr' : undefined, textAlign: f.ltr ? 'left' : undefined }}>
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
