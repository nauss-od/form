import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function PublicFormLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  const course = await prisma.course.findUnique({
    where: { publicToken: params.token },
    select: { id: true },
  });

  if (!course) notFound();

  return children;
}
