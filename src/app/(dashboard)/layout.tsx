'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layouts/Header';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Footer } from '@/components/layouts/Footer';
import { IUser, KYCLevel } from '@/types/kyc';

// Mock user - será substituído por dados reais
const mockUser: IUser = {
  id: '1',
  email: 'usuario@example.com',
  name: 'João Silva',
  kycLevel: KYCLevel.BASIC,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header user={mockUser} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
          user={mockUser} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary text-white rounded-full 
                     shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}