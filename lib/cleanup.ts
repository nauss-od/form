import { prisma } from './prisma';

function parseDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  return isNaN(dt.getTime()) ? null : dt;
}

export async function cleanupExpiredCourseFiles(): Promise<number> {
  const now = new Date();
  const courses = await prisma.course.findMany({
    where: {
      startDate: { not: null },
    },
    select: { id: true, startDate: true, activityName: true },
  });

  let totalDeleted = 0;
  for (const course of courses) {
    const start = parseDate(course.startDate);
    if (!start) continue;
    const cutoff = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (now >= cutoff) {
      const subs = await prisma.submission.findMany({
        where: { courseId: course.id },
        select: { id: true },
      });
      const subIds = subs.map(s => s.id);
      if (subIds.length === 0) continue;
      const deleted = await prisma.submissionFile.deleteMany({
        where: { submissionId: { in: subIds } },
      });
      totalDeleted += deleted.count;
    }
  }
  return totalDeleted;
}

export async function cleanupCourseFiles(courseId: string): Promise<number> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { startDate: true },
  });
  if (!course) return 0;
  const start = parseDate(course.startDate);
  if (!start) return 0;
  const cutoff = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
  if (new Date() < cutoff) return 0;

  const subs = await prisma.submission.findMany({
    where: { courseId },
    select: { id: true },
  });
  const subIds = subs.map(s => s.id);
  if (subIds.length === 0) return 0;
  const deleted = await prisma.submissionFile.deleteMany({
    where: { submissionId: { in: subIds } },
  });
  return deleted.count;
}
