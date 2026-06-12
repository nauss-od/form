import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, mobile: true, extension: true, role: true },
  });
  if (!user) return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  try {
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const data: Record<string, string> = {};

    if (body.name && typeof body.name === 'string') data.name = body.name.trim();
    if (body.mobile !== undefined) data.mobile = String(body.mobile).trim();
    if (body.extension !== undefined) data.extension = String(body.extension).trim();
    if (body.password && typeof body.password === 'string') data.passwordHash = await hashPassword(body.password);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: 'لا توجد تغييرات' }, { status: 400 });
    }

    await prisma.user.update({ where: { id: session.userId }, data });
    return NextResponse.json({ success: true, message: 'تم حفظ التعديلات' });
  } catch (err) {
    console.error('Account update error:', err);
    return NextResponse.json({ message: 'حدث خطأ أثناء حفظ التعديلات' }, { status: 500 });
  }
}
