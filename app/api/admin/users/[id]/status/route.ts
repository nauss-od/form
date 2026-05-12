import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session || session.role !== 'MANAGER') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const { isActive } = await request.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { isActive: Boolean(isActive) },
    select: { id: true, name: true, email: true, isActive: true }
  });

  await logAudit({
    userId: session.userId,
    action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    entityType: 'User',
    entityId: params.id,
    meta: { isActive: Boolean(isActive) }
  });

  return NextResponse.json({ user });
}
