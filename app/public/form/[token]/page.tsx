'use client';

import { FormEvent, useState } from 'react';
import SmartDatePicker from '@/components/SmartDatePicker';

function UploadIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="40" height="40" style={{ opacity: 0.5, marginBottom: 6 }}>
      <rect x="4" y="14" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M20 2v20m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function PublicFormPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const maxBirth = new Date();
  maxBirth.setFullYear(maxBirth.getFullYear() - 15);
  const maxBirthStr = maxBirth.toISOString().split('T')[0];

  function validateName(v: string) {
    if (!v) { setNameError(''); return; }
    if (!/^[A-Za-z\s.\-']+$/.test(v)) setNameError('أحرف إنجليزية فقط');
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    let hasError = false;
    if (!name) { setNameError('مطلوب'); hasError = true; }
    if (!passport) { setPassportError('مطلوب'); hasError = true; }
    if (!/\d/.test(passport)) { setPassportError('يحتوي على أرقام'); hasError = true; }
    if (!/^[A-Z]{1,3}\d{1,6}$/.test(passport)) { setPassportError('صيغة غير صحيحة'); hasError = true; }
    if (!expiry) { setExpiryError('مطلوب'); hasError = true; }
    if (expiry && expiry < today) { setExpiryError('لا يمكن أن يكون في الماضي'); hasError = true; }
    if (nationalId.length !== 10) { setNationalIdError('يجب 10 أرقام'); hasError = true; }
    if (mobileSuffix.length !== 9) { setMobileError('يجب 9 أرقام'); hasError = true; }
    if (!birthDate) { setBirthDateError('مطلوب'); hasError = true; }
    if (birthDate && birthDate > maxBirthStr) { setBirthDateError('يجب أن تكون قبل 15 سنة من اليوم'); hasError = true; }
    if (iban.length !== 24 || !/^SA\d{22}$/.test(iban)) { setIbanError('غير صحيح'); hasError = true; }
    if (!passportFile) { hasError = true; }
    if (!nationalIdFile) { hasError = true; }

    if (hasError) { setError('يرجى تصحيح الأخطاء أعلاه'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullNamePassport', name);
      formData.append('passportNumber', passport);
      formData.append('passportExpiry', expiry);
      formData.append('nationalId', nationalId);
      formData.append('mobile', mobilePrefix + mobileSuffix);
      formData.append('birthDate', birthDate);
      formData.append('iban', iban);
      if (passportFile) formData.append('passportFile', passportFile);
      if (nationalIdFile) formData.append('nationalIdFile', nationalIdFile);

      const res = await fetch(`/api/public/form/${params.token}/submit`, { method: 'POST', body: formData });
      const data = await res.json();
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

  return (
    <div className="public-page">
      <div className="public-card">
        <div className="form-header">
          <img src="/images/nauss-logo-gold.png" alt="NAUSS" className="form-logo" />
          <h2>نموذج تأمين المشاركين</h2>
          <p>يرجى تعبئة البيانات بدقة حسب جواز السفر — جامعة نايف العربية للعلوم الأمنية</p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="form-body">

          <div className="form-section">
            <div className="section-step">
              <span className="step-num">1</span>
              <h3>البيانات الشخصية</h3>
            </div>

            <div className="field">
              <label>الاسم حسب جواز السفر <span className="req">*</span></label>
              <input
                className={`input ${nameError ? 'input-error' : ''} ${name && !nameError ? 'input-valid' : ''}`}
                value={name}
                onChange={e => { setName(e.target.value); validateName(e.target.value); }}
                placeholder="Full name as in passport"
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

          <div className="form-divider" />

          <div className="form-section">
            <div className="section-step">
              <span className="step-num">2</span>
              <h3>معلومات إضافية</h3>
            </div>

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

          <div className="form-divider" />

          <div className="form-section">
            <div className="section-step">
              <span className="step-num">3</span>
              <h3>المرفقات</h3>
            </div>

            <div className="form-row">
              <div className="field">
                <label>صورة جواز السفر <span className="req">*</span></label>
                <div className={`upload-zone ${passportFile ? 'has-file' : ''}`}>
                  <input type="file" accept="image/*,application/pdf" onChange={e => setPassportFile(e.target.files?.[0] || null)} />
                  {passportFile ? (
                    <div className="upload-file-info">
                      <FileIcon />
                      <span className="upload-file-name">{passportFile.name}</span>
                    </div>
                  ) : (
                    <div className="upload-empty">
                      <UploadIcon />
                      <span>اضغط لرفع الصورة</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="field">
                <label>صورة الهوية الوطنية <span className="req">*</span></label>
                <div className={`upload-zone ${nationalIdFile ? 'has-file' : ''}`}>
                  <input type="file" accept="image/*,application/pdf" onChange={e => setNationalIdFile(e.target.files?.[0] || null)} />
                  {nationalIdFile ? (
                    <div className="upload-file-info">
                      <FileIcon />
                      <span className="upload-file-name">{nationalIdFile.name}</span>
                    </div>
                  ) : (
                    <div className="upload-empty">
                      <UploadIcon />
                      <span>اضغط لرفع الصورة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error ? <div className="form-error-bar">{error}</div> : null}

          <button className="btn btn-primary submit-btn" type="submit" disabled={loading}>
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

          <p className="form-footer-note">
            جميع البيانات مشفرة ومحمية — تستخدم لأغراض التأمين الطبي فقط
          </p>
        </form>
      </div>
    </div>
  );
}
