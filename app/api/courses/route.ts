import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePublicToken } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const url = new URL(request.url);
  const stats = url.searchParams.get('stats') === 'true';

  const where = session.role === 'MANAGER' ? {} : { createdByUserId: session.userId };

  if (stats) {
    const totalCourses = await prisma.course.count({ where });
    const totalSubmissions = await prisma.submission.count({
      where: { course: { ...(session.role === 'MANAGER' ? {} : { createdByUserId: session.userId }) } }
    });
    const recentCourses = await prisma.course.findMany({
      where,
      include: { _count: { select: { submissions: true } }, createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    let employees = null;
    if (session.role === 'MANAGER') {
      const users = await prisma.user.findMany({
        where: { role: 'EMPLOYEE', isActive: true },
        select: {
          id: true, name: true, email: true, mobile: true, createdAt: true, lastLoginAt: true,
          _count: { select: { courses: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      employees = await Promise.all(users.map(async (u) => {
        const subCount = await prisma.submission.count({ where: { course: { createdByUserId: u.id } } });
        return { ...u, submissionCount: subCount };
      }));
    }

    return NextResponse.json({ totalCourses, totalSubmissions, completedSubmissions: totalSubmissions, recentCourses, userRole: session.role, employees });
  }

  const courses = await prisma.course.findMany({
    where,
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const formData = await request.formData();
  const activityName = String(formData.get('activityName') || '').trim();
  const venue = String(formData.get('venue') || '').trim();
  const startDate = String(formData.get('startDate') || '');
  const endDate = String(formData.get('endDate') || '');
  const participantCount = formData.get('participantCount') ? Number(formData.get('participantCount')) : null;

  if (!activityName) {
    return NextResponse.json({ message: 'اسم النشاط مطلوب' }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      createdByUserId: session.userId,
      activityName: activityName || null,
      venue: venue || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      participantCount,
      publicToken: generatePublicToken(),
      status: 'PUBLISHED'
    }
  });

  return NextResponse.json({ success: true, course });
}
