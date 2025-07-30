import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ReleaseClient } from './release-client';

interface ReleasePageProps {
  params: {
    id: string;
  };
}

export default async function ReleasePage({ params }: ReleasePageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <ReleaseClient tradeId={params.id} userId={session.user.id} />;
}