import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session || session.role !== 'MANAGER') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const { name, email, mobile, extension, role } = await request.json();
  const data: Record<string, string> = {};
  if (typeof name === 'string') data.name = name;
  if (typeof email === 'string') data.email = email.toLowerCase();
  if (typeof mobile === 'string') data.mobile = mobile;
  if (typeof extension === 'string') data.extension = extension;
  if (typeof role === 'string' && ['MANAGER', 'EMPLOYEE'].includes(role)) data.role = role;

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, mobile: true, extension: true, role: true, isActive: true }
  });

  await logAudit({
    userId: session.userId,
    action: 'UPDATE_USER',
    entityType: 'User',
    entityId: params.id,
    meta: { updated: Object.keys(data) }
  });

  return NextResponse.json({ user });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session || session.role !== 'MANAGER') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: params.id } });

  await logAudit({
    userId: session.userId,
    action: 'DELETE_USER',
    entityType: 'User',
    entityId: params.id
  });

  return NextResponse.json({ success: true });
}
