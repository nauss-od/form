import { prisma } from './prisma';

function parseDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  return isNaN(dt.getTime()) ? null : dt;
}

function getCutoff(course: { startDate: Date | string | null; endDate: Date | string | null }): Date | null {
  const ref = parseDate(course.endDate) || parseDate(course.startDate);
  if (!ref) return null;
  return new Date(ref.getTime() + 3 * 24 * 60 * 60 * 1000);
}

export async function cleanupExpiredCourseFiles(): Promise<number> {
  const now = new Date();
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { endDate: { not: null } },
        { startDate: { not: null } },
      ],
    },
    select: { id: true, startDate: true, endDate: true },
  });

  let totalDeleted = 0;
  for (const course of courses) {
    const cutoff = getCutoff(course);
    if (!cutoff || now < cutoff) continue;
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
  return totalDeleted;
}
