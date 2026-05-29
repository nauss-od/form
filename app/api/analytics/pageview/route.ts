import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const session = getCurrentSession();
    const { pathname } = await request.json();
    logAudit({
      userId: session?.userId,
      action: 'PAGE_VIEW',
      entityType: 'Page',
      entityId: pathname || '/',
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
