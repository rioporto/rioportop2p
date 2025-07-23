import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <div className="w-64 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="w-96 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="glass" className="animate-pulse">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                    <div className="w-32 h-7 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions and Portfolio Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card variant="glass" className="animate-pulse">
            <CardContent className="h-64">
              <div className="w-32 h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-full h-12 bg-gray-300 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="animate-pulse">
            <CardContent className="h-64">
              <div className="w-40 h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
              <div className="flex items-center justify-center">
                <div className="w-48 h-48 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Skeleton */}
        <Card variant="glass" className="animate-pulse">
          <CardContent>
            <div className="w-36 h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="flex-1">
                    <div className="w-48 h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                    <div className="w-32 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="w-20 h-8 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}