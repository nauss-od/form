'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

type UserInfo = { id: string; name: string; email: string; mobile: string | null; extension: string | null; role: string };

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function AccountPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [extension, setExtension] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    fetch('/api/account')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user);
          setName(d.user.name);
          setMobile(d.user.mobile || '');
          setExtension(d.user.extension || '');
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    if (password && password !== confirmPwd) {
      setMsg('كلمتا المرور غير متطابقتين'); setMsgType('err'); return;
    }
    if (password && password.length < 6) {
      setMsg('كلمة المرور 6 أحرف على الأقل'); setMsgType('err'); return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = { name, mobile, extension };
      if (password) body.password = password;
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'حدث خطأ');
      setMsg('تم حفظ التعديلات بنجاح');
      setMsgType('ok');
      setPassword('');
      setConfirmPwd('');
      setShowPwd(false);
      setUser(prev => prev ? { ...prev, name, mobile: mobile || null, extension: extension || null } : prev);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'حدث خطأ');
      setMsgType('err');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return (
    <AppShell title="الملف الشخصي">
      <div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div>
    </AppShell>
  );

  return (
    <AppShell title="الملف الشخصي" role={user.role}>
      <form onSubmit={handleSave}>

        {/* بطاقة الهوية */}
        <div className="section-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}>

          {/* شريط الهوية العلوي */}
          <div style={{
            background: 'linear-gradient(135deg, #034948 0%, #016564 60%, #0a706e 100%)',
            padding: '28px 32px'
            display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.15)',
              border: '2.5px solid rgba(255,255,255,0.35)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontSize: '1.5rem', fontWeight: 900,
            }}>
              {initials(user.name)}
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', direction: 'ltr', marginTop: 3 }}>{user.email}</div>
              <div style={{
                marginTop: 8, display: 'inline-flex', alignItems: 'center',
                padding: '3px 12px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 800,
                background: user.role === 'MANAGER' ? 'rgba(208,178,132,0.3)' : 'rgba(255,255,255,0.15)',
                color: user.role === 'MANAGER' ? '#e8c87a' : 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {user.role === 'MANAGER' ? 'مدير النظام' : 'موظف'}
              </div>
            </div>
          </div>

          {/* المعلومات الأساسية */}
          <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--nauss-line)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--nauss-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>
              المعلومات الأساسية
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div className="field" style={{ margin: 0 }}>
                <label style={{ marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--nauss-ink)' }}>الاسم الكامل</label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ maxWidth: '100%' }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label style={{ marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--nauss-muted)' }}>البريد الإلكتروني</label>
                <input
                  className="input"
                  value={user.email}
                  disabled
                  style={{ opacity: 0.55, cursor: 'not-allowed', direction: 'ltr', textAlign: 'right', maxWidth: '100%' }}
                />
              </div>

              <div className="account-grid-2">
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--nauss-ink)' }}>رقم الجوال</label>
                  <input
                    className="input"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    style={{ textAlign: 'right', maxWidth: '100%' }}
                  />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--nauss-ink)' }}>الرقم الداخلي</label>
                  <input
                    className="input"
                    value={extension}
                    onChange={e => setExtension(e.target.value)}
                    placeholder="مثال: 1234"
                    dir="ltr"
                    style={{ textAlign: 'right', maxWidth: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* كلمة المرور */}
          <div style={{ padding: '28px 32px' }}>
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                marginBottom: showPwd ? 18 : 0,
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--nauss-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1, textAlign: 'right' }}>
                تغيير كلمة المرور
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nauss-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showPwd ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showPwd && (
              <div className="account-grid-2">
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--nauss-ink)' }}>كلمة المرور الجديدة</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--nauss-ink)' }}>تأكيد كلمة المرور</label>
                  <input
                    className="input"
                    type="password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* رسالة + زر الحفظ */}
        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, fontWeight: 700, fontSize: '0.84rem',
            background: msgType === 'ok' ? '#f0fdf4' : '#fef2f2',
            color: msgType === 'ok' ? '#014f4d' : '#dc2626',
            border: `1px solid ${msgType === 'ok' ? 'rgba(1,79,77,0.15)' : 'rgba(220,38,38,0.15)'}`,
          }}>
            {msg}
          </div>
        )}

        <button
          className="primary-btn"
          type="submit"
          disabled={saving}
          style={{ width: 'auto', padding: '0 36px', minHeight: 48, fontSize: '0.92rem' }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>

      </form>
    </AppShell>
  );
}
