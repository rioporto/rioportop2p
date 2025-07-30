'use client';

import { SimpleLogoutButton } from '@/components/ui/SimpleLogoutButton';

export default function TestLogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Teste de Logout</h1>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Variante Default:</p>
            <SimpleLogoutButton variant="default" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Variante Danger:</p>
            <SimpleLogoutButton variant="danger" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Variante Ghost:</p>
            <SimpleLogoutButton variant="ghost" />
          </div>
        </div>
      </div>
    </div>
  );
}