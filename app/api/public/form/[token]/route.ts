import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const course = await prisma.course.findUnique({
    where: { publicToken: params.token },
    select: { activityName: true, startDate: true, endDate: true, venue: true, status: true },
  });

  if (!course) return NextResponse.json({ message: 'الرابط غير صالح' }, { status: 404 });
  if (course.status !== 'PUBLISHED') {
    return NextResponse.json({ message: 'تم إغلاق النموذج ولم يعد متاحاً للتعبئة' }, { status: 403 });
  }

  return NextResponse.json({
    activityName: course.activityName,
    startDate: course.startDate,
    endDate: course.endDate,
    venue: course.venue,
  });
}
