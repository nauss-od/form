'use client';

import { FormEvent, useRef, useState } from 'react';
import SmartDatePicker from '@/components/SmartDatePicker';
import { compressImage } from '@/lib/compress-image';

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="36" height="36" style={{ opacity: 0.5 }}>
      <rect x="4" y="14" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M20 2v20m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#016564" strokeWidth="1.6" fill="none"/>
      <path d="M14 2v6h6" stroke="#016564" strokeWidth="1.6" fill="none"/>
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 60 60" fill="none" width="60" height="60" style={{ margin: '0 auto 16px', display: 'block' }}>
      <circle cx="30" cy="30" r="28" stroke="#14805a" strokeWidth="2.5" fill="rgba(20,128,90,0.06)"/>
      <path d="M18 30l8 8 16-16" stroke="#14805a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UploadField({ label, value, onChange, hasError }: {
  label: string;
  value: File | null;
  onChange: (f: File | null) => void;
  hasError?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Build object URL for preview whenever file changes
  useState(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  });

  // Keep preview in sync when value changes from outside (e.g. passport scan)
  const prevValue = useRef<File | null>(null);
  if (prevValue.current !== value) {
    prevValue.current = value;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (value) {
      // schedule async so we can call setPreviewUrl
      setTimeout(() => setPreviewUrl(URL.createObjectURL(value)), 0);
    } else {
      // will be set on next render cycle
    }
  }

  function handleChange(f: File | null) {
    onChange(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  if (value && previewUrl) {
    // Show preview — no clickable input, just the image + change button
    return (
      <div className="field">
        <label>{label} <span className="req">*</span></label>
        <div style={{
          border: '2px solid #016564', borderRadius: 12, overflow: 'hidden',
          background: '#f4f8f8', position: 'relative',
        }}>
          {/* Thumbnail */}
          <img
            src={previewUrl}
            alt="معاينة"
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }}
          />
          {/* Overlay bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', background: 'rgba(1,73,72,0.92)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M9 12l2 2 4-4" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#6ee7b7" strokeWidth="1.6"/>
              </svg>
              <span style={{ color: '#e0f2f1', fontSize: '0.78rem', fontWeight: 700 }}>
                {value.name.length > 28 ? value.name.slice(0, 25) + '…' : value.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 6, color: '#fff', fontSize: '0.72rem', padding: '3px 10px',
                cursor: 'pointer', fontWeight: 700,
              }}
            >
              تغيير
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleChange(e.target.files?.[0] || null)} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
          onChange={e => handleChange(e.target.files?.[0] || null)} />
      </div>
    );
  }

  return (
    <div className="field">
      <label>{label} <span className="req">*</span></label>
      <div className="upload-stack">
        <div className={`upload-zone ${hasError ? 'upload-error' : ''}`}>
          <input type="file" accept="image/*" onChange={e => handleChange(e.target.files?.[0] || null)} />
          <div className="upload-empty">
            <UploadIcon />
            <span>اضغط لاختيار ملف</span>
          </div>
        </div>
        <button type="button" className="upload-camera-btn" onClick={() => cameraRef.current?.click()}>
          <CameraIcon />
          <span>تصوير</span>
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        onChange={e => handleChange(e.target.files?.[0] || null)} style={{ display: 'none' }} />
    </div>
  );
}

function ScanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
}

export default function PublicFormPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const scanInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [passport, setPassport] = useState('');
  const [passportError, setPassportError] = useState('');

  const [expiry, setExpiry] = useState('');
  const [expiryError, setExpiryError] = useState('');

  const [nationalId, setNationalId] = useState('');
  const [nationalIdError, setNationalIdError] = useState('');

  const [mobilePrefix] = useState('+966');
  const [mobileSuffix, setMobileSuffix] = useState('');
  const [mobileError, setMobileError] = useState('');

  const [birthDate, setBirthDate] = useState('');
  const [birthDateError, setBirthDateError] = useState('');

  const [iban, setIban] = useState('');
  const [ibanError, setIbanError] = useState('');

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportFileError, setPassportFileError] = useState('');
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdFileError, setNationalIdFileError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const maxBirth = new Date();
  maxBirth.setFullYear(maxBirth.getFullYear() - 15);
  const maxBirthStr = maxBirth.toISOString().split('T')[0];

  function validateName(v: string) {
    if (!v) { setNameError(''); return; }
    if (!/^[\u0600-\u06FF\sA-Za-z.\-']+$/.test(v)) setNameError('أحرف عربية أو إنجليزية فقط');
    else setNameError('');
  }

  function handlePassportChange(v: string) {
    const upper = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (upper.length > 7) return;
    setPassport(upper);
    if (!upper) { setPassportError(''); return; }
    if (!/^[A-Z]/.test(upper)) setPassportError('يبدأ بحروف إنجليزية');
    else if (!/^[A-Z]{1,3}\d*$/.test(upper) && !/^[A-Z]{1,3}\d{1,6}$/.test(upper)) setPassportError('حروف ثم أرقام فقط');
    else setPassportError('');
  }

  function handleNationalId(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 10);
    setNationalId(digits);
    if (digits.length > 0 && digits.length < 10) setNationalIdError(`${digits.length}/10 أرقام`);
    else if (digits.length === 10) setNationalIdError('');
    else setNationalIdError('');
  }

  function handleMobileSuffix(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 9);
    setMobileSuffix(digits);
    if (digits.length > 0 && digits.length < 9) setMobileError(`${digits.length}/9 أرقام`);
    else if (digits.length === 9) setMobileError('');
    else setMobileError('');
  }

  function handleIban(v: string) {
    const upper = v.toUpperCase().replace(/[^SA0-9]/g, '').slice(0, 24);
    setIban(upper);
    if (upper.length > 0 && upper.length < 24) setIbanError(`${upper.length}/24`);
    else if (upper.length === 24 && /^SA\d{22}$/.test(upper)) setIbanError('');
    else if (upper.length === 24) setIbanError('يبدأ بـ SA ثم 22 رقم');
    else setIbanError('');
  }

  function validateAttachment(file: File | null, setFileError: (message: string) => void) {
    if (!file) {
      setFileError('مطلوب');
      return false;
    }
    if (!file.type.startsWith('image/')) {
      setFileError('يرجى رفع صورة فقط');
      return false;
    }
    setFileError('');
    return true;
  }

  function handlePassportFile(file: File | null) {
    setPassportFile(file);
    validateAttachment(file, setPassportFileError);
  }

  function handleNationalIdFile(file: File | null) {
    setNationalIdFile(file);
    validateAttachment(file, setNationalIdFileError);
  }

  async function handleScanPassport(file: File) {
    setScanning(true);
    setScanMsg('جاري تحليل صورة الجواز...');
    try {
      // Crop bottom 25% of image where MRZ lines are printed
      const croppedBlob = await cropMRZZone(file);

      // Dynamic import — loads Tesseract only when needed
      const { createWorker } = await import('tesseract.js');
      setScanMsg('جاري قراءة البيانات...');
      const worker = await createWorker('eng', 1, { logger: () => {} });
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
        tessedit_pageseg_mode: '6', // uniform block of text
      } as Record<string, string>);

      const { data: { text } } = await worker.recognize(croppedBlob);
      await worker.terminate();

      const d = parseMRZ(text);
      if (!d.passportNumber && !d.fullNamePassport) {
        setScanMsg('تعذّر قراءة الجواز — تأكد من وضوح الصورة وأن تشمل الجزء السفلي من الجواز');
        return;
      }

      if (d.fullNamePassport) { setName(d.fullNamePassport); setNameError(''); }
      if (d.passportNumber) { setPassport(d.passportNumber.slice(0, 7)); setPassportError(''); }
      if (d.birthDate) { setBirthDate(d.birthDate); setBirthDateError(''); }
      if (d.passportExpiry) { setExpiry(d.passportExpiry); setExpiryError(''); }
      setPassportFile(file);
      setPassportFileError('');
      setScanMsg('✓ تم استخراج البيانات — راجع الحقول وأكمل المعلومات الناقصة');
    } catch {
      setScanMsg('حدث خطأ في المسح — حاول مرة أخرى');
    } finally {
      setScanning(false);
    }
  }

  // Crop bottom 25% of the image where MRZ lines live
  function cropMRZZone(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const cropH = Math.floor(img.height * 0.25);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas')); return; }
        // Increase contrast for better OCR
        ctx.filter = 'contrast(1.4) grayscale(1)';
        ctx.drawImage(img, 0, img.height - cropH, img.width, cropH, 0, 0, img.width, cropH);
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', 0.95);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function parseMRZ(ocrText: string): { fullNamePassport?: string; passportNumber?: string; birthDate?: string; passportExpiry?: string } {
    // Extract lines that look like MRZ (44 chars of A-Z0-9<)
    const lines = ocrText.split('\n')
      .map(l => l.trim().replace(/\s/g, '').toUpperCase())
      .filter(l => /^[A-Z0-9<]{30,}$/.test(l))
      .map(l => l.padEnd(44, '<').slice(0, 44));

    if (lines.length < 2) return {};

    // Find line1 (starts with P) and line2 (starts with digit or letters for passport no)
    const line1 = lines.find(l => l.startsWith('P')) || lines[0];
    const line2 = lines.find(l => l !== line1 && /^[A-Z0-9]{9}/.test(l)) || lines[1];

    const result: { fullNamePassport?: string; passportNumber?: string; birthDate?: string; passportExpiry?: string } = {};

    // Parse name from line1: P<NAT SURNAME<<GIVENNAME(S)
    if (line1 && line1.startsWith('P')) {
      const namePart = line1.substring(5);
      const [surname, ...givenParts] = namePart.split('<<');
      const surnameClean = surname.replace(/<+/g, ' ').trim();
      const givenClean = (givenParts[0] || '').replace(/<+/g, ' ').trim();
      result.fullNamePassport = [surnameClean, givenClean].filter(Boolean).join(' ');
    }

    // Parse from line2
    if (line2 && line2.length >= 28) {
      // Passport number: positions 0–8
      const passNo = line2.substring(0, 9).replace(/<+/g, '');
      if (passNo.length >= 5) result.passportNumber = passNo;

      // DOB: positions 13–18 (YYMMDD)
      const dobRaw = line2.substring(13, 19);
      if (/^\d{6}$/.test(dobRaw)) {
        const yy = parseInt(dobRaw.slice(0, 2));
        const curYY = new Date().getFullYear() % 100;
        const yyyy = yy > curYY ? 1900 + yy : 2000 + yy;
        result.birthDate = `${yyyy}-${dobRaw.slice(2, 4)}-${dobRaw.slice(4, 6)}`;
      }

      // Expiry: positions 21–26 (YYMMDD)
      const expRaw = line2.substring(21, 27);
      if (/^\d{6}$/.test(expRaw)) {
        const yy = parseInt(expRaw.slice(0, 2));
        const yyyy = yy < 50 ? 2000 + yy : 1900 + yy;
        result.passportExpiry = `${yyyy}-${expRaw.slice(2, 4)}-${expRaw.slice(4, 6)}`;
      }
    }

    return result;
  }

  function validateStep(s: number): boolean {
    let ok = true;
    if (s === 1) {
      if (!name) { setNameError('مطلوب'); ok = false; }
      if (!passport) { setPassportError('مطلوب'); ok = false; }
      else if (!/\d/.test(passport)) { setPassportError('يحتوي على أرقام'); ok = false; }
      else if (!/^[A-Z]{1,3}\d{1,6}$/.test(passport)) { setPassportError('صيغة غير صحيحة'); ok = false; }
      if (!expiry) { setExpiryError('مطلوب'); ok = false; }
      else if (expiry < today) { setExpiryError('لا يمكن أن يكون في الماضي'); ok = false; }
      if (nationalId.length !== 10) { setNationalIdError('يجب 10 أرقام'); ok = false; }
      if (mobileSuffix.length !== 9) { setMobileError('يجب 9 أرقام'); ok = false; }
    }
    if (s === 2) {
      if (!birthDate) { setBirthDateError('مطلوب'); ok = false; }
      else if (birthDate > maxBirthStr) { setBirthDateError('يجب أن لا يقل العمر عن ١٥ سنة'); ok = false; }
      if (iban.length !== 24 || !/^SA\d{22}$/.test(iban)) { setIbanError('غير صحيح'); ok = false; }
    }
    if (s === 3) {
      if (!validateAttachment(passportFile, setPassportFileError)) ok = false;
      if (!validateAttachment(nationalIdFile, setNationalIdFileError)) ok = false;
    }
    return ok;
  }

  function goNext() {
    if (animating) return;
    if (!validateStep(step)) { setError('يرجى تصحيح الأخطاء أعلاه'); return; }
    setError('');
    setAnimDir('next');
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 220);
  }

  function goBack() {
    if (animating) return;
    setAnimDir('prev');
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 220);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (animating) return;
    setError('');
    setLoading(true);

    let hasError = false;
    if (!name) { setNameError('مطلوب'); hasError = true; }
    if (!passport) { setPassportError('مطلوب'); hasError = true; }
    else if (!/\d/.test(passport)) { setPassportError('يحتوي على أرقام'); hasError = true; }
    else if (!/^[A-Z]{1,3}\d{1,6}$/.test(passport)) { setPassportError('صيغة غير صحيحة (حروف ثم أرقام)'); hasError = true; }
    if (!expiry) { setExpiryError('مطلوب'); hasError = true; }
    else if (expiry < today) { setExpiryError('لا يمكن أن يكون في الماضي'); hasError = true; }
    if (nationalId.length !== 10) { setNationalIdError('يجب 10 أرقام'); hasError = true; }
    if (mobileSuffix.length !== 9) { setMobileError('يجب 9 أرقام'); hasError = true; }
    if (!birthDate) { setBirthDateError('مطلوب'); hasError = true; }
    else if (birthDate > maxBirthStr) { setBirthDateError('يجب أن لا يقل العمر عن ١٥ سنة'); hasError = true; }
    if (iban.length !== 24 || !/^SA\d{22}$/.test(iban)) { setIbanError('غير صحيح'); hasError = true; }
    if (!validateAttachment(passportFile, setPassportFileError)) hasError = true;
    if (!validateAttachment(nationalIdFile, setNationalIdFileError)) hasError = true;

    if (hasError) { setError('يرجى تصحيح الأخطاء أعلاه'); setLoading(false); return; }

    try {
      const compressedPassport = await compressImage(passportFile!);
      const compressedNationalId = await compressImage(nationalIdFile!);
      const fd = new FormData();
      fd.append('fullNamePassport', name);
      fd.append('passportNumber', passport);
      fd.append('passportExpiry', expiry);
      fd.append('nationalId', nationalId);
      fd.append('mobile', mobilePrefix + mobileSuffix);
      fd.append('birthDate', birthDate);
      fd.append('iban', iban);
      fd.append('passportFile', compressedPassport);
      fd.append('nationalIdFile', compressedNationalId);

      const res = await fetch(`/api/public/form/${params.token}/submit`, {
        method: 'POST',
        body: fd,
      });
      let data: any;
      try { data = await res.json(); } catch { throw new Error('خطأ في الاتصال بالخادم'); }
      if (!res.ok) throw new Error(data.message || 'حدث خطأ');

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="public-page">
        <div className="public-card" style={{ textAlign: 'center', padding: '56px 40px', maxWidth: 480 }}>
          <SuccessIcon />
          <h2 style={{ color: '#014948', marginBottom: 8, fontSize: '1.4rem', fontWeight: 900 }}>تم استلام بياناتك بنجاح</h2>
          <p style={{ color: '#64748b', lineHeight: 2, margin: 0 }}>شكراً لك، تم إرسال بياناتك. سيتم التواصل معك عند الحاجة.</p>
        </div>
      </div>
    );
  }

  const stepLabels = ['البيانات الشخصية', 'معلومات إضافية', 'المرفقات'];

  return (
    <div className="public-page">
      <div className="public-card">
        <div className="form-header">
          <img src="/images/nauss-logo-gold.png" alt="NAUSS" className="form-logo" />
          <h2>نموذج تأمين المشاركين</h2>
          <p>يرجى تعبئة البيانات بدقة حسب جواز السفر — جامعة نايف العربية للعلوم الأمنية</p>
        </div>

        <div className="wizard-top">
          <div className="wizard-bar">
            <div className="wizard-bar-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
          <div className="wizard-steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`wizard-step ${s === step ? 'active' : ''} ${s < step ? 'done' : ''}`}>
                <div className="wizard-dot">
                  {s < step ? <CheckIcon /> : s}
                </div>
                <span>{stepLabels[s - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="form-body" style={{ paddingTop: 0 }}>

          <div key={step} className={`step-content ${animating ? (animDir === 'next' ? 'exit-next' : 'exit-prev') : ''}`}>

            {step === 1 && (
              <div className="form-section" style={{ gap: 18 }}>

                {/* Passport scanner */}
                <div style={{ background: 'linear-gradient(135deg,#f0faf9,#e6f4f3)', border: '1.5px solid #b2d8d7', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#014948', marginBottom: 6 }}>
                    مسح جواز السفر تلقائياً
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#4a7c7b', margin: '0 0 10px', lineHeight: 1.7 }}>
                    صوّر جواز سفرك وسيتم استخراج البيانات تلقائياً داخل جهازك — لا تُرسَل الصورة لأي جهة
                  </p>
                  <input ref={scanInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleScanPassport(f); e.target.value = ''; }} />
                  <button type="button" onClick={() => scanInputRef.current?.click()} disabled={scanning}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, background: '#014948', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
                    {scanning ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <ScanIcon />}
                    {scanning ? 'جاري المسح...' : 'مسح الجواز'}
                  </button>
                  {scanMsg && (
                    <div style={{ marginTop: 8, fontSize: '0.78rem', fontWeight: 700, color: scanMsg.startsWith('✓') ? '#14805a' : '#dc2626' }}>
                      {scanMsg}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label>الاسم حسب جواز السفر <span className="req">*</span></label>
                  <input
                    className={`input ${nameError ? 'input-error' : ''} ${name && !nameError ? 'input-valid' : ''}`}
                    value={name}
                    onChange={e => { setName(e.target.value); validateName(e.target.value); }}
                    placeholder="الاسم الكامل حسب جواز السفر"
                    dir="ltr"
                  />
                  {nameError && <span className="field-error">{nameError}</span>}
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>رقم جواز السفر <span className="req">*</span></label>
                    <input
                      className={`input ltr ${passportError ? 'input-error' : ''} ${passport && !passportError ? 'input-valid' : ''}`}
                      value={passport}
                      onChange={e => handlePassportChange(e.target.value)}
                      placeholder="مثال: AB12345"
                      dir="ltr"
                      style={{ letterSpacing: 1 }}
                    />
                    {passportError ? <span className="field-error">{passportError}</span> : <span className="field-hint">{passport.length}/7 — حروف إنجليزية ثم أرقام</span>}
                  </div>
                  <div className="field">
                    <label>تاريخ انتهاء الجواز <span className="req">*</span></label>
                    <SmartDatePicker
                      value={expiry}
                      onChange={v => { setExpiry(v); setExpiryError(''); }}
                      min={today}
                      placeholder="اختر تاريخ الانتهاء"
                      quickButtons={[
                        { label: '+ ٥ سنوات', offsetYears: 5 },
                        { label: '+ ١٠ سنوات', offsetYears: 10 },
                      ]}
                    />
                    {expiryError && <span className="field-error">{expiryError}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>رقم الهوية الوطنية <span className="req">*</span></label>
                    <input
                      className={`input ltr ${nationalIdError ? 'input-error' : ''} ${nationalId.length === 10 ? 'input-valid' : ''}`}
                      value={nationalId}
                      onChange={e => handleNationalId(e.target.value)}
                      placeholder="١٠ أرقام"
                      dir="ltr"
                      inputMode="numeric"
                      style={{ letterSpacing: 1 }}
                    />
                    {nationalIdError ? <span className="field-error">{nationalIdError}</span> : <span className="field-hint">{nationalId.length}/10 أرقام</span>}
                  </div>
                  <div className="field">
                    <label>رقم الجوال <span className="req">*</span></label>
                    <div className="mobile-wrap">
                      <div className="mobile-prefix">{mobilePrefix}</div>
                      <input
                        className={`input mobile-input ${mobileError ? 'input-error' : ''} ${mobileSuffix.length === 9 ? 'input-valid' : ''}`}
                        value={mobileSuffix}
                        onChange={e => handleMobileSuffix(e.target.value)}
                        placeholder="٥٠١٢٣٤٥٦٧"
                        inputMode="numeric"
                      />
                    </div>
                    {mobileError ? <span className="field-error">{mobileError}</span> : <span className="field-hint">{mobileSuffix.length}/9 أرقام</span>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-section" style={{ gap: 18 }}>
                <div className="form-row">
                  <div className="field">
                    <label>تاريخ الميلاد <span className="req">*</span></label>
                    <SmartDatePicker
                      value={birthDate}
                      onChange={v => { setBirthDate(v); setBirthDateError(''); }}
                      max={maxBirthStr}
                      placeholder="اختر تاريخ الميلاد"
                      quickButtons={[
                        { label: '٢٥ سنة', offsetYears: -25 },
                        { label: '٣٠ سنة', offsetYears: -30 },
                        { label: '٤٠ سنة', offsetYears: -40 },
                      ]}
                    />
                    {birthDateError ? <span className="field-error">{birthDateError}</span> : <span className="field-hint">يجب أن لا يقل العمر عن ١٥ سنة</span>}
                  </div>
                  <div className="field">
                    <label>رقم الآيبان البنكي <span className="req">*</span></label>
                    <input
                      className={`input ltr ${ibanError ? 'input-error' : ''} ${iban.length === 24 && /^SA\d{22}$/.test(iban) ? 'input-valid' : ''}`}
                      value={iban}
                      onChange={e => handleIban(e.target.value)}
                      placeholder="SA0380000000608010167519"
                      dir="ltr"
                      style={{ letterSpacing: 1 }}
                    />
                    {ibanError ? <span className="field-error">{ibanError}</span> : <span className="field-hint">{iban.length}/24 — SA + 22 رقم</span>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-section" style={{ gap: 18 }}>
                <div className="form-row">
                  <UploadField
                    label="صورة جواز السفر"
                    value={passportFile}
                    onChange={handlePassportFile}
                    hasError={!!passportFileError}
                  />
                  <UploadField
                    label="صورة الهوية الوطنية"
                    value={nationalIdFile}
                    onChange={handleNationalIdFile}
                    hasError={!!nationalIdFileError}
                  />
                </div>
                {(passportFileError || nationalIdFileError) && (
                  <div style={{ display: 'flex', gap: 14, fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 800 }}>
                    {passportFileError && <span>{passportFileError}</span>}
                    {nationalIdFileError && <span>{nationalIdFileError}</span>}
                  </div>
                )}
              </div>
            )}

          </div>

          {error ? <div className="form-error-bar">{error}</div> : null}

          <div className="wizard-nav">
            {step > 1 ? (
              <button type="button" className="secondary-btn" onClick={goBack}>
                السابق
              </button>
            ) : <div />}
            {step < 3 ? (
              <button type="button" className="primary-btn" onClick={goNext}>
                التالي
              </button>
            ) : (
              <button className="primary-btn" type="submit" disabled={loading} style={{ width: 'auto' }}>
                {loading ? (
                  <span className="btn-loading">
                    <svg className="spinner" viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    جاري الإرسال...
                  </span>
                ) : 'إرسال البيانات'}
              </button>
            )}
          </div>

          <p className="form-footer-note">
            جميع البيانات مشفرة ومحمية — تستخدم لأغراض التأمين الطبي فقط
          </p>
        </form>
      </div>
    </div>
  );
}
