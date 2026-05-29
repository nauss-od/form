import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function countAudit(action: string): Promise<number> {
  try {
    return await prisma.auditLog.count({ where: { action } });
  } catch { return 0; }
}

async function countAuditSince(action: string, since: Date): Promise<number> {
  try {
    return await prisma.auditLog.count({ where: { action, createdAt: { gte: since } } });
  } catch { return 0; }
}

async function auditGroupByUser(action: string): Promise<{ userId: string; count: number }[]> {
  try {
    const logs = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: { action, userId: { not: null } },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
    });
    return logs
      .filter(l => l.userId)
      .map(l => ({ userId: l.userId!, count: l._count.userId }));
  } catch { return []; }
}

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

    // ── Audit Log Counts ──
    const [
      exportPdfCount, exportEmlCount, exportExcelCount,
      loginCount, insuranceViewCount, submitFormCount, pageViewCount,
      pdfLogins, pdfExports
    ] = await Promise.all([
      countAudit('EXPORT_PDF'),
      countAudit('EXPORT_EML'),
      countAudit('EXPORT_EXCEL'),
      countAudit('LOGIN'),
      countAudit('VIEW_INSURANCE'),
      countAudit('SUBMIT_FORM'),
      countAudit('PAGE_VIEW'),
      auditGroupByUser('LOGIN'),
      auditGroupByUser('EXPORT_PDF'),
    ]);

    const totalExports = exportPdfCount + exportEmlCount + exportExcelCount;

    // ── Employees ──
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: {
        id: true, name: true, email: true, mobile: true, createdAt: true, lastLoginAt: true,
        _count: { select: { courses: true } }
      }
    });

    const loginMap = new Map(pdfLogins.map(l => [l.userId, l.count]));
    const exportMap = new Map(pdfExports.map(e => [e.userId, e.count]));

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
        logins: loginMap.get(emp.id) || 0,
        exports: exportMap.get(emp.id) || 0,
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

    // Top employees
    const sortedBySubs = [...enriched].sort((a, b) => b.totalSubmissions - a.totalSubmissions).slice(0, 5);
    const sortedByLogins = [...enriched].sort((a, b) => (loginMap.get(b.id) || 0) - (loginMap.get(a.id) || 0)).slice(0, 5);
    const sortedByExports = [...enriched].sort((a, b) => (exportMap.get(b.id) || 0) - (exportMap.get(a.id) || 0)).slice(0, 5);

    // ── All Courses ──
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
    const coursesWithSubmissions = allCourses.filter(c => c._count.submissions > 0).length;
    const coursesWithoutSubmissions = allCourses.filter(c => c._count.submissions === 0).length;
    const avgSubmissionsPerCourse = totalCourses > 0 ? (totalSubmissions / totalCourses).toFixed(1) : '0';

    // ── Trend: submissions by month (last 12 months) ──
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const rawSubmissions = await prisma.submission.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true, course: { select: { status: true } } },
      orderBy: { createdAt: 'asc' },
    });
    const trendMap: Record<string, { total: number; published: number; closed: number }> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendMap[key] = { total: 0, published: 0, closed: 0 };
    }
    for (const s of rawSubmissions) {
      const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (trendMap[key]) {
        trendMap[key].total++;
        if (s.course.status === 'PUBLISHED') trendMap[key].published++;
        else trendMap[key].closed++;
      }
    }
    const trend = Object.entries(trendMap).map(([month, counts]) => ({ month, ...counts }));

    // ── Export trend (last 12 months) ──
    const exportTrendMap: Record<string, { pdf: number; eml: number; excel: number; total: number }> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      exportTrendMap[key] = { pdf: 0, eml: 0, excel: 0, total: 0 };
    }
    const rawExportLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['EXPORT_PDF', 'EXPORT_EML', 'EXPORT_EXCEL'] },
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { action: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    for (const l of rawExportLogs) {
      const key = `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (exportTrendMap[key]) {
        exportTrendMap[key].total++;
        if (l.action === 'EXPORT_PDF') exportTrendMap[key].pdf++;
        else if (l.action === 'EXPORT_EML') exportTrendMap[key].eml++;
        else if (l.action === 'EXPORT_EXCEL') exportTrendMap[key].excel++;
      }
    }
    const exportTrend = Object.entries(exportTrendMap).map(([month, counts]) => ({ month, ...counts }));

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
      kpis: {
        totalEmployees, totalCourses, totalSubmissions,
        totalActive, totalClosed, activeRate,
        coursesWithSubmissions, coursesWithoutSubmissions,
        avgSubmissionsPerCourse,
        exportPdfCount, exportEmlCount, exportExcelCount, totalExports,
        loginCount, insuranceViewCount, submitFormCount, pageViewCount,
      },
      trend,
      exportTrend,
      topEmployees: {
        bySubmissions: sortedBySubs.map(e => ({ id: e.id, name: e.name, count: e.totalSubmissions })),
        byLogins: sortedByLogins.map(e => ({ id: e.id, name: e.name, count: loginMap.get(e.id) || 0 })),
        byExports: sortedByExports.map(e => ({ id: e.id, name: e.name, count: exportMap.get(e.id) || 0 })),
      },
    });
  } catch (err) {
    console.error('Reports error:', err);
    return NextResponse.json({
      message: 'حدث خطأ في تحميل التقارير',
      error: String(err),
    }, { status: 500 });
  }
}