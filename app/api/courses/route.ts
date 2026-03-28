import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

async function uploadPlaceholder(file: File | null) {
  if (!file || file.size === 0) return { fileUrl: null, fileName: null };
  return {
    fileUrl: `/uploads/${randomUUID()}-${file.name}`,
    fileName: file.name
  };
}

export async function GET() {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  const courses = await prisma.course.findMany({
    where: session.role === 'MANAGER' ? {} : { createdByUserId: session.userId },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const formData = await request.formData();
  const approvalFile = formData.get('approvalFile') as File | null;
  const uploaded = await uploadPlaceholder(approvalFile);

  const course = await prisma.course.create({
    data: {
      createdByUserId: session.userId,
      activityName: String(formData.get('activityName') || '') || null,
      venue: String(formData.get('venue') || '') || null,
      startDate: formData.get('startDate') ? new Date(String(formData.get('startDate'))) : null,
      endDate: formData.get('endDate') ? new Date(String(formData.get('endDate'))) : null,
      participantCount: formData.get('participantCount') ? Number(formData.get('participantCount')) : null,
      approvalFileUrl: uploaded.fileUrl,
      approvalFileName: uploaded.fileName,
      publicToken: randomUUID(),
      status: 'PUBLISHED'
    }
  });

  return NextResponse.json({ success: true, course });
}
