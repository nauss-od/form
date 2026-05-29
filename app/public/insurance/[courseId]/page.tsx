'use client';

import { useState, useEffect, Fragment } from 'react';

type Participant = {
  id: string;
  fullNamePassport: string;
  passportNumber: string;
  passportExpiry: string;
  nationalId: string;
  mobile: string;
  birthDate: string;
  iban: string;
  files: { id: string; fileType: string }[];
};

type Course = {
  activityName: string;
  venue: string;
  startDate: string;
  endDate: string;
  createdByName: string;
};

export default function PublicInsurancePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
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

  const expandedIndex = expandedId ? participants.findIndex((p: any) => p.id === expandedId) : -1;
  const goToPrev = () => {
    if (expandedIndex > 0) setExpandedId(participants[expandedIndex - 1].id);
  };
  const goToNext = () => {
    if (expandedIndex < participants.length - 1) setExpandedId(participants[expandedIndex + 1].id);
  };

  const insuranceStart = course?.startDate ? new Date(new Date(course.startDate).getTime() - 86400000) : null;
  const insuranceEnd = course?.endDate ? new Date(new Date(course.endDate).getTime() + 86400000 * 3) : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #fafcfc 0%, #f2f6f6 100%)' }}>
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
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 64px', textAlign: 'center', color: '#667777' }}>
          الدورة غير موجودة
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #fafcfc 0%, #f2f6f6 100%)',
      padding: '32px 16px 64px',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #014948 0%, #016564 100%)',
          borderRadius: 20, padding: '32px 36px', marginBottom: 24, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 50%)',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <img src="/images/nauss-logo-gold.png" alt="NAUSS"
              style={{ width: 100, height: 'auto', opacity: 0.95, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {course.activityName || 'دورة تدريبية'}
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#d0b284' }}>
                {course.venue || ''}
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: 24, flexWrap: 'wrap',
            borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16,
          }}>
            {[
              ['بداية الدورة', course.startDate ? new Date(course.startDate).toLocaleDateString('ar-SA') : null],
              ['نهاية الدورة', course.endDate ? new Date(course.endDate).toLocaleDateString('ar-SA') : null],
              ['عدد المشاركين', String(participants.length)],
              insuranceStart ? ['بداية التأمين', insuranceStart.toLocaleDateString('ar-SA')] : null,
              insuranceEnd ? ['نهاية التأمين', insuranceEnd.toLocaleDateString('ar-SA')] : null,
            ].filter(Boolean).map((item: any) => (
              <div key={item[0]} style={{ fontSize: '0.78rem' }}>
                <div style={{ color: '#9abcbc', fontSize: '0.7rem', marginBottom: 2 }}>{item[0]}</div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{item[1]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PARTICIPANT TABLE ── */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e4ebeb',
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid #eaefef',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#014948' }}>قائمة المشاركين</span>
            <span style={{ fontSize: '0.75rem', color: '#94a8a8', fontWeight: 600, marginRight: 'auto' }}>
              {participants.length} مشارك{participants.length !== 1 ? 'ين' : ''}
            </span>
            {expandedId && (
              <span style={{ fontSize: '0.75rem', color: '#667777', fontWeight: 600 }}>
                {expandedIndex + 1} / {participants.length}
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafa' }}>
                  <th style={thStyle}>م</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>اسم المشارك</th>
                  <th style={thStyle}>رقم الجواز</th>
                  <th style={thStyle}>انتهاء الجواز</th>
                  <th style={thStyle}>رقم الهوية</th>
                  <th style={thStyle}>المرفقات</th>
                  <th style={{ ...thStyle, width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <Fragment key={p.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      style={{
                        ...(expandedId === p.id ? { background: '#f0f7f7' } : i % 2 === 1 ? { background: '#fafcfc' } : {}),
                        cursor: 'pointer', transition: 'background 0.12s',
                        borderBottom: expandedId === p.id ? 'none' : '1px solid #eef3f3',
                      }}
                      onMouseEnter={e => { if (expandedId !== p.id) e.currentTarget.style.background = '#f4f8f8'; }}
                      onMouseLeave={e => { if (expandedId !== p.id) e.currentTarget.style.background = i % 2 === 1 ? '#fafcfc' : '#fff'; }}
                    >
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#014948', textAlign: 'right' }}>{p.fullNamePassport}</td>
                      <td style={tdStyle} dir="ltr">{p.passportNumber}</td>
                      <td style={tdStyle}>{p.passportExpiry ? new Date(p.passportExpiry).toLocaleDateString('ar-SA') : '—'}</td>
                      <td style={tdStyle} dir="ltr">{p.nationalId}</td>
                      <td style={tdStyle}>
                        {p.files?.length > 0 ? (
                          <span style={{ fontSize: '0.65rem', background: '#e2f0ee', color: '#016564', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{p.files.length} ملف</span>
                        ) : '—'}
                      </td>
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
                          <ParticipantCard participant={p} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        {participants.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 16, padding: '0 4px',
          }}>
            <button onClick={goToPrev} disabled={expandedIndex <= 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 12, border: '1px solid #dce5e5',
                background: expandedIndex > 0 ? '#fff' : '#f6f8f8',
                color: expandedIndex > 0 ? '#014948' : '#bccaca',
                fontSize: '0.82rem', fontWeight: 600, cursor: expandedIndex > 0 ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (expandedIndex > 0) { e.currentTarget.style.background = '#f4f8f8'; e.currentTarget.style.borderColor = '#c4d6d6'; } }}
              onMouseLeave={e => { if (expandedIndex > 0) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#dce5e5'; } }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
              السابق
            </button>
            <span style={{ fontSize: '0.78rem', color: '#667777', fontWeight: 600 }}>
              {expandedIndex + 1} / {participants.length}
            </span>
            <button onClick={goToNext} disabled={expandedIndex >= participants.length - 1}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 12, border: '1px solid #dce5e5',
                background: expandedIndex < participants.length - 1 ? '#fff' : '#f6f8f8',
                color: expandedIndex < participants.length - 1 ? '#014948' : '#bccaca',
                fontSize: '0.82rem', fontWeight: 600, cursor: expandedIndex < participants.length - 1 ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (expandedIndex < participants.length - 1) { e.currentTarget.style.background = '#f4f8f8'; e.currentTarget.style.borderColor = '#c4d6d6'; } }}
              onMouseLeave={e => { if (expandedIndex < participants.length - 1) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#dce5e5'; } }}
            >
              التالي
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ textAlign: 'center', marginTop: 28, fontSize: '0.72rem', color: '#a0b4b4' }}>
          طُوِّر بواسطة نايف الشهراني — جامعة نايف العربية للعلوم الأمنية
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#536666',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #e4ebeb',
};

const tdStyle: React.CSSProperties = {
  padding: '11px 14px',
  color: '#2d4141',
  fontSize: '0.8rem',
  textAlign: 'center',
};

function ParticipantCard({ participant }: { participant: Participant }) {
  const passportFile = participant.files?.find(f => f.fileType === 'PASSPORT');
  const nationalIdFile = participant.files?.find(f => f.fileType === 'NATIONAL_ID');

  return (
    <div style={{ padding: '20px 24px 24px', background: '#f7fbfb' }}>
      {/* Participant name banner */}
      <div style={{
        background: 'linear-gradient(135deg, #016564 0%, #014948 100%)',
        borderRadius: 14, padding: '14px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#d0b284', fontWeight: 800, fontSize: '0.9rem',
        }}>
          {participant.fullNamePassport.charAt(0)}
        </div>
        <div style={{ color: '#fff' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{participant.fullNamePassport}</div>
          <div style={{ fontSize: '0.72rem', color: '#bcd5d5' }}>بيانات المشارك وتفاصيل التأمين</div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
      }}>
        {[
          { label: 'رقم الجوال', value: participant.mobile, ltr: true },
          { label: 'تاريخ الميلاد', value: participant.birthDate ? new Date(participant.birthDate).toLocaleDateString('ar-SA') : '—' },
          { label: 'رقم الجواز', value: participant.passportNumber, ltr: true },
          { label: 'انتهاء الجواز', value: participant.passportExpiry ? new Date(participant.passportExpiry).toLocaleDateString('ar-SA') : '—' },
          { label: 'رقم الهوية', value: participant.nationalId, ltr: true },
          { label: 'رقم الآيبان', value: participant.iban, ltr: true },
        ].map(field => (
          <div key={field.label} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e8efef',
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: '0.68rem', color: '#667777', fontWeight: 600, marginBottom: 4 }}>
              {field.label}
            </div>
            <div style={{
              fontSize: '0.85rem', color: '#014948', fontWeight: 700,
              direction: field.ltr ? 'ltr' : undefined, textAlign: field.ltr ? 'left' : 'right',
            }}>
              {field.value || '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Images */}
      {passportFile || nationalIdFile ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {passportFile && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8efef', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: '#eef6f6', fontSize: '0.73rem', fontWeight: 700, color: '#014948', borderBottom: '1px solid #e8efef', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                صورة جواز السفر
              </div>
              <div style={{ padding: 12, display: 'flex', justifyContent: 'center', background: '#fafcfc' }}>
                <img src={`/api/files/${passportFile.id}`} alt=""
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 10, objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
              </div>
            </div>
          )}
          {nationalIdFile && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8efef', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: '#f8f5ee', fontSize: '0.73rem', fontWeight: 700, color: '#8a7440', borderBottom: '1px solid #e8efef', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a7440" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                صورة الهوية الوطنية
              </div>
              <div style={{ padding: 12, display: 'flex', justifyContent: 'center', background: '#fafcfc' }}>
                <img src={`/api/files/${nationalIdFile.id}`} alt=""
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 10, objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 28, color: '#94a8a8', background: '#fff', borderRadius: 14, border: '1px solid #e8efef', fontSize: '0.82rem' }}>
          لا توجد ملفات مرفوعة لهذا المشارك
        </div>
      )}
    </div>
  );
}
