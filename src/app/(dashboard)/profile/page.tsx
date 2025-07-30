import dynamic from 'next/dynamic';

// Import dinâmico para evitar erro de build com Stack Auth
const ProfileClient = dynamic(
  () => import('@/components/profile/ProfileClient').then(mod => mod.ProfileClient),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }
);

export default function ProfilePage() {
  return <ProfileClient />;
}