import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { NewPixKeyClient } from './new-pix-key-client';

export default async function NewPixKeyPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <NewPixKeyClient userId={session.user.id} />;
}