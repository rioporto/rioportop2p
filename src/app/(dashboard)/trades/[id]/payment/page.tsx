import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { PaymentClient } from './payment-client';

interface PaymentPageProps {
  params: {
    id: string;
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <PaymentClient tradeId={params.id} userId={session.user.id} />;
}