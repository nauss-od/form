import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = getCurrentSession();
  if (!session || session.role !== 'MANAGER') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, mobile: true, extension: true,
      role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true,
      _count: { select: { courses: true } }
    }
  });

  const enriched = await Promise.all(users.map(async (u) => {
    const submissionCount = await prisma.submission.count({
      where: { course: { createdByUserId: u.id } }
    });
    return { ...u, submissionCount };
  }));

  return NextResponse.json({ users: enriched });
}
