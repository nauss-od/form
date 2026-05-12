import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session || session.role !== 'MANAGER') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const { password } = await request.json();
  if (!password || password.length < 6) {
    return NextResponse.json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: params.id },
    data: { passwordHash }
  });

  await logAudit({
    userId: session.userId,
    action: 'RESET_PASSWORD',
    entityType: 'User',
    entityId: params.id
  });

  return NextResponse.json({ success: true });
}
