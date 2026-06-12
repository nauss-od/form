'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

type UserInfo = { id: string; name: string; email: string; mobile: string | null; extension: string | null; role: string };

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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
      setUser(prev => prev ? { ...prev, name, mobile: mobile || null, extension: extension || null } : prev);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'حدث خطأ');
      setMsgType('err');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <AppShell title="الملف الشخصي"><div className="loading-wrap"><div className="loading-spinner" /><p>جاري التحميل...</p></div></AppShell>;

  return (
    <AppShell title="الملف الشخصي" role={user.role}>
      <div className="section-card" style={{ maxWidth: 520 }}>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--nauss-line)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #016564, #014948)',
            display: 'grid', placeItems: 'center',
            color: '#fff', fontSize: '1.4rem', fontWeight: 900, flexShrink: 0,
          }}>
            {initials(user.name)}
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--nauss-ink)' }}>{user.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--nauss-muted)', direction: 'ltr', textAlign: 'right' }}>{user.email}</div>
            <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800, background: user.role === 'MANAGER' ? 'rgba(208,178,132,0.2)' : 'rgba(1,101,100,0.08)', color: user.role === 'MANAGER' ? '#8a6a39' : '#016564' }}>
              {user.role === 'MANAGER' ? 'مدير' : 'موظف'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* Basic info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--nauss-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>المعلومات الأساسية</div>
            <div className="field">
              <label>الاسم الكامل</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>البريد الإلكتروني</label>
              <input className="input" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed', direction: 'ltr', textAlign: 'right' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="field">
                <label>رقم الجوال</label>
                <input className="input" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="05XXXXXXXX" dir="ltr" style={{ textAlign: 'right' }} />
              </div>
              <div className="field">
                <label>الرقم الداخلي</label>
                <input className="input" value={extension} onChange={e => setExtension(e.target.value)} placeholder="مثال: 1234" dir="ltr" style={{ textAlign: 'right' }} />
              </div>
            </div>
          </div>

          {/* Password section */}
          <div style={{ paddingTop: 20, borderTop: '1px solid var(--nauss-line)', marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--nauss-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>تغيير كلمة المرور</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>كلمة المرور الجديدة</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="اتركه فارغاً إن لم ترد التغيير" />
              </div>
              <div className="field">
                <label>تأكيد كلمة المرور</label>
                <input className="input" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="أعد كتابة كلمة المرور" />
              </div>
            </div>
          </div>

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontWeight: 700, fontSize: '0.82rem', background: msgType === 'ok' ? '#f0fdf4' : '#fef2f2', color: msgType === 'ok' ? '#014f4d' : '#dc2626' }}>
              {msg}
            </div>
          )}

          <button className="primary-btn" type="submit" disabled={saving} style={{ width: 'auto', padding: '0 28px' }}>
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
