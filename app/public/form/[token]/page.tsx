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
  const cameraRef = useRef<HTMLInputElement>(null);

  return (
    <div className="field">
      <label>{label} <span className="req">*</span></label>
      <div className="upload-stack">
        <div className={`upload-zone ${value ? 'has-file' : ''} ${hasError ? 'upload-error' : ''}`}>
          <input type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0] || null)} />
          {value ? (
            <div className="upload-file-info">
              <FileIcon />
              <span className="upload-file-name">{value.name}</span>
            </div>
          ) : (
            <div className="upload-empty">
              <UploadIcon />
              <span>اضغط لاختيار ملف</span>
            </div>
          )}
        </div>
        <button type="button" className="upload-camera-btn" onClick={() => cameraRef.current?.click()}>
          <CameraIcon />
          <span>تصوير</span>
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e => onChange(e.target.files?.[0] || null)} style={{ display: 'none' }} />
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
    setScanMsg('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/public/scan-passport', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setScanMsg(data.message || 'تعذّر المسح'); return; }
      const d = data.data;
      if (d.fullNamePassport) { setName(d.fullNamePassport); setNameError(''); }
      if (d.passportNumber) { setPassport(d.passportNumber.toUpperCase().slice(0, 7)); setPassportError(''); }
      if (d.birthDate) { setBirthDate(d.birthDate); setBirthDateError(''); }
      if (d.passportExpiry) { setExpiry(d.passportExpiry); setExpiryError(''); }
      // Use the scanned image as passport file attachment
      setPassportFile(file);
      setPassportFileError('');
      setScanMsg('✓ تم استخراج البيانات — راجع الحقول وأكمل المعلومات الناقصة');
    } catch {
      setScanMsg('حدث خطأ في المسح');
    } finally {
      setScanning(false);
    }
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
                    صوّر جواز سفرك وسيتم استخراج البيانات تلقائياً — ستبقى صورة الجواز كمرفق
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
