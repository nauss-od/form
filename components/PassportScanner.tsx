'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { parseMrz, MrzResult } from '@/lib/mrz-parser';

interface ExtractedField {
  key: keyof MrzResult;
  label: string;
  value: string;
  checked: boolean;
}

interface PassportScannerProps {
  onResult: (data: MrzResult) => void;
  onClose: () => void;
}

type Step = 'select' | 'process' | 'review';

export default function PassportScanner({ onResult, onClose }: PassportScannerProps) {
  const [step, setStep] = useState<Step>('select');
  const [processMsg, setProcessMsg] = useState('جارٍ تجهيز الصورة...');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setStep('process');
      setError('');

      // Load image into canvas for OCR
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        // Scale down for performance
        const maxDim = 1600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setError('خطأ في تجهيز الصورة'); setStep('select'); return; }
        ctx.drawImage(img, 0, 0, w, h);

        try {
          setProcessMsg('جارٍ التعرف على النصوص...');

          const worker = await createWorker('eng', 1);
          setProcessMsg('تحليل بيانات جواز السفر...');
          const { data } = await worker.recognize(canvas);
          await worker.terminate();

          const result = parseMrz(data.text);
          if (result) {
            setFields([
              { key: 'fullNamePassport', label: 'الاسم الكامل', value: result.fullNamePassport, checked: true },
              { key: 'passportNumber', label: 'رقم جواز السفر', value: result.passportNumber, checked: true },
              { key: 'passportExpiry', label: 'تاريخ انتهاء الجواز', value: result.passportExpiry, checked: true },
              { key: 'birthDate', label: 'تاريخ الميلاد', value: result.birthDate, checked: true },
              { key: 'nationality', label: 'الجنسية', value: result.nationality, checked: false },
            ]);
            setStep('review');
          } else {
            setError('لم يتم التعرف على بيانات MRZ. تأكد من تصوير صفحة البيانات بالكامل في الجواز.');
            setStep('select');
          }
        } catch {
          setError('حدث خطأ في معالجة الصورة');
          setStep('select');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  function handleCameraCapture() {
    // Use native camera UI via file input (works on all devices)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file);
    };
    input.click();
  }

  function handleGalleryUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file);
    };
    input.click();
  }

  function toggleField(index: number) {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, checked: !f.checked } : f));
  }

  function updateField(index: number, value: string) {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, value } : f));
  }

  function confirmData() {
    const checked = fields.filter(f => f.checked);
    if (checked.length === 0) { setError('اختر حقل واحد على الأقل'); return; }

    // Build result from checked fields
    const result: MrzResult = {
      fullNamePassport: '',
      passportNumber: '',
      passportExpiry: '',
      birthDate: '',
      nationality: '',
      issuingCountry: '',
      sex: '',
    };
    for (const f of checked) {
      (result as any)[f.key] = f.value;
    }
    onResult(result);
  }

  function renderDatePicker(value: string, onChange: (v: string) => void) {
    // Simple date input for review step
    return (
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', minHeight: 40, borderRadius: 12, border: '1px solid var(--nauss-line)',
          padding: '0 12px', fontFamily: 'inherit', fontSize: '0.88rem', direction: 'ltr',
        }}
      />
    );
  }

  const displayValue = (key: string, value: string, onChange: (v: string) => void) => {
    if (key === 'passportExpiry' || key === 'birthDate') return renderDatePicker(value, onChange);
    return (
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', minHeight: 40, borderRadius: 12, border: '1px solid var(--nauss-line)',
          padding: '0 12px', fontFamily: 'inherit', fontSize: '0.88rem', direction: 'ltr',
        }}
      />
    );
  };

  return (
    <div className="scanner-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="scanner-modal">
        {/* Header */}
        <div className="scanner-head">
          <h3>مسح جواز السفر</h3>
          <button className="scanner-close" onClick={onClose}>✕</button>
        </div>

        <div className="scanner-body">

          {/* ===== Step: Select source ===== */}
          {step === 'select' && (
            <div className="scanner-select">
              {preview && (
                <div className="scanner-preview">
                  <img src={preview} alt="preview" />
                </div>
              )}

              {error && <div className="scanner-error">{error}</div>}

              <div className="scanner-options">
                <button className="scanner-option" onClick={handleCameraCapture}>
                  <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                  </svg>
                  <strong>التقاط صورة</strong>
                  <span>تصوير جواز السفر بالكاميرا</span>
                </button>

                <button className="scanner-option" onClick={handleGalleryUpload}>
                  <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/>
                    <path d="M2 15l5-5 3 3 3-3 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <strong>رفع صورة</strong>
                  <span>اختيار صورة من الجهاز</span>
                </button>
              </div>

              <p className="scanner-hint">
                1. اختر طريقة إدخال الصورة<br />
                2. تأكد من ظهور سطري MRZ في الصورة<br />
                3. راجع البيانات المستخرجة قبل تأكيدها
              </p>
            </div>
          )}

          {/* ===== Step: Processing ===== */}
          {step === 'process' && (
            <div className="scanner-process">
              {preview && (
                <div className="scanner-preview">
                  <img src={preview} alt="captured" />
                </div>
              )}
              <div className="scanner-spinner">
                <svg className="spinner" viewBox="0 0 24 24" fill="none" width="36" height="36">
                  <circle cx="12" cy="12" r="10" stroke="#016564" strokeWidth="2.5" opacity="0.2"/>
                  <path d="M12 2a10 10 0 019.95 9" stroke="#016564" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <p>{processMsg}</p>
              </div>
            </div>
          )}

          {/* ===== Step: Review ===== */}
          {step === 'review' && (
            <div className="scanner-review">
              <div className="scanner-review-head">
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="#016564" strokeWidth="1.8" fill="rgba(1,101,100,0.06)"/>
                  <path d="M9 12l2 2 4-4" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <strong>تم استخراج البيانات</strong>
                  <span>يرجى مراجعة البيانات أدناه ثم تأكيد الحقول الصحيحة</span>
                </div>
              </div>

              <div className="scanner-fields">
                {fields.map((f, i) => (
                  <div key={f.key} className={`scanner-field ${f.checked ? 'checked' : ''}`}>
                    <label className="scanner-field-toggle">
                      <input type="checkbox" checked={f.checked} onChange={() => toggleField(i)} />
                      <span className="scanner-field-label">{f.label}</span>
                    </label>
                    {displayValue(f.key, f.value, (v) => updateField(i, v))}
                  </div>
                ))}
              </div>

              {error && <div className="scanner-error">{error}</div>}

              <button className="scanner-confirm" onClick={confirmData}>
                تأكيد وتعبئة النموذج
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                  <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
