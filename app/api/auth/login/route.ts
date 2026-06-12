import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

// Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'محاولات كثيرة، حاول بعد 15 دقيقة' },
        { status: 429, headers: { 'Retry-After': '900' } },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body?.email || !body?.password) {
      return NextResponse.json({ message: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(body.email).toLowerCase().trim() },
    });
    if (!user || !user.isActive) {
      return NextResponse.json({ message: 'بيانات الدخول غير صحيحة أو الحساب معطل' }, { status: 401 });
    }

    const matches = await comparePassword(String(body.password), user.passwordHash);
    if (!matches) {
      return NextResponse.json({ message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    setSessionCookie({ userId: user.id, name: user.name, email: user.email, role: user.role });
    await logAudit({ userId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
  }
}
