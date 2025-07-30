import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { TradeDetailsClient } from './trade-details-client';

interface TradeDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function TradeDetailsPage({ params }: TradeDetailsPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <TradeDetailsClient tradeId={params.id} userId={session.user.id} />;
}