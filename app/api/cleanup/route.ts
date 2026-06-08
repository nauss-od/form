import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { cleanupExpiredCourseFiles } from '@/lib/cleanup';

export async function POST() {
  const session = getCurrentSession();
  if (!session || session.role !== 'MANAGER') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const deleted = await cleanupExpiredCourseFiles();
  return NextResponse.json({ success: true, deletedFiles: deleted });
}
