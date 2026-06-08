'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import RotateImageBtn from '@/components/RotateImageBtn';

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

function IconPassport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <defs>
        <linearGradient id="ip1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
      </defs>
      <rect x="3" y="4" width="18" height="16" rx="3" fill="url(#ip1)" opacity="0.12"/>
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="#016564" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3.5" stroke="#016564" strokeWidth="1.4"/>
      <path d="M7 20c2-3 10-3 10 0" stroke="#016564" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconCalendar3D() {
  return (
    <svg viewBox="0 0 26 26" fill="none" width="20" height="20">
      <defs>
        <linearGradient id="cal3d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
      </defs>
      {/* Shadow layer */}
      <rect x="2" y="3" width="20" height="20" rx="4" fill="#014948" opacity="0.08" transform="translate(1,1)"/>
      {/* Main body */}
      <rect x="2" y="2" width="20" height="20" rx="4" fill="url(#cal3d)" opacity="0.1"/>
      <rect x="2" y="2" width="20" height="20" rx="4" stroke="#016564" strokeWidth="1.5"/>
      <path d="M2 9h20" stroke="#016564" strokeWidth="1.5"/>
      <path d="M7 6V2M17 6V2" stroke="#016564" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8.5" cy="13" r="1.5" fill="#016564"/>
      <circle cx="13" cy="13" r="1.5" fill="#016564"/>
      <circle cx="17.5" cy="13" r="1.5" fill="#016564"/>
    </svg>
  );
}

function IconUsers3D() {
  return (
    <svg viewBox="0 0 26 26" fill="none" width="20" height="20">
      <defs>
        <linearGradient id="usr3d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
      </defs>
      <ellipse cx="13" cy="14" rx="10" ry="10" fill="url(#usr3d)" opacity="0.06" transform="translate(0,1)"/>
      <circle cx="13" cy="9" r="4" stroke="#016564" strokeWidth="1.5"/>
      <path d="M5 21c2-5 16-5 16 0" stroke="#016564" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconShield3D() {
  return (
    <svg viewBox="0 0 26 26" fill="none" width="20" height="20">
      <defs>
        <linearGradient id="shd3d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
      </defs>
      {/* Shadow */}
      <path d="M12 2L4 6v5c0 6 3.5 11 8 12 4.5-1 8-6 8-12V6l-8-4z" fill="#014948" opacity="0.06" transform="translate(1,1)"/>
      {/* Main */}
      <path d="M12 2L4 6v5c0 6 3.5 11 8 12 4.5-1 8-6 8-12V6l-8-4z" fill="url(#shd3d)" opacity="0.1"/>
      <path d="M12 2L4 6v5c0 6 3.5 11 8 12 4.5-1 8-6 8-12V6l-8-4z" stroke="#016564" strokeWidth="1.5"/>
      <path d="M10 13l2 2 4-4" stroke="#016564" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconLocation3D() {
  return (
    <svg viewBox="0 0 26 26" fill="none" width="20" height="20">
      <defs>
        <linearGradient id="loc3d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#016564"/><stop offset="100%" stopColor="#014948"/></linearGradient>
      </defs>
      <ellipse cx="13" cy="22" rx="7" ry="2" fill="#014948" opacity="0.08"/>
      <path d="M13 2a8 8 0 00-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 00-8-8z" fill="url(#loc3d)" opacity="0.1"/>
      <path d="M13 2a8 8 0 00-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 00-8-8z" stroke="#016564" strokeWidth="1.5"/>
      <circle cx="13" cy="10" r="3" fill="#016564" opacity="0.9"/>
    </svg>
  );
}

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

  useEffect(() => {
    if (!participants.length) return;
    const ids = participants.flatMap((p: any) => (p.files || []).map((f: any) => f.id));
    if (!ids.length) return;
    let i = 0;
    const next = () => {
      if (i >= ids.length) return;
      const img = new Image();
      img.src = `/api/files/${ids[i]}`;
      i++;
      setTimeout(next, 100);
    };
    next();
  }, [participants]);

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
        <div style={{ textAlign: 'center' }}><div className="loading-spinner" /><p style={{ color: '#667777', marginTop: 12 }}>جاري التحميل...</p></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f2f6f6' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 64px', textAlign: 'center', color: '#667777' }}>الدورة غير موجودة</div>
      </div>
    );
  }

  const infoCards = [
    { icon: <IconCalendar3D />, label: 'بداية الدورة', value: course.startDate ? new Date(course.startDate).toLocaleDateString('en-GB') : '—' },
    { icon: <IconCalendar3D />, label: 'نهاية الدورة', value: course.endDate ? new Date(course.endDate).toLocaleDateString('en-GB') : '—' },
    { icon: <IconUsers3D />, label: 'المشاركون', value: String(participants.length) },
    { icon: <IconShield3D />, label: 'بداية التأمين', value: insuranceStart ? insuranceStart.toLocaleDateString('en-GB') : '—' },
    { icon: <IconShield3D />, label: 'نهاية التأمين', value: insuranceEnd ? insuranceEnd.toLocaleDateString('en-GB') : '—' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbfb 0%, #eef4f4 50%, #f2f6f6 100%)',
      padding: '24px 16px 48px',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* ══════════ HEADER ══════════ */}
        <div style={{
          background: 'linear-gradient(145deg, #014a49 0%, #016564 40%, #017877 100%)',
          borderRadius: 24, padding: '28px 32px 20px', marginBottom: 20, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative shapes */}
          <div style={{ position: 'absolute', top: '-40px', left: '-20px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(208,178,132,0.06)', border: '1px solid rgba(208,178,132,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '-30px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '30%', width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'absolute', top: '20%', right: '15%', width: 40, height: 40, borderRadius: 8, background: 'rgba(208,178,132,0.05)', transform: 'rotate(45deg)' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28, marginBottom: 18 }}>
            <img src="/images/nauss-logo-gold.png" alt="NAUSS"
              style={{ width: 150, height: 'auto', filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.15))' }}
            />
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.12)', paddingRight: 20 }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {course.activityName || 'دورة تدريبية'}
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#bfd8d8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconLocation3D /> {course.venue || ''}
              </p>
            </div>
          </div>

          {/* Info cards row */}
          <div style={{
            position: 'relative', display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          }}>
            {infoCards.map(card => (
              <div key={card.label} style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(4px)',
                borderRadius: 14, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ opacity: 0.8, flexShrink: 0 }}>{card.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.62rem', color: '#a9cbcb', fontWeight: 600, marginBottom: 1 }}>{card.label}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════ TABLE ══════════ */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e2ebeb',
          overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid #e8efef',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <IconPassport />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#014948' }}>قائمة المشاركين</span>
            <span style={{ fontSize: '0.73rem', color: '#94a8a8', fontWeight: 600, marginRight: 'auto' }}>{participants.length} مشارك{participants.length !== 1 ? 'ين' : ''}</span>
            {expandedId && (
              <span style={{ fontSize: '0.73rem', color: '#667777', fontWeight: 600 }}>{expandedIndex + 1} / {participants.length}</span>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f6fafa' }}>
                  <th style={thS}>م</th>
                  <th style={{ ...thS, textAlign: 'right' }}>اسم المشارك</th>
                  <th style={thS}>رقم الجواز</th>
                  <th style={thS}>انتهاء الجواز</th>
                  <th style={thS}>رقم الهوية</th>
                  <th style={thS}>المرفقات</th>
                  <th style={{ ...thS, width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <Fragment key={p.id}>
                    <tr
                      style={{
                        ...(expandedId === p.id ? { background: '#f0f7f7' } : i % 2 === 1 ? { background: '#fafcfc' } : {}),
                        transition: 'background 0.12s',
                        borderBottom: expandedId === p.id ? 'none' : '1px solid #e8efef',
                      }}
                      onMouseEnter={e => { if (expandedId !== p.id) e.currentTarget.style.background = '#f2f8f8'; }}
                      onMouseLeave={e => { if (expandedId !== p.id) e.currentTarget.style.background = i % 2 === 1 ? '#fafcfc' : '#fff'; }}
                    >
                      <td style={tdS}>{i + 1}</td>
                      <td style={{ ...tdS, fontWeight: 600, color: '#014948', textAlign: 'right' }}>{p.fullNamePassport}</td>
                      <td style={{ ...tdS, userSelect: 'text' }} dir="ltr">{p.passportNumber}</td>
                      <td style={{ ...tdS, userSelect: 'text' }}>{p.passportExpiry ? new Date(p.passportExpiry).toLocaleDateString('en-GB') : '—'}</td>
                      <td style={{ ...tdS, userSelect: 'text' }} dir="ltr">{p.nationalId}</td>
                      <td style={tdS}>
                        {p.files?.length > 0 ? (
                          <span style={{ fontSize: '0.63rem', background: '#e2f0ee', color: '#016564', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{p.files.length} ملف</span>
                        ) : <span style={{ color: '#aac0c0' }}>—</span>}
                      </td>
                      <td style={tdS}>
                        <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667777" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ transition: 'transform 0.25s', transform: expandedId === p.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {/* ── Expanded row: all fields + images ── */}
                    {expandedId === p.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid #e8efef' }}>
                          <div key={p.id} style={{ animation: 'slideUp 0.2s ease' }}>
                            <ExpandedContent participant={p} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══════════ NAVIGATION ══════════ */}
        {participants.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <button onClick={goToPrev} disabled={expandedIndex <= 0} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 12,
              border: '1px solid', borderColor: expandedIndex > 0 ? '#d4e0e0' : '#e4ebeb',
              background: expandedIndex > 0 ? '#fff' : '#f6f8f8',
              color: expandedIndex > 0 ? '#014948' : '#c2d0d0',
              fontSize: '0.8rem', fontWeight: 600, cursor: expandedIndex > 0 ? 'pointer' : 'default',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}><polyline points="9 18 15 12 9 6" /></svg>
              السابق
            </button>
            <span style={{ fontSize: '0.78rem', color: '#667777', fontWeight: 600 }}>{expandedIndex + 1} / {participants.length}</span>
            <button onClick={goToNext} disabled={expandedIndex >= participants.length - 1} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 12,
              border: '1px solid', borderColor: expandedIndex < participants.length - 1 ? '#d4e0e0' : '#e4ebeb',
              background: expandedIndex < participants.length - 1 ? '#fff' : '#f6f8f8',
              color: expandedIndex < participants.length - 1 ? '#014948' : '#c2d0d0',
              fontSize: '0.8rem', fontWeight: 600, cursor: expandedIndex < participants.length - 1 ? 'pointer' : 'default',
            }}>
              التالي
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.7rem', color: '#a8bdbd' }}>
          طُوِّر بواسطة نايف الشهراني — جامعة نايف العربية للعلوم الأمنية
        </div>
      </div>
    </div>
  );
}

const thS: React.CSSProperties = {
  padding: '11px 13px', fontSize: '0.7rem', fontWeight: 700,
  color: '#5a7070', textAlign: 'center', whiteSpace: 'nowrap',
  borderBottom: '1px solid #e4ebeb',
};
const tdS: React.CSSProperties = {
  padding: '10px 13px', color: '#2d4141', fontSize: '0.78rem', textAlign: 'center',
  userSelect: 'text', WebkitUserSelect: 'text',
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!copied) return; const t = setTimeout(() => setCopied(false), 1200); return () => clearTimeout(t); }, [copied]);
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text).then(() => setCopied(true)); }}
      style={{ background: copied ? '#dff0ee' : 'transparent', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3, color: copied ? '#0a7d5c' : '#c2d0d0', fontSize: '0.62rem', fontWeight: 700, transition: 'all 0.15s' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {copied
          ? <polyline points="20 6 9 17 4 12" />
          : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>
        }
      </svg>
      {copied ? 'تم' : ''}
    </button>
  );
}

function ImgWithLoader({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  function retry() {
    setLoaded(false);
    setFailed(false);
  }

  if (failed) {
    return (
      <div style={{ textAlign: 'center', padding: 16, color: '#94a8a8' }}>
        <div style={{ fontSize: '0.72rem', marginBottom: 8 }}>تعذّر التحميل</div>
        <button type="button" onClick={retry} style={{
          background: '#e2f0ee', border: 'none', borderRadius: 8, padding: '4px 14px',
          cursor: 'pointer', color: '#016564', fontSize: '0.68rem', fontWeight: 700,
        }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 100 }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#eef3f3', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8cccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{
          maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'contain',
          opacity: loaded ? 1 : 0, transition: 'opacity 0.25s',
        }}
      />
    </div>
  );
}

function ExpandedContent({ participant }: { participant: Participant }) {
  const passportFile = participant.files?.find(f => f.fileType === 'PASSPORT');
  const nationalIdFile = participant.files?.find(f => f.fileType === 'NATIONAL_ID');
  const [rotateTs, setRotateTs] = useState(0);
  const onRotated = useCallback(() => setRotateTs(t => t + 1), []);

  const allFields = [
    { label: 'اسم المشارك', value: participant.fullNamePassport, ltr: false },
    { label: 'رقم الجواز', value: participant.passportNumber, ltr: true },
    { label: 'انتهاء الجواز', value: participant.passportExpiry ? new Date(participant.passportExpiry).toLocaleDateString('en-GB') : '—', ltr: false },
    { label: 'رقم الهوية', value: participant.nationalId, ltr: true },
    { label: 'رقم الجوال', value: participant.mobile, ltr: true },
    { label: 'تاريخ الميلاد', value: participant.birthDate ? new Date(participant.birthDate).toLocaleDateString('en-GB') : '—', ltr: false },
    { label: 'رقم الآيبان', value: participant.iban, ltr: true },
  ];

  return (
    <div style={{ padding: '14px 24px 18px', background: '#f7fbfb' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {allFields.map(f => (
          <div key={f.label} style={{
            background: '#fff', borderRadius: 10, border: '1px solid #e2ebeb',
            padding: '8px 12px',
          }}>
            <div style={{ fontSize: '0.62rem', color: '#889f9f', fontWeight: 600, marginBottom: 3, userSelect: 'text' }}>{f.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                flex: 1, fontSize: '0.82rem', color: '#014948', fontWeight: 700, userSelect: 'text',
                direction: f.ltr ? 'ltr' : undefined, textAlign: f.ltr ? 'left' : 'right',
                overflowWrap: 'break-word',
              }}>
                {f.value || '—'}
              </div>
              <CopyBtn text={f.value || ''} />
            </div>
          </div>
        ))}
      </div>

      {/* Images */}
      {passportFile || nationalIdFile ? (
        <div style={{ display: 'flex', gap: 10 }}>
          {passportFile && (
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e4ebeb', overflow: 'hidden' }}>
              <div style={{ padding: '6px 14px', background: '#eef6f6', fontSize: '0.68rem', fontWeight: 700, color: '#014948', borderBottom: '1px solid #e4ebeb', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <span style={{ flex: 1 }}>جواز السفر</span>
                <RotateImageBtn fileId={passportFile.id} onRotated={onRotated} />
              </div>
              <div style={{ padding: 6, display: 'flex', justifyContent: 'center', background: '#fafcfc' }}>
                <ImgWithLoader src={rotateTs ? `/api/files/${passportFile.id}?r=${rotateTs}` : `/api/files/${passportFile.id}`} alt="جواز السفر" />
              </div>
            </div>
          )}
          {nationalIdFile && (
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e4ebeb', overflow: 'hidden' }}>
              <div style={{ padding: '6px 14px', background: '#f8f5ee', fontSize: '0.68rem', fontWeight: 700, color: '#8a7440', borderBottom: '1px solid #e4ebeb', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a7440" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <span style={{ flex: 1 }}>الهوية الوطنية</span>
                <RotateImageBtn fileId={nationalIdFile.id} onRotated={onRotated} />
              </div>
              <div style={{ padding: 6, display: 'flex', justifyContent: 'center', background: '#fafcfc' }}>
                <ImgWithLoader src={rotateTs ? `/api/files/${nationalIdFile.id}?r=${rotateTs}` : `/api/files/${nationalIdFile.id}`} alt="الهوية الوطنية" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 16, color: '#94a8a8', background: '#fff', borderRadius: 12, border: '1px solid #e4ebeb', fontSize: '0.78rem' }}>
          لا توجد ملفات مرفوعة لهذا المشارك
        </div>
      )}
    </div>
  );
}
