import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ message: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user || !user.isActive) {
    return NextResponse.json({ message: 'بيانات الدخول غير صحيحة أو الحساب معطل' }, { status: 401 });
  }

  const matches = await comparePassword(String(password), user.passwordHash);
  if (!matches) {
    return NextResponse.json({ message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  setSessionCookie({ userId: user.id, name: user.name, email: user.email, role: user.role });

  return NextResponse.json({ success: true });
}
