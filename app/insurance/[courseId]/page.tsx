'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function InsuranceReviewPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/insurance/${params.courseId}`)
      .then(r => r.json())
      .then(data => {
        setCourse(data.course);
        setParticipants(data.participants);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.courseId]);

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

  return (
    <AppShell title="مراجعة التأمين">
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Course info header */}
        <div style={{
          background: 'linear-gradient(135deg, #016564 0%, #014948 100%)',
          borderRadius: 20, padding: '20px 28px', marginBottom: 24, color: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <img src="/images/nauss-logo-gold.png" alt="" style={{ width: 48, height: 'auto' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{course.activityName || 'دورة تدريبية'}</h1>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#d0b284' }}>{course.venue || ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: '0.78rem', color: '#c9d7d7' }}>
            <span>بداية: {course.startDate ? new Date(course.startDate).toLocaleDateString('ar-SA') : '—'}</span>
            <span>نهاية: {course.endDate ? new Date(course.endDate).toLocaleDateString('ar-SA') : '—'}</span>
            <span>المشاركون: {participants.length}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Participants list */}
          <div style={{
            background: '#ffffff', borderRadius: 16, border: '1px solid #dce5e5', overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #dce5e5', fontSize: '0.82rem', fontWeight: 700, color: '#014948' }}>
              قائمة المشاركين
            </div>
            <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
              {participants.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  style={{
                    width: '100%', padding: '12px 16px', border: 'none',
                    borderBottom: '1px solid #eef3f3',
                    background: selected?.id === p.id ? '#eef6f6' : 'transparent',
                    cursor: 'pointer', textAlign: 'right',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.background = '#f8fafa'; }}
                  onMouseLeave={e => { if (selected?.id !== p.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: 8,
                    background: selected?.id === p.id ? '#016564' : '#e2e8f0',
                    color: selected?.id === p.id ? '#ffffff' : '#667777',
                    fontSize: '0.72rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: '0.82rem', color: '#014948', fontWeight: selected?.id === p.id ? 700 : 400 }}>
                    {p.fullNamePassport}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview pane */}
          <div>
            {selected ? (
              <ParticipantPreview participant={selected} />
            ) : (
              <div style={{
                background: '#ffffff', borderRadius: 16, border: '1px solid #dce5e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 400, color: '#94a3b8', fontSize: '0.85rem',
              }}>
                اختر مشاركًا لعرض بياناته
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}

function ParticipantPreview({ participant }: { participant: any }) {
  const passportFile = participant.files?.find((f: any) => f.fileType === 'PASSPORT');
  const nationalIdFile = participant.files?.find((f: any) => f.fileType === 'NATIONAL_ID');

  return (
    <div style={{
      background: '#ffffff', borderRadius: 16, border: '1px solid #dce5e5', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #dce5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#014948' }}>{participant.fullNamePassport}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#667777' }}>
            جواز: {participant.passportNumber} | {participant.passportExpiry ? new Date(participant.passportExpiry).toLocaleDateString('ar-SA') : '—'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {passportFile && (
          <div style={{ borderLeft: '1px solid #dce5e5' }}>
            <div style={{ padding: '10px 16px', background: '#f8fafa', fontSize: '0.75rem', fontWeight: 600, color: '#014948', borderBottom: '1px solid #dce5e5' }}>
              صورة جواز السفر
            </div>
            <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
              <img
                src={`/api/files/${passportFile.id}`}
                alt="Passport"
                style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
            </div>
          </div>
        )}
        {nationalIdFile && (
          <div>
            <div style={{ padding: '10px 16px', background: '#f8fafa', fontSize: '0.75rem', fontWeight: 600, color: '#014948', borderBottom: '1px solid #dce5e5' }}>
              صورة الهوية الوطنية
            </div>
            <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
              <img
                src={`/api/files/${nationalIdFile.id}`}
                alt="National ID"
                style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #dce5e5', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
        {[
          { label: 'رقم الجوال', value: participant.mobile },
          { label: 'تاريخ الميلاد', value: participant.birthDate ? new Date(participant.birthDate).toLocaleDateString('ar-SA') : '—' },
          { label: 'رقم الهوية', value: participant.nationalId },
          { label: 'رقم الآيبان', value: participant.iban },
        ].map((f: any) => (
          <div key={f.label} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.72rem', color: '#667777', fontWeight: 600, whiteSpace: 'nowrap' }}>{f.label}:</span>
            <span style={{ fontSize: '0.82rem', color: '#014948' }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
