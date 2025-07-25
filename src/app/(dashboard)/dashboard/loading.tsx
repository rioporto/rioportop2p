'use client';

import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header com stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico principal */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>

      {/* Atividades recentes e ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades recentes */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 