'use client';

import { useState } from 'react';

export default function RotateImageBtn({ fileId, onRotated }: { fileId: string; onRotated: () => void }) {
  const [rotating, setRotating] = useState(false);

  async function handleRotate() {
    if (rotating) return;
    setRotating(true);
    try {
      const res = await fetch(`/api/files/${fileId}/rotate`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      onRotated();
    } catch {
      alert('فشل تدوير الصورة');
    } finally {
      setRotating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRotate}
      disabled={rotating}
      title="تدوير الصورة"
      style={{
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', border: 'none',
        borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: rotating ? 'wait' : 'pointer',
        color: '#fff', transition: 'all 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.65)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={rotating ? { animation: 'spin 0.6s linear infinite' } : undefined}>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    </button>
  );
}
