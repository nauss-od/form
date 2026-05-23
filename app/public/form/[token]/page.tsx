'use client';

import { FormEvent, useState } from 'react';
import SmartDatePicker from '@/components/SmartDatePicker';

export default function PublicFormPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
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

  function validatePassport(v: string) {
    if (!v) { setPassportError(''); return; }
    const upper = v.toUpperCase();
    setPassport(upper);
    if (!/^[A-Z]/.test(upper)) setPassportError('يبدأ بحروف إنجليزية');
    else if (!/^[A-Z]{1,3}\d{1,6}$/.test(upper)) setPassportError('حروف ثم أرقام فقط');
    else if (upper.length > 7) setPassportError('حد أقصى 7 خانات');
    else setPassportError('');
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

    // Validate all
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
        <div className="public-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#014f4d', marginBottom: 8 }}>تم استلام بياناتك بنجاح</h2>
          <p style={{ color: '#64748b' }}>شكراً لك، تم إرسال بياناتك. سيتم التواصل معك عند الحاجة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page" style={{ background: 'linear-gradient(180deg, #f0f7f7 0%, #f8fbfb 100%)' }}>
      <div className="public-card" style={{ maxWidth: 760, borderRadius: 28, padding: 0, overflow: 'hidden', boxShadow: '0 30px 80px rgba(6,26,26,0.08)' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #016564, #014948)',
          padding: '32px 32px 28px',
          color: '#fff'
        }}>
          <img src="/images/nauss-logo-gold.png" alt="NAUSS" style={{ height: 44, marginBottom: 16 }} />
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.3rem' }}>نموذج تأمين المشاركين</h2>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.76)', fontSize: '0.85rem' }}>يرجى تعبئة البيانات بدقة حسب جواز السفر — جامعة نايف العربية للعلوم الأمنية</p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ padding: 28 }}>
          {/* Section: Identity */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#016564', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800 }}>١</span>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#014948' }}>البيانات الشخصية</h3>
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>الاسم حسب جواز السفر <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                className={`input ${nameError ? 'input-error' : ''}`}
                value={name}
                onChange={e => { setName(e.target.value); validateName(e.target.value); }}
                placeholder="Full name as in passport"
                dir="ltr"
                style={{ fontFamily: 'monospace' }}
              />
              {nameError && <span className="field-error">{nameError}</span>}
            </div>

            <div className="grid-2" style={{ gap: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
              <div className="field">
                <label>رقم جواز السفر <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className={`input ${passportError ? 'input-error' : ''} ${passport && !passportError ? 'input-valid' : ''}`}
                  value={passport}
                  onChange={e => handlePassportChange(e.target.value)}
                  placeholder="مثال: AB12345"
                  dir="ltr"
                  style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                />
                {passportError && <span className="field-error">{passportError}</span>}
                <span className="field-hint">{passport.length}/7 — حروف إنجليزية ثم أرقام</span>
              </div>
              <div className="field">
                <label>تاريخ انتهاء الجواز <span style={{ color: '#dc2626' }}>*</span></label>
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

            <div className="grid-2" style={{ gap: 12, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <label>رقم الهوية الوطنية <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className={`input ${nationalIdError ? 'input-error' : ''} ${nationalId.length === 10 ? 'input-valid' : ''}`}
                  value={nationalId}
                  onChange={e => handleNationalId(e.target.value)}
                  placeholder="١٠ أرقام"
                  dir="ltr"
                  style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                  inputMode="numeric"
                />
                {nationalIdError && <span className="field-error">{nationalIdError}</span>}
                <span className="field-hint">{nationalId.length}/10 أرقام</span>
              </div>
              <div className="field">
                <label>رقم الجوال <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                  <div style={{
                    background: 'linear-gradient(180deg, #f0f7f7, #e8f0f0)',
                    border: '1px solid var(--nauss-line)',
                    borderLeft: 0,
                    borderRadius: '18px 0 0 18px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#014948',
                    minHeight: 56,
                    whiteSpace: 'nowrap',
                    direction: 'ltr',
                  }}>{mobilePrefix}</div>
                  <input
                    className={`input ${mobileError ? 'input-error' : ''} ${mobileSuffix.length === 9 ? 'input-valid' : ''}`}
                    style={{ borderRadius: '0 18px 18px 0', fontFamily: 'monospace', letterSpacing: 1, direction: 'ltr' }}
                    value={mobileSuffix}
                    onChange={e => handleMobileSuffix(e.target.value)}
                    placeholder="٥٠١٢٣٤٥٦٧"
                    inputMode="numeric"
                  />
                </div>
                {mobileError && <span className="field-error">{mobileError}</span>}
                <span className="field-hint">{mobileSuffix.length}/9 أرقام</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--nauss-line)', margin: '20px 0' }} />

          {/* Section: Dates & Bank */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#016564', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800 }}>٢</span>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#014948' }}>معلومات إضافية</h3>
            </div>

            <div className="grid-2" style={{ gap: 12, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <label>تاريخ الميلاد <span style={{ color: '#dc2626' }}>*</span></label>
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
                {birthDateError && <span className="field-error">{birthDateError}</span>}
                <span className="field-hint">يجب أن لا يقل العمر عن ١٥ سنة</span>
              </div>
              <div className="field">
                <label>رقم الآيبان البنكي <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className={`input ${ibanError ? 'input-error' : ''} ${iban.length === 24 && /^SA\d{22}$/.test(iban) ? 'input-valid' : ''}`}
                  value={iban}
                  onChange={e => handleIban(e.target.value)}
                  placeholder="SA0380000000608010167519"
                  dir="ltr"
                  style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                />
                {ibanError && <span className="field-error">{ibanError}</span>}
                <span className="field-hint">{iban.length}/24 — SA + 22 رقم</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--nauss-line)', margin: '20px 0' }} />

          {/* Section: Files */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#016564', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800 }}>٣</span>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#014948' }}>المرفقات</h3>
            </div>

            <div className="grid-2" style={{ gap: 12, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <label>صورة جواز السفر <span style={{ color: '#dc2626' }}>*</span></label>
                <div className={`upload-zone ${passportFile ? 'has-file' : ''}`}>
                  <input type="file" accept="image/*,application/pdf" onChange={e => setPassportFile(e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  {passportFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📄</span>
                      <span style={{ fontSize: '0.82rem', color: '#014948', fontWeight: 600 }}>{passportFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>📤</div>
                      <span style={{ fontSize: '0.82rem' }}>اضغط لرفع الصورة</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="field">
                <label>صورة الهوية الوطنية <span style={{ color: '#dc2626' }}>*</span></label>
                <div className={`upload-zone ${nationalIdFile ? 'has-file' : ''}`}>
                  <input type="file" accept="image/*,application/pdf" onChange={e => setNationalIdFile(e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  {nationalIdFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📄</span>
                      <span style={{ fontSize: '0.82rem', color: '#014948', fontWeight: 600 }}>{nationalIdFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>📤</div>
                      <span style={{ fontSize: '0.82rem' }}>اضغط لرفع الصورة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, minHeight: 56, fontSize: '1.05rem' }}>
            {loading ? 'جاري الإرسال...' : 'إرسال البيانات'}
          </button>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: 16 }}>
            جميع البيانات مشفرة ومحمية — تستخدم لأغراض التأمين الطبي فقط
          </p>
        </form>
      </div>
    </div>
  );
}
