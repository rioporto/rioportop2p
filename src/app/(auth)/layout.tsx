import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Rio Porto P2P',
    default: 'Rio Porto P2P',
  },
  description: 'Exchange P2P de criptomoedas segura e confiável',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}