import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 20px',
      textAlign: 'center',
      background: '#f4f8f8',
      fontFamily: "'Cairo', sans-serif",
    }}>
      <div style={{
        background: 'white',
        borderRadius: 30,
        padding: '60px 48px',
        boxShadow: '0 30px 86px rgba(6,26,26,0.10)',
        maxWidth: 480,
        width: '100%',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(1,101,100,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
            <circle cx="20" cy="20" r="18" stroke="#016564" strokeWidth="2" fill="none" opacity="0.3"/>
            <path d="M20 12v10m0 4v.01" stroke="#016564" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 8l-4-4m20 4l4-4" stroke="#016564" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          </svg>
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#163434',
          margin: '0 0 8px',
        }}>
          الصفحة غير موجودة
        </h1>
        <p style={{
          fontSize: 15,
          color: '#738484',
          lineHeight: 1.7,
          margin: '0 0 32px',
        }}>
          الرابط الذي تحاول الوصول إليه غير صالح أو منتهي الصلاحية.
          يرجى التأكد من الرابط أو التواصل مع مدير الدورة.
        </p>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 28px',
          background: '#016564',
          color: 'white',
          borderRadius: 40,
          fontSize: 15,
          fontWeight: 700,
          textDecoration: 'none',
        }}>
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18" style={{ transform: 'rotate(180deg)' }}>
            <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
