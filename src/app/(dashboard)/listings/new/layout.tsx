import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function NewListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}