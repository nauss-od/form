import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_TITLES = [
  'Scientific Supervisor',
  'Translator',
  'Trainer 1',
  'Trainer 2',
  'Coordinator',
  'Operations Manager',
];

async function getCourseWithAuth(courseId: string) {
  const session = getCurrentSession();
  if (!session) return { error: NextResponse.json({ message: 'غير مصرح' }, { status: 401 }) };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 }) };

  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
    return { error: NextResponse.json({ message: 'غير مصرح' }, { status: 403 }) };
  }

  return { session, course };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getCourseWithAuth(params.id);
  if (auth.error) return auth.error;

  const staff = await prisma.courseStaff.findMany({
    where: { courseId: params.id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getCourseWithAuth(params.id);
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'بيانات غير صالحة' }, { status: 400 });

  const name = String(body.name || '').trim();
  const passportNo = String(body.passportNo || '').trim().toUpperCase() || null;
  const mobile = String(body.mobile || '').trim() || null;
  const jobTitle = String(body.jobTitle || '').trim();

  if (!name || !/^[A-Za-z\s.\-']+$/.test(name))
    return NextResponse.json({ message: 'الاسم مطلوب باللغة الإنجليزية فقط' }, { status: 400 });

  if (!ALLOWED_TITLES.includes(jobTitle))
    return NextResponse.json({ message: 'المسمى الوظيفي غير صالح' }, { status: 400 });

  if (passportNo && !/^[A-Z0-9]{3,20}$/.test(passportNo))
    return NextResponse.json({ message: 'رقم الجواز غير صالح' }, { status: 400 });

  const existing = await prisma.courseStaff.count({ where: { courseId: params.id } });
  if (existing >= 20)
    return NextResponse.json({ message: 'الحد الأقصى 20 فرداً من الكادر' }, { status: 400 });

  const member = await prisma.courseStaff.create({
    data: { courseId: params.id, name, passportNo, mobile, jobTitle, sortOrder: existing },
  });

  return NextResponse.json({ success: true, member });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getCourseWithAuth(params.id);
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body || !body.staffId) return NextResponse.json({ message: 'بيانات غير صالحة' }, { status: 400 });

  const member = await prisma.courseStaff.findFirst({ where: { id: body.staffId, courseId: params.id } });
  if (!member) return NextResponse.json({ message: 'لم يوجد' }, { status: 404 });

  const name = String(body.name || '').trim();
  const passportNo = String(body.passportNo || '').trim().toUpperCase() || null;
  const mobile = String(body.mobile || '').trim() || null;
  const jobTitle = String(body.jobTitle || '').trim();

  if (!name || !/^[A-Za-z\s.\-']+$/.test(name))
    return NextResponse.json({ message: 'الاسم مطلوب باللغة الإنجليزية فقط' }, { status: 400 });

  if (!ALLOWED_TITLES.includes(jobTitle))
    return NextResponse.json({ message: 'المسمى الوظيفي غير صالح' }, { status: 400 });

  if (passportNo && !/^[A-Z0-9]{3,20}$/.test(passportNo))
    return NextResponse.json({ message: 'رقم الجواز غير صالح' }, { status: 400 });

  const updated = await prisma.courseStaff.update({
    where: { id: body.staffId },
    data: { name, passportNo, mobile, jobTitle },
  });

  return NextResponse.json({ success: true, member: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getCourseWithAuth(params.id);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get('staffId');
  if (!staffId) return NextResponse.json({ message: 'staffId مطلوب' }, { status: 400 });

  const member = await prisma.courseStaff.findFirst({ where: { id: staffId, courseId: params.id } });
  if (!member) return NextResponse.json({ message: 'لم يوجد' }, { status: 404 });

  await prisma.courseStaff.delete({ where: { id: staffId } });
  return NextResponse.json({ success: true });
}
