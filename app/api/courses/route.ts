import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePublicToken } from '@/lib/utils';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const url = new URL(request.url);
  const stats = url.searchParams.get('stats') === 'true';
  // Manager can request employee-scoped view (only their own courses)
  const asEmployee = session.role === 'MANAGER' && url.searchParams.get('asEmployee') === 'true';

  const where = (session.role === 'MANAGER' && !asEmployee) ? {} : { createdByUserId: session.userId };

  if (stats) {
    // run all independent queries in parallel
    const [totalCourses, currentSubmissions, recentCoursesRaw, usersRaw] = await Promise.all([
      prisma.course.count({ where }),
      prisma.submission.count({
        where: { course: { ...((session.role === 'MANAGER' && !asEmployee) ? {} : { createdByUserId: session.userId }) } }
      }),
      prisma.course.findMany({
        where,
        include: { _count: { select: { submissions: true } }, createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      (session.role === 'MANAGER' && !asEmployee)
        ? prisma.user.findMany({
            where: { role: 'EMPLOYEE', isActive: true },
            select: { id: true, name: true, email: true, mobile: true, createdAt: true, lastLoginAt: true, _count: { select: { courses: true } } },
            orderBy: { createdAt: 'desc' }
          })
        : Promise.resolve(null),
    ]);

    // attach insurance issued + calc employee submission counts in parallel
    const courseIdList = recentCoursesRaw.map(c => c.id);
    const employeeIds = usersRaw ? usersRaw.map(u => u.id) : [];

    const [recentCourses, empSubGroups, issuedLogs] = await Promise.all([
      attachInsuranceIssued(recentCoursesRaw),
      employeeIds.length
        ? prisma.$queryRaw<{ userId: string; cnt: bigint }[]>`
            SELECT c."createdByUserId" AS "userId", COUNT(s.id)::bigint AS cnt
            FROM "Submission" s
            JOIN "Course" c ON c.id = s."courseId"
            WHERE c."createdByUserId" = ANY(${employeeIds}::text[])
            GROUP BY c."createdByUserId"
          `
        : Promise.resolve([]),
      courseIdList.length
        ? prisma.auditLog.findMany({
            where: { action: 'INSURANCE_ISSUED', entityType: 'Course', entityId: { in: courseIdList } },
            select: { entityId: true, metaJson: true },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    const issuedSeen = new Set<string>();
    const issuedSubmissionTotal = issuedLogs.reduce((total, log) => {
      if (issuedSeen.has(log.entityId)) return total;
      issuedSeen.add(log.entityId);
      const meta = log.metaJson && typeof log.metaJson === 'object' && !Array.isArray(log.metaJson) ? log.metaJson as Record<string, unknown> : {};
      return total + (typeof meta.insuredCount === 'number' ? meta.insuredCount : 0);
    }, 0);
    const totalSubmissions = currentSubmissions + issuedSubmissionTotal;

    const subCountMap = new Map(empSubGroups.map(r => [r.userId, Number(r.cnt)]));
    const employees = usersRaw ? usersRaw.map(u => ({ ...u, submissionCount: subCountMap.get(u.id) ?? 0 })) : null;

    const res = NextResponse.json({ totalCourses, totalSubmissions, completedSubmissions: totalSubmissions, recentCourses, userRole: session.role, userId: session.userId, employees });
    res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    return res;
  }

  const coursesRaw = await prisma.course.findMany({
    where,
    include: { _count: { select: { submissions: true } }, createdBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  const courses = await attachInsuranceIssued(coursesRaw);
  const res = NextResponse.json({ courses });
  res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
  return res;
}

async function attachInsuranceIssued<T extends { id: string }>(courses: T[]) {
  if (!courses.length) return courses;
  const logs = await prisma.auditLog.findMany({
    where: {
      action: 'INSURANCE_ISSUED',
      entityType: 'Course',
      entityId: { in: courses.map(course => course.id) },
    },
    orderBy: { createdAt: 'desc' },
  });
  const byCourse = new Map<string, { insuredCount: number; issuedAt: Date }>();
  for (const log of logs) {
    if (byCourse.has(log.entityId)) continue;
    const meta = log.metaJson && typeof log.metaJson === 'object' && !Array.isArray(log.metaJson) ? log.metaJson as Record<string, unknown> : {};
    byCourse.set(log.entityId, {
      insuredCount: typeof meta.insuredCount === 'number' ? meta.insuredCount : 0,
      issuedAt: log.createdAt,
    });
  }
  return courses.map(course => {
    const issued = byCourse.get(course.id);
    return issued ? { ...course, insuranceIssuedAt: issued.issuedAt, insuredCount: issued.insuredCount } : course;
  });
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

  await logAudit({ userId: session.userId, action: 'CREATE_COURSE', entityType: 'Course', entityId: course.id, meta: { activityName } });

  return NextResponse.json({ success: true, course });
}
