'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('Nalshahrani@nauss.edu.sa');
  const [password, setPassword] = useState('Zx.321321');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message || 'تعذر تسجيل الدخول');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card login-card">
      <h1 className="page-title" style={{ fontSize: 24 }}>تسجيل الدخول</h1>
      <div className="mb-4">
        <label className="small">البريد الإلكتروني</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </div>
      <div className="mb-4">
        <label className="small">كلمة المرور</label>
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </div>
      {error ? <div className="error">{error}</div> : null}
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={loading}>
        {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
      </button>
    </form>
  );
}
