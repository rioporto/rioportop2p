import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { PixKeysClient } from './pix-keys-client';

export default async function PixKeysPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <PixKeysClient userId={session.user.id} />;
}