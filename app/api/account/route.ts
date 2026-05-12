import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const { name, password } = await request.json();
  const data: Record<string, string> = {};

  if (name && typeof name === 'string') data.name = name;
  if (password && typeof password === 'string') data.passwordHash = await hashPassword(password);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: 'لا توجد تغييرات' }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.userId }, data });

  return NextResponse.json({ success: true, message: 'تم حفظ التعديلات' });
}
