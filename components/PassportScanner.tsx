'use client';

import { useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { parseMrz, MrzResult } from '@/lib/mrz-parser';

interface PassportScannerProps {
  onResult: (data: MrzResult) => void;
  onClose: () => void;
}

export default function PassportScanner({ onResult, onClose }: PassportScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(true);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('تعذر الوصول إلى الكاميرا');
    }
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
    setCaptured(true);
    setCameraActive(false);
    streamRef.current.getTracks().forEach(t => t.stop());
    runOcr(canvas);
  }

  async function runOcr(canvas: HTMLCanvasElement) {
    setProcessing(true);
    setError('');
    try {
      const worker = await createWorker('eng', 1, {
        workerPath: undefined,
        logger: (m) => { if (m.status === 'recognizing text') setProcessing(true); }
      });
      const { data } = await worker.recognize(canvas);
      await worker.terminate();

      const result = parseMrz(data.text);
      if (result) {
        onResult(result);
      } else {
        setError('لم يتم التعرف على بيانات MRZ. تأكد من تصوير صفحة البيانات بالكامل.');
      }
    } catch {
      setError('حدث خطأ في معالجة الصورة');
    } finally {
      setProcessing(false);
    }
  }

  function retake() {
    setCaptured(false);
    setPreview(null);
    setError('');
    setCameraActive(true);
    startCamera();
  }

  // Start camera on mount
  const started = useRef(false);
  if (!started.current) {
    started.current = true;
    startCamera();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(7, 25, 25, 0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 28, maxWidth: 520, width: '100%',
        overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--nauss-line)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#014948' }}>
            مسح جواز السفر
          </h3>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 12, border: 0,
            background: 'var(--nauss-soft)', cursor: 'pointer',
            display: 'grid', placeItems: 'center', color: '#64748b',
            fontSize: '1.2rem', fontWeight: 700,
          }}>✕</button>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          {!captured && (
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000' }}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{
                position: 'absolute', inset: '12%', borderRadius: 16,
                border: '2px dashed rgba(255,255,255,0.4)',
                pointerEvents: 'none',
              }} />
            </div>
          )}

          {preview && (
            <div style={{ borderRadius: 20, overflow: 'hidden' }}>
              <img src={preview} alt="captured" style={{ width: '100%', display: 'block' }} />
            </div>
          )}

          {error && (
            <div style={{
              padding: '14px 16px', borderRadius: 16,
              background: 'rgba(191,61,48,0.06)',
              border: '1px solid rgba(191,61,48,0.14)',
              color: 'var(--danger)', fontWeight: 700, fontSize: '0.88rem',
              textAlign: 'center',
            }}>{error}</div>
          )}

          {processing && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <svg className="spinner" viewBox="0 0 24 24" fill="none" width="28" height="28" style={{ margin: '0 auto 10px' }}>
                <circle cx="12" cy="12" r="10" stroke="#016564" strokeWidth="2.5" opacity="0.2"/>
                <path d="M12 2a10 10 0 019.95 9" stroke="#016564" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>جاري معالجة الصورة...</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {!captured ? (
              <button onClick={capture} disabled={processing} style={{
                flex: 1, minHeight: 54, borderRadius: 18, border: 0,
                background: 'linear-gradient(135deg, #016564, #014948)',
                color: '#fff', fontWeight: 900, fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}>
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="4" fill="currentColor"/>
                </svg>
                التقاط الصورة
              </button>
            ) : (
              <>
                <button onClick={retake} style={{
                  flex: 1, minHeight: 54, borderRadius: 18, border: '1px solid var(--nauss-line)',
                  background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '1rem',
                  cursor: 'pointer',
                }}>
                  إعادة التصوير
                </button>
                {!processing && error && (
                  <button onClick={() => preview && retake()} style={{ display: 'none' }} />
                )}
              </>
            )}
          </div>

          <p style={{ margin: 0, textAlign: 'center', color: '#94a5a5', fontSize: '0.78rem', lineHeight: 1.8 }}>
            قم بتصوير صفحة البيانات في جواز السفر بحيث يظهر السطرين السفليين (MRZ) بالكامل
          </p>
        </div>
      </div>
    </div>
  );
}
