import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return (
    <div className="login-shell">
      <div className="login-brand">
        <div>
          <h1 style={{ fontSize: 38, margin: 0 }}>منصة إدارة طلبات التأمين الطبي</h1>
          <p style={{ opacity: 0.9, fontSize: 18 }}>نسخة ويب مؤسسية مرتبطة بقاعدة بيانات</p>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <LoginForm />
      </div>
    </div>
  );
}
