import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';

const createSchema = z.object({
  courseName: z.string().min(2),
  country: z.string().min(2),
  organizingEntity: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  expectedParticipants: z.number().optional().default(0),
  courseCode: z.string().optional(),
  city: z.string().optional(),
  venue: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: 'بيانات غير صالحة' }, { status: 422 });
  const form = await prisma.insuranceForm.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      createdById: user.id,
    },
  });
  return NextResponse.json({ message: 'تم الحفظ', form });
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  const { id, action } = await req.json();
  const form = await prisma.insuranceForm.findUnique({ where: { id } });
  if (!form) return NextResponse.json({ message: 'غير موجود' }, { status: 404 });
  if (user.role === 'EMPLOYEE' && form.createdById !== user.id) return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  if (action === 'publish') {
    const updated = await prisma.insuranceForm.update({ where: { id }, data: { status: 'PUBLISHED', publicLinkToken: form.publicLinkToken || randomUUID() } });
    return NextResponse.json({ message: 'تم النشر', form: updated });
  }
  return NextResponse.json({ message: 'إجراء غير مدعوم' }, { status: 400 });
}
