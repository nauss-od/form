import { prisma } from './prisma';

type CourseIdentity = {
  id: string;
  createdAt: Date;
  createdByUserId: string;
  createdBy: { name: string };
};

export function formatInsuranceCourseName(employeeName: string, sequence: number) {
  const firstName = employeeName.trim().split(/\s+/)[0] || 'الموظف';
  return `دورة ${firstName} ${String(sequence).padStart(3, '0')}`;
}

export async function getInsuranceCourseName(course: CourseIdentity) {
  const creationLogs = await prisma.auditLog.findMany({
    where: { userId: course.createdByUserId, action: 'CREATE_COURSE', entityType: 'Course' },
    select: { entityId: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  const loggedSequence = creationLogs.findIndex(log => log.entityId === course.id) + 1;
  if (loggedSequence > 0) return formatInsuranceCourseName(course.createdBy.name, loggedSequence);

  const sequence = await prisma.course.count({
    where: {
      createdByUserId: course.createdByUserId,
      OR: [
        { createdAt: { lt: course.createdAt } },
        { createdAt: course.createdAt, id: { lte: course.id } },
      ],
    },
  });
  return formatInsuranceCourseName(course.createdBy.name, sequence);
}

export async function getInsuranceCourseNames(courses: CourseIdentity[]) {
  if (!courses.length) return new Map<string, string>();
  const creatorIds = [...new Set(courses.map(course => course.createdByUserId))];
  const [allCourses, creationLogs] = await Promise.all([
    prisma.course.findMany({
      where: { createdByUserId: { in: creatorIds } },
      select: { id: true, createdByUserId: true, createdAt: true },
      orderBy: [{ createdByUserId: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    }),
    prisma.auditLog.findMany({
      where: { userId: { in: creatorIds }, action: 'CREATE_COURSE', entityType: 'Course' },
      select: { entityId: true, userId: true },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }),
  ]);

  const sequences = new Map<string, number>();
  const namesByCreator = new Map(courses.map(course => [course.createdByUserId, course.createdBy.name]));
  const names = new Map<string, string>();
  for (const log of creationLogs) {
    if (!log.userId) continue;
    const sequence = (sequences.get(log.userId) || 0) + 1;
    sequences.set(log.userId, sequence);
    names.set(log.entityId, formatInsuranceCourseName(namesByCreator.get(log.userId) || 'الموظف', sequence));
  }

  sequences.clear();
  for (const course of allCourses) {
    const sequence = (sequences.get(course.createdByUserId) || 0) + 1;
    sequences.set(course.createdByUserId, sequence);
    if (!names.has(course.id)) {
      names.set(course.id, formatInsuranceCourseName(namesByCreator.get(course.createdByUserId) || 'الموظف', sequence));
    }
  }
  return names;
}
