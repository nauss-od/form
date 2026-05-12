import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { name: true } },
      submissions: {
        include: { files: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  return NextResponse.json(course);
}
