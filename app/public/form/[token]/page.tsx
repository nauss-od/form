'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
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

interface CourseInfo {
  activityName: string;
  startDate: string | null;
  endDate: string | null;
  venue: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
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
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [courseError, setCourseError] = useState('');
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    fetch(`/api/public/form/${params.token}`)
      .then(r => r.json())
      .then(d => {
        if (d.message) setCourseError(d.message);
        else setCourseInfo(d);
      })
      .catch(() => {});
  }, [params.token]);

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

  function handleNameChange(raw: string) {
    const hasArabic = /[؀-ۿ]/.test(raw);
    const clean = raw.replace(/[؀-ۿ]/g, '');
    setName(clean);
    if (hasArabic) {
      setNameError('يُدخَل الاسم بالإنجليزية فقط كما هو مكتوب في الجواز — الأحرف العربية غير مقبولة');
      return;
    }
    if (!clean) { setNameError(''); return; }
    if (!/^[A-Za-z .'-]+$/.test(clean)) setNameError('أحرف إنجليزية فقط');
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
    if (file && !file.type.startsWith('image/')) {
      setPassportFileError('يُقبل الصور فقط — التقط صورة للجواز من شاشة جوالك وارفقها مباشرةً، لا يتطلب ملف PDF');
      return;
    }
    setPassportFile(file);
    validateAttachment(file, setPassportFileError);
  }

  function handleNationalIdFile(file: File | null) {
    if (file && !file.type.startsWith('image/')) {
      setNationalIdFileError('يُقبل الصور فقط — التقط صورة للهوية من شاشة جوالك وارفقها مباشرةً، لا يتطلب ملف PDF');
      return;
    }
    setNationalIdFile(file);
    validateAttachment(file, setNationalIdFileError);
  }

  async function handleScanPassport(file: File) {
    setScanning(true);
    setScanMsg('جاري تحليل صورة الجواز...');
    try {
      const { createWorker } = await import('tesseract.js');
      setScanMsg('جاري قراءة البيانات...');
      const worker = await createWorker('eng', 1, { logger: () => {} });
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
        tessedit_pageseg_mode: '6',
      } as Record<string, string>);

      // Normalize EXIF orientation first, then try MRZ crop at 4 rotations
      const normalizedBlob = await normalizeImageOrientation(file);
      const rotations = [0, 90, 270, 180]; // most likely first
      let bestResult: ReturnType<typeof parseMRZ> = {};

      for (const rot of rotations) {
        setScanMsg(`جاري القراءة... (زاوية ${rot}°)`);
        const blob = await cropMRZZone(normalizedBlob, rot);
        const { data: { text } } = await worker.recognize(blob);
        const d = parseMRZ(text);
        // Score: prefer result with both name and passport number
        const score = (d.passportNumber ? 2 : 0) + (d.fullNamePassport ? 1 : 0) + (d.birthDate ? 1 : 0);
        const bestScore = (bestResult.passportNumber ? 2 : 0) + (bestResult.fullNamePassport ? 1 : 0) + (bestResult.birthDate ? 1 : 0);
        if (score > bestScore) bestResult = d;
        if (d.passportNumber && d.fullNamePassport) break; // good enough
      }

      await worker.terminate();

      if (!bestResult.passportNumber && !bestResult.fullNamePassport) {
        setScanMsg('تعذّر قراءة الجواز — تأكد من وضوح الصورة وأن تشمل المنطقة السفلية (MRZ)');
        return;
      }

      if (bestResult.fullNamePassport) { setName(bestResult.fullNamePassport); setNameError(''); }
      if (bestResult.passportNumber) { setPassport(bestResult.passportNumber.slice(0, 7)); setPassportError(''); }
      if (bestResult.birthDate) { setBirthDate(bestResult.birthDate); setBirthDateError(''); }
      if (bestResult.passportExpiry) { setExpiry(bestResult.passportExpiry); setExpiryError(''); }
      setPassportFile(file);
      setPassportFileError('');
      setScanMsg('✓ تم استخراج البيانات — راجع الحقول وأكمل المعلومات الناقصة');
    } catch {
      setScanMsg('حدث خطأ في المسح — حاول مرة أخرى');
    } finally {
      setScanning(false);
    }
  }

  // Read EXIF orientation tag from JPEG and return the orientation value (1–8)
  function readExifOrientation(file: File): Promise<number> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const buf = e.target?.result as ArrayBuffer;
          const view = new DataView(buf);
          if (view.getUint16(0, false) !== 0xFFD8) { resolve(1); return; }
          let offset = 2;
          while (offset < view.byteLength - 2) {
            const marker = view.getUint16(offset, false);
            offset += 2;
            if (marker === 0xFFE1) {
              if (view.getUint32(offset + 2, false) !== 0x45786966) { resolve(1); return; }
              const little = view.getUint16(offset + 8, false) === 0x4949;
              const ifdOffset = offset + 8 + view.getUint32(offset + 12, little);
              const tags = view.getUint16(ifdOffset, little);
              for (let i = 0; i < tags; i++) {
                if (view.getUint16(ifdOffset + 2 + i * 12, little) === 0x0112) {
                  resolve(view.getUint16(ifdOffset + 2 + i * 12 + 8, little));
                  return;
                }
              }
              resolve(1); return;
            } else if ((marker & 0xFF00) !== 0xFF00) break;
            else offset += view.getUint16(offset, false);
          }
        } catch { /* ignore */ }
        resolve(1);
      };
      reader.onerror = () => resolve(1);
      reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
    });
  }

  // Draw image on canvas applying EXIF orientation correction, return normalized blob
  function normalizeImageOrientation(file: File): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      const orientation = await readExifOrientation(file);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const o = orientation;
        // Rotated 90 or 270 → swap width/height
        const swapped = o >= 5 && o <= 8;
        const w = swapped ? img.height : img.width;
        const h = swapped ? img.width : img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        // Apply transform based on EXIF orientation
        if      (o === 2) { ctx.transform(-1, 0, 0, 1, w, 0); }
        else if (o === 3) { ctx.transform(-1, 0, 0, -1, w, h); }
        else if (o === 4) { ctx.transform(1, 0, 0, -1, 0, h); }
        else if (o === 5) { ctx.transform(0, 1, 1, 0, 0, 0); }
        else if (o === 6) { ctx.transform(0, 1, -1, 0, h, 0); }
        else if (o === 7) { ctx.transform(0, -1, -1, 0, h, w); }
        else if (o === 8) { ctx.transform(0, -1, 1, 0, 0, w); }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(b => b ? resolve(b) : resolve(file), 'image/jpeg', 0.96);
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  }

  // Crop MRZ zone from a (already orientation-normalized) blob, with optional extra rotation
  function cropMRZZone(blob: Blob, extraRotation = 0): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const rad = (extraRotation * Math.PI) / 180;
        const swapped = extraRotation === 90 || extraRotation === 270;
        const srcW = img.width, srcH = img.height;
        // After rotation, which dimension is width/height?
        const rotW = swapped ? srcH : srcW;
        const rotH = swapped ? srcW : srcH;
        // We want bottom 25% of the rotated image (where MRZ lives)
        const cropH = Math.floor(rotH * 0.28);
        const canvas = document.createElement('canvas');
        canvas.width = rotW; canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas')); return; }
        ctx.filter = 'contrast(1.5) grayscale(1) brightness(1.05)';
        // Translate so we draw only the bottom cropH rows of the rotated image
        ctx.save();
        if (extraRotation === 0) {
          ctx.drawImage(img, 0, srcH - cropH, srcW, cropH, 0, 0, srcW, cropH);
        } else if (extraRotation === 90) {
          // Rotate 90 CW: new bottom = left side of original
          ctx.translate(rotW / 2, cropH / 2);
          ctx.rotate(rad);
          ctx.drawImage(img, srcW - cropH, -srcH / 2, cropH, srcH, 0, 0, cropH, srcH);
          ctx.restore();
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', 0.95);
          return;
        } else if (extraRotation === 270) {
          ctx.translate(rotW / 2, cropH / 2);
          ctx.rotate(rad);
          ctx.drawImage(img, 0, -srcH / 2, cropH, srcH, 0, 0, cropH, srcH);
          ctx.restore();
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', 0.95);
          return;
        } else if (extraRotation === 180) {
          ctx.translate(rotW / 2, cropH / 2);
          ctx.rotate(rad);
          ctx.drawImage(img, -srcW / 2, -(srcH - cropH / 2), srcW, srcH);
          ctx.restore();
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', 0.95);
          return;
        }
        ctx.restore();
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
      else if (/[؀-ۿ]/.test(name)) { setNameError('يُدخَل الاسم بالإنجليزية فقط — الأحرف العربية غير مقبولة'); ok = false; }
      else if (!/^[A-Za-z\s.\-']+$/.test(name)) { setNameError('أحرف إنجليزية فقط'); ok = false; }
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
    else if (/[؀-ۿ]/.test(name)) { setNameError('يُدخَل الاسم بالإنجليزية فقط — الأحرف العربية غير مقبولة'); hasError = true; }
    else if (!/^[A-Za-z\s.\-']+$/.test(name)) { setNameError('أحرف إنجليزية فقط'); hasError = true; }
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

  if (courseError) {
    return (
      <div className="public-page">
        <div className="public-card" style={{ textAlign: 'center', padding: '56px 40px', maxWidth: 480 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#dc2626', marginBottom: 8, fontSize: '1.2rem', fontWeight: 900 }}>{courseError}</h2>
        </div>
      </div>
    );
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

      {/* ── Course confirmation warning — shown once on open ── */}
      {showWarning && courseInfo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 420, width: '100%',
            padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(234,179,8,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ca8a04" strokeWidth="1.8" fill="rgba(234,179,8,0.15)" strokeLinejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 style={{ color: '#014948', fontSize: '1.1rem', fontWeight: 900, marginBottom: 10 }}>
              تأكّد قبل التعبئة
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.9, marginBottom: 20 }}>
              هذا النموذج مخصص لدورة
            </p>
            <div style={{ background: 'linear-gradient(135deg,#f0faf9,#e6f4f3)', border: '1.5px solid #b2d8d7', borderRadius: 12, padding: '14px 18px', marginBottom: 22 }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#014948', marginBottom: 6 }}>
                {courseInfo.activityName}
              </div>
              {(courseInfo.startDate || courseInfo.endDate) && (
                <div style={{ fontSize: '0.82rem', color: '#4a7c7b', fontWeight: 700 }}>
                  {formatDate(courseInfo.startDate)}{courseInfo.endDate && courseInfo.endDate !== courseInfo.startDate ? ` — ${formatDate(courseInfo.endDate)}` : ''}
                </div>
              )}
              {courseInfo.venue && (
                <div style={{ fontSize: '0.78rem', color: '#6b9999', marginTop: 4 }}>{courseInfo.venue}</div>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 700, marginBottom: 20 }}>
              إذا لم تكن من المشاركين في هذه الدورة، أغلق هذه الصفحة.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                width: '100%', padding: '13px', borderRadius: 12,
                background: '#014948', color: '#fff', border: 'none',
                fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
              }}
            >
              نعم، أنا من المشاركين — متابعة
            </button>
          </div>
        </div>
      )}

      <div className="public-card">
        <div className="form-header">
          <img src="/images/nauss-logo-gold.png" alt="NAUSS" className="form-logo" />
          <h2>نموذج تأمين المشاركين</h2>
          <p>يرجى تعبئة البيانات بدقة حسب جواز السفر — جامعة نايف العربية للعلوم الأمنية</p>
        </div>

        {/* Course info banner */}
        {courseInfo && (
          <div style={{
            background: 'linear-gradient(135deg,#014948,#016564)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 16,
            color: '#fff',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>
              الدورة التدريبية
            </div>
            <div style={{ fontWeight: 900, fontSize: '0.96rem', marginBottom: courseInfo.startDate ? 6 : 0 }}>
              {courseInfo.activityName}
            </div>
            {(courseInfo.startDate || courseInfo.venue) && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>
                {courseInfo.startDate && (
                  <span>
                    📅 {formatDate(courseInfo.startDate)}
                    {courseInfo.endDate && courseInfo.endDate !== courseInfo.startDate ? ` — ${formatDate(courseInfo.endDate)}` : ''}
                  </span>
                )}
                {courseInfo.venue && <span>📍 {courseInfo.venue}</span>}
              </div>
            )}
          </div>
        )}

        {/* Privacy notice */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'linear-gradient(135deg,#f0faf9,#e6f4f3)',
          border: '1.5px solid #b2d8d7', borderRadius: 12,
          padding: '12px 14px', marginBottom: 20,
        }}>
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#016564" strokeWidth="1.6" fill="rgba(1,101,100,0.08)" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#016564" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#014948', marginBottom: 3 }}>
              جميع البيانات مشفرة ومحمية
            </div>
            <div style={{ fontSize: '0.76rem', color: '#4a7c7b', lineHeight: 1.7 }}>
              تُستخدم لأغراض إصدار تأمين طبي دولي للمشاركين فقط، ولا تُشارَك مع أي جهة أخرى.
            </div>
          </div>
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
                  {/* camera — opens native camera */}
                  <input ref={scanInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleScanPassport(f); e.target.value = ''; }} />
                  {/* gallery — opens photo library without capture */}
                  <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleScanPassport(f); e.target.value = ''; }} />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => scanInputRef.current?.click()} disabled={scanning}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, background: '#014948', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
                      {scanning ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <ScanIcon />}
                      {scanning ? 'جاري المسح...' : 'تصوير الجواز'}
                    </button>
                    <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={scanning}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, background: 'rgba(1,73,72,0.12)', color: '#014948', border: '1.5px solid #b2d8d7', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
                      <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      رفع من المعرض
                    </button>
                  </div>
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
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="Full name as in passport (English only)"
                    dir="ltr"
                    lang="en"
                  />
                  {nameError
                    ? <span className="field-error">{nameError}</span>
                    : <span className="field-hint">English letters only — as written in the passport</span>
                  }
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
