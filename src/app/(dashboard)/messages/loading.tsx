'use client';

import { Skeleton } from "@/components/ui/Skeleton";

export default function MessagesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de conversas */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            
            <Skeleton className="h-10 w-full rounded-lg" />
            
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat principal */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex flex-col">
          {/* Header do chat */}
          <div className="flex items-center gap-4 pb-4 border-b dark:border-gray-700">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 py-6 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-24 w-64 rounded-2xl" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input de mensagem */}
          <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
} 