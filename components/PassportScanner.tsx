'use client';

import { useState, useEffect } from 'react';
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

type Step = 'input' | 'review';

export default function PassportScanner({ onResult, onClose }: PassportScannerProps) {
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState('');
  const [mrzInput, setMrzInput] = useState('');
  const [fields, setFields] = useState<ExtractedField[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function parseManualMrz() {
    const result = parseMrz(mrzInput);
    if (result && result.fullNamePassport) {
      setFields([
        { key: 'fullNamePassport', label: 'الاسم الكامل', value: result.fullNamePassport, checked: true },
        { key: 'passportNumber', label: 'رقم جواز السفر', value: result.passportNumber, checked: true },
        { key: 'passportExpiry', label: 'تاريخ انتهاء الجواز', value: result.passportExpiry, checked: true },
        { key: 'birthDate', label: 'تاريخ الميلاد', value: result.birthDate, checked: true },
        { key: 'nationality', label: 'الجنسية', value: result.nationality || 'SAU', checked: false },
      ]);
      setError('');
      setStep('review');
    } else {
      setError('لم يتم التعرف على النص المدخل. تأكد من إدخال سطري MRZ بشكل صحيح.');
    }
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

    const result: MrzResult = {
      fullNamePassport: '', passportNumber: '', passportExpiry: '',
      birthDate: '', nationality: '', issuingCountry: '', sex: '',
    };
    for (const f of checked) (result as any)[f.key] = f.value;
    onResult(result);
  }

  function renderFieldInput(key: string, value: string, onChange: (v: string) => void) {
    if (key === 'passportExpiry' || key === 'birthDate') {
      return (
        <input type="date" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', minHeight: 40, borderRadius: 12, border: '1px solid var(--nauss-line)', padding: '0 12px', fontFamily: 'inherit', fontSize: '0.88rem', direction: 'ltr' }}
        />
      );
    }
    return (
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', minHeight: 40, borderRadius: 12, border: '1px solid var(--nauss-line)', padding: '0 12px', fontFamily: 'inherit', fontSize: '0.88rem', direction: 'ltr' }}
      />
    );
  }

  return (
    <div className="scanner-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="scanner-modal">
        <div className="scanner-head">
          <h3>إدخال بيانات جواز السفر</h3>
          <button className="scanner-close" onClick={onClose}>✕</button>
        </div>

        <div className="scanner-body">

          {step === 'input' && (
            <div>
              <div className="mrz-manual">
                <p style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 700, color: '#014948' }}>
                  أدخل نص MRZ من أسفل جواز السفر (السطرين السفليين):
                </p>
                <textarea
                  value={mrzInput}
                  onChange={e => setMrzInput(e.target.value.toUpperCase())}
                  placeholder="P&lt;SURNAME&lt;&lt;GIVEN&lt;&lt;&lt;&#10;AB123456&lt;SAU..."
                  rows={3}
                  style={{
                    width: '100%', minHeight: 80, borderRadius: 14, border: '1px solid var(--nauss-line)',
                    padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.85rem',
                    direction: 'ltr', resize: 'vertical',
                  }}
                />
                <button onClick={parseManualMrz} className="mrz-parse-btn">
                  تحليل النص
                </button>
              </div>

              {error && <div className="scanner-error">{error}</div>}

              <div className="scanner-hint">
                <p>انسخ السطرين السفليين من منطقة MRZ في جواز سفرك والصقهما في الحقل أعلاه</p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <div className="scanner-review-head">
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="#016564" strokeWidth="1.8" fill="rgba(1,101,100,0.06)"/>
                  <path d="M9 12l2 2 4-4" stroke="#016564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <strong>تم استخراج البيانات</strong>
                  <span>يرجى مراجعة البيانات وتعديل ما يلزم قبل التأكيد</span>
                </div>
              </div>

              <div className="scanner-fields">
                {fields.map((f, i) => (
                  <div key={f.key} className={`scanner-field ${f.checked ? 'checked' : ''}`}>
                    <label className="scanner-field-toggle">
                      <input type="checkbox" checked={f.checked} onChange={() => toggleField(i)} />
                      <span className="scanner-field-label">{f.label}</span>
                    </label>
                    {renderFieldInput(f.key, f.value, (v) => updateField(i, v))}
                  </div>
                ))}
              </div>

              {error && <div className="scanner-error">{error}</div>}

              <button className="scanner-confirm" onClick={confirmData}>
                تأكيد وتعبئة النموذج
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
