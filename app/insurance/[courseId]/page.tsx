'use client';

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import RotateImageBtn from '@/components/RotateImageBtn';

export default function InsuranceReviewPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d?.role === 'MANAGER') setIsManager(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/insurance/${params.courseId}`)
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
    const ids = participants.flatMap((p: any) => (p.files || [])
      .filter((f: any) => !f.mimeType || f.mimeType.startsWith('image/'))
      .map((f: any) => f.id));
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

  const goToPrev = () => {
    if (!expandedId || participants.length === 0) return;
    const idx = participants.findIndex(p => p.id === expandedId);
    if (idx > 0) setExpandedId(participants[idx - 1].id);
  };
  const goToNext = () => {
    if (!expandedId || participants.length === 0) return;
    const idx = participants.findIndex(p => p.id === expandedId);
    if (idx < participants.length - 1) setExpandedId(participants[idx + 1].id);
  };

  async function deleteParticipant(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;
    try {
      const res = await fetch(`/api/participant/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setParticipants(prev => prev.filter(p => p.id !== id));
      if (expandedId === id) setExpandedId(participants.length > 1 ? participants.find(p => p.id !== id)?.id || null : null);
    } catch { alert('فشل حذف المشارك'); }
  }

  if (loading) {
    return (
      <AppShell title="مراجعة التأمين">
        <div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell title="مراجعة التأمين">
        <div className="empty-state"><p>الدورة غير موجودة</p></div>
      </AppShell>
    );
  }

  const insuranceStart = course.startDate ? new Date(new Date(course.startDate).getTime() - 86400000) : null;
  const insuranceEnd = course.endDate ? new Date(new Date(course.endDate).getTime() + 86400000 * 3) : null;

  return (
    <AppShell title="مراجعة التأمين">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Document-style header */}
        <div style={{
          background: 'linear-gradient(135deg, #016564 0%, #014948 100%)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 20, color: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <img src="/images/nauss-logo-gold.png" alt="" style={{ width: 52, height: 'auto' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {course.activityName || 'دورة تدريبية'}
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#d0b284' }}>
                {course.venue || ''}
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.78rem', color: '#bcd0d0',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12,
          }}>
            <span>بداية الدورة: {course.startDate ? new Date(course.startDate).toLocaleDateString('en-GB') : '—'}</span>
            <span>نهاية الدورة: {course.endDate ? new Date(course.endDate).toLocaleDateString('en-GB') : '—'}</span>
            <span>عدد المشاركين: {participants.length}</span>
            {insuranceStart && <span>بداية التأمين: {insuranceStart.toLocaleDateString('en-GB')}</span>}
            {insuranceEnd && <span>نهاية التأمين: {insuranceEnd.toLocaleDateString('en-GB')}</span>}
          </div>
        </div>

        {/* Participant table - document style */}
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
                {participants.map((p, i) => (
                  <Fragment key={p.id}>
                    <tr
                      style={{
                        ...(expandedId === p.id ? { background: '#eef6f6' } : i % 2 === 1 ? { background: '#fafcfc' } : {}),
                        transition: 'background 0.12s',
                        borderBottom: expandedId === p.id ? 'none' : '1px solid #eef3f3',
                      }}
                      onMouseEnter={e => { if (expandedId !== p.id) e.currentTarget.style.background = '#f4f8f8'; }}
                      onMouseLeave={e => { if (expandedId !== p.id) e.currentTarget.style.background = i % 2 === 1 ? '#fafcfc' : '#ffffff'; }}
                    >
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#014948', textAlign: 'right' }}>{p.fullNamePassport}</td>
                      <td style={{ ...tdStyle, userSelect: 'text' }} dir="ltr">{p.passportNumber}</td>
                      <td style={{ ...tdStyle, userSelect: 'text' }}>{p.passportExpiry ? new Date(p.passportExpiry).toLocaleDateString('en-GB') : '—'}</td>
                      <td style={{ ...tdStyle, userSelect: 'text' }} dir="ltr">{p.nationalId}</td>
                      <td style={tdStyle}>
                        <FileBadge files={p.files} />
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <ExpandIcon expanded={expandedId === p.id} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === p.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid #eef3f3' }}>
                          <div key={p.id} style={{ animation: 'slideUp 0.2s ease' }}>
                            <ExpandedPreview participant={p} />
                            <div style={{ padding: '0 20px 14px', background: '#f7fbfb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                              {isManager && (
                                <MoveParticipantBtn
                                  participantId={p.id}
                                  participantName={p.fullNamePassport}
                                  currentCourseId={params.courseId}
                                  onMoved={id => setParticipants(prev => prev.filter(x => x.id !== id))}
                                />
                              )}
                              <DeleteParticipantBtn participantId={p.id} onDelete={id => setParticipants(prev => prev.filter(x => x.id !== id))} />
                            </div>
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

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 14, padding: '0 4px',
        }}>
          <button
            onClick={goToPrev}
            disabled={!expandedId || participants.findIndex(p => p.id === expandedId) <= 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 10, border: '1px solid #dce5e5',
              background: '#ffffff', color: '#014948', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', opacity: !expandedId || participants.findIndex(p => p.id === expandedId) <= 0 ? 0.4 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            السابق
          </button>
          <span style={{ fontSize: '0.78rem', color: '#667777' }}>
            {expandedId ? `${participants.findIndex(p => p.id === expandedId) + 1} / ${participants.length}` : '—'}
          </span>
          <button
            onClick={goToNext}
            disabled={!expandedId || participants.findIndex(p => p.id === expandedId) >= participants.length - 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 10, border: '1px solid #dce5e5',
              background: '#ffffff', color: '#014948', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', opacity: !expandedId || participants.findIndex(p => p.id === expandedId) >= participants.length - 1 ? 0.4 : 1,
            }}
          >
            التالي
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#014948" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </AppShell>
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
  userSelect: 'text', WebkitUserSelect: 'text',
};

function FileBadge({ files }: { files: any[] }) {
  const hasPassport = files?.some((f: any) => f.fileType === 'PASSPORT');
  const hasNationalId = files?.some((f: any) => f.fileType === 'NATIONAL_ID');

  if (!hasPassport && !hasNationalId) return <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>—</span>;

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {hasPassport && <span style={{ fontSize: '0.65rem', background: '#e2f0ee', color: '#016564', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>جواز</span>}
      {hasNationalId && <span style={{ fontSize: '0.65rem', background: '#f0ede6', color: '#8a7440', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>هوية</span>}
    </div>
  );
}

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667777" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

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

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, cursor: 'zoom-out',
      }}
    >
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, left: 16,
        background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <img
        src={src} alt={alt} onClick={e => e.stopPropagation()}
        style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', cursor: 'default' }}
      />
    </div>
  );
}

function ImgWithLoader({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  function retry() {
    setLoaded(false);
    setFailed(false);
  }

  if (failed) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: '#94a8a8' }}>
        <div style={{ fontSize: '0.75rem', marginBottom: 8 }}>تعذّر التحميل</div>
        <button type="button" onClick={retry} style={{
          background: '#e2f0ee', border: 'none', borderRadius: 8, padding: '4px 14px',
          cursor: 'pointer', color: '#016564', fontSize: '0.7rem', fontWeight: 700,
        }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <>
      {lightbox && <Lightbox src={src} alt={alt} onClose={() => setLightbox(false)} />}
      <div style={{ position: 'relative', width: '100%', minHeight: 120 }}>
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#eef3f3', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8cccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
        <div style={{ position: 'relative', display: loaded ? 'block' : 'none' }}>
          <img
            src={src} alt={alt} loading="lazy"
            onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
            onClick={() => setLightbox(true)}
            style={{
              width: '100%', maxHeight: 220, borderRadius: 8, objectFit: 'contain', objectPosition: 'center',
              opacity: 1, transition: 'opacity 0.25s', cursor: 'zoom-in', display: 'block',
            }}
          />
          {/* Zoom hint */}
          <div style={{
            position: 'absolute', bottom: 6, left: 6,
            background: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: '2px 7px',
            fontSize: '0.62rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'none',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            تكبير
          </div>
        </div>
        {/* hidden img to trigger onLoad when display:none */}
        {!loaded && <img src={src} alt="" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />}
      </div>
    </>
  );
}

function FilePreview({ file, alt, rotateTs }: { file: any; alt: string; rotateTs: number }) {
  const isImage = !file.mimeType || file.mimeType.startsWith('image/');
  if (isImage) {
    return <ImgWithLoader src={rotateTs ? `/api/files/${file.id}?r=${rotateTs}` : `/api/files/${file.id}`} alt={alt} />;
  }

  return (
    <div style={{ textAlign: 'center', padding: 20, color: '#5f7777', fontSize: '0.78rem' }}>
      <div style={{ marginBottom: 10, fontWeight: 800 }}>{file.fileName || 'ملف مرفق'}</div>
      <a href={`/api/files/${file.id}`} target="_blank" rel="noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#e2f0ee', color: '#016564', borderRadius: 8, padding: '7px 14px',
        textDecoration: 'none', fontWeight: 800,
      }}>
        فتح الملف
      </a>
    </div>
  );
}

function ExpandedPreview({ participant }: { participant: any }) {
  const passportFile = participant.files?.find((f: any) => f.fileType === 'PASSPORT');
  const nationalIdFile = participant.files?.find((f: any) => f.fileType === 'NATIONAL_ID');
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
    <div style={{ padding: '14px 20px 20px', background: '#f7fbfb' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {passportFile && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4ebeb', overflow: 'hidden' }}>
              <div style={{ padding: '6px 14px', background: '#eef6f6', fontSize: '0.7rem', fontWeight: 700, color: '#014948', borderBottom: '1px solid #e4ebeb', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1 }}>صورة جواز السفر</span>
                {(!passportFile.mimeType || passportFile.mimeType.startsWith('image/')) && <RotateImageBtn fileId={passportFile.id} onRotated={onRotated} />}
              </div>
              <div style={{ padding: 8, background: '#fafcfc' }}>
                <FilePreview file={passportFile} rotateTs={rotateTs} alt="جواز السفر" />
              </div>
            </div>
          )}
          {nationalIdFile && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4ebeb', overflow: 'hidden' }}>
              <div style={{ padding: '6px 14px', background: '#f8f5ee', fontSize: '0.7rem', fontWeight: 700, color: '#8a7440', borderBottom: '1px solid #e4ebeb', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1 }}>صورة الهوية الوطنية</span>
                {(!nationalIdFile.mimeType || nationalIdFile.mimeType.startsWith('image/')) && <RotateImageBtn fileId={nationalIdFile.id} onRotated={onRotated} />}
              </div>
              <div style={{ padding: 8, background: '#fafcfc' }}>
                <FilePreview file={nationalIdFile} rotateTs={rotateTs} alt="الهوية الوطنية" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 20, color: '#94a8a8', background: '#fff', borderRadius: 12, border: '1px solid #e4ebeb', fontSize: '0.82rem' }}>
          لا توجد ملفات مرفوعة لهذا المشارك
        </div>
      )}
    </div>
  );
}

function MoveParticipantBtn({ participantId, participantName, currentCourseId, onMoved }: {
  participantId: string;
  participantName: string;
  currentCourseId: string;
  onMoved: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState<{ id: string; activityName: string; startDate: string | null }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState('');

  async function openModal() {
    setShowModal(true);
    setSelectedId('');
    setError('');
    setLoadingCourses(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      // Filter: only published, no insurance issued, not current course
      const available = (data.courses || []).filter(
        (c: any) => c.id !== currentCourseId && c.status === 'PUBLISHED' && !c.insuranceIssuedAt
      );
      setCourses(available);
    } catch { setError('تعذّر تحميل الدورات'); }
    finally { setLoadingCourses(false); }
  }

  async function handleMove() {
    if (!selectedId) { setError('اختر دورة أولاً'); return; }
    setMoving(true);
    setError('');
    try {
      const res = await fetch(`/api/participant/${participantId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCourseId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'فشل النقل'); return; }
      setShowModal(false);
      onMoved(participantId);
    } catch { setError('حدث خطأ'); }
    finally { setMoving(false); }
  }

  return (
    <>
      <button
        onClick={openModal}
        style={{
          background: 'rgba(1,73,72,0.06)', border: '1px solid rgba(1,73,72,0.14)', borderRadius: 8,
          padding: '5px 10px', cursor: 'pointer', color: '#016564', fontSize: '0.7rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
        </svg>
        نقل إلى دورة أخرى
      </button>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440,
            padding: '24px 24px 20px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#014948' }}>نقل مشارك</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#667777' }}>
              نقل <strong>{participantName}</strong> إلى دورة أخرى
            </p>

            {loadingCourses ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#889f9f', fontSize: '0.82rem' }}>جاري تحميل الدورات...</div>
            ) : courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a8a8', fontSize: '0.82rem' }}>
                لا توجد دورات نشطة متاحة للنقل إليها
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
                {courses.map(c => (
                  <label key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 10, border: `1.5px solid ${selectedId === c.id ? '#016564' : '#e0eaea'}`,
                    background: selectedId === c.id ? '#f0faf9' : '#fff',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}>
                    <input type="radio" name="target-course" value={c.id}
                      checked={selectedId === c.id}
                      onChange={() => { setSelectedId(c.id); setError(''); }}
                      style={{ accentColor: '#016564', width: 16, height: 16, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#014948' }}>{c.activityName}</div>
                      {c.startDate && (
                        <div style={{ fontSize: '0.68rem', color: '#889f9f', marginTop: 2 }}>
                          {new Date(c.startDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(191,61,48,0.06)', border: '1px solid rgba(191,61,48,0.15)', borderRadius: 8, padding: '8px 12px', color: '#bf3d30', fontSize: '0.75rem', fontWeight: 700, marginBottom: 12 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '8px 18px', borderRadius: 8, border: '1px solid #dce5e5',
                background: '#fff', color: '#667777', fontSize: '0.8rem', cursor: 'pointer',
              }}>إلغاء</button>
              <button onClick={handleMove} disabled={moving || !selectedId || courses.length === 0} style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: selectedId ? '#014948' : '#c8d8d8', color: '#fff',
                fontSize: '0.8rem', fontWeight: 700, cursor: selectedId ? 'pointer' : 'not-allowed',
                opacity: moving ? 0.7 : 1,
              }}>
                {moving ? 'جاري النقل...' : 'نقل المشارك'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteParticipantBtn({ participantId, onDelete }: { participantId: string; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <button
      onClick={async () => {
        if (!confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;
        setDeleting(true);
        try {
          const res = await fetch(`/api/participant/${participantId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error();
          onDelete(participantId);
        } catch { alert('فشل الحذف'); }
        finally { setDeleting(false); }
      }}
      disabled={deleting}
      style={{
        background: 'rgba(191,61,48,0.06)', border: '1px solid rgba(191,61,48,0.1)', borderRadius: 8,
        padding: '5px 10px', cursor: 'pointer', color: '#bf3d30', fontSize: '0.7rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
      </svg>
      {deleting ? '...' : 'حذف'}
    </button>
  );
}
