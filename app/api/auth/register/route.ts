import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { name, email, password, mobile, extension } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ message: 'الاسم والبريد وكلمة المرور مطلوبة' }, { status: 400 });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ message: 'البريد مستخدم مسبقاً' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(String(password)),
      mobile: mobile ? String(mobile).trim() : null,
      extension: extension ? String(extension).trim() : null,
    }
  });

  setSessionCookie({ userId: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ success: true });
}
