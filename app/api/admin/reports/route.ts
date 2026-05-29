import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = getCurrentSession();
    if (!session || session.role !== 'MANAGER') {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const employeeFilter = employeeId ? { createdByUserId: employeeId } : {};
    const statusFilter = status ? { status: status as 'PUBLISHED' | 'CLOSED' } : {};
    const dateFilter: Record<string, unknown> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const createdAtFilter = from || to ? { createdAt: dateFilter } : {};

    const whereClause = { ...employeeFilter, ...statusFilter, ...createdAtFilter };

    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: {
        id: true, name: true, email: true, mobile: true, createdAt: true, lastLoginAt: true,
        _count: { select: { courses: true } }
      }
    });

    const enriched = await Promise.all(employees.map(async (emp) => {
      const courses = await prisma.course.findMany({
        where: { createdByUserId: emp.id, ...statusFilter, ...createdAtFilter },
        select: {
          id: true, activityName: true, venue: true, startDate: true, endDate: true,
          participantCount: true, status: true, createdAt: true,
          _count: { select: { submissions: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      const totalSubmissions = courses.reduce((s, c) => s + c._count.submissions, 0);
      const activeCourses = courses.filter(c => c.status === 'PUBLISHED').length;
      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        totalCourses: emp._count.courses,
        totalSubmissions,
        activeCourses,
        createdAt: emp.createdAt.toISOString(),
        lastLoginAt: emp.lastLoginAt?.toISOString() || null,
        courses: courses.map(c => ({
          activityName: c.activityName,
          venue: c.venue,
          startDate: c.startDate?.toISOString() || null,
          endDate: c.endDate?.toISOString() || null,
          participantCount: c.participantCount,
          status: c.status,
          submissions: c._count.submissions,
          createdAt: c.createdAt.toISOString()
        }))
      };
    }));

    const allCourses = await prisma.course.findMany({
      where: { ...statusFilter, ...createdAtFilter },
      select: {
        id: true, activityName: true, status: true, createdAt: true, participantCount: true,
        startDate: true, endDate: true,
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const allEmployees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    const totalEmployees = employees.length;
    const totalCourses = allCourses.length;
    const totalSubmissions = allCourses.reduce((s, c) => s + c._count.submissions, 0);
    const totalActive = allCourses.filter(c => c.status === 'PUBLISHED').length;
    const totalClosed = allCourses.filter(c => c.status === 'CLOSED').length;
    const activeRate = totalCourses > 0 ? Math.round((totalActive / totalCourses) * 100) : 0;

    return NextResponse.json({
      enriched,
      allCourses: allCourses.map(c => ({
        activityName: c.activityName,
        status: c.status,
        submissions: c._count.submissions,
        participantCount: c.participantCount,
        startDate: c.startDate?.toISOString() || null,
        endDate: c.endDate?.toISOString() || null,
        createdAt: c.createdAt.toISOString()
      })),
      allEmployees,
      kpis: { totalEmployees, totalCourses, totalSubmissions, totalActive, totalClosed, activeRate }
    });
  } catch (err) {
    console.error('Reports error:', err);
    return NextResponse.json({
      message: 'حدث خطأ في تحميل التقارير',
      error: String(err),
    }, { status: 500 });
  }
}