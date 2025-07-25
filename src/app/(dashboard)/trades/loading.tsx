'use client';

import { Skeleton } from "@/components/ui/Skeleton";

export default function TradesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header com stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <div className="ml-auto">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Lista de trades */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Info do trade */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="ml-auto">
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex justify-center gap-2 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
} 