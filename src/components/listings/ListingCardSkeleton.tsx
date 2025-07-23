'use client';

import { motion } from 'framer-motion';

export function ListingCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          
          <div className="text-right space-y-2">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

        {/* Limits */}
        <div className="flex justify-between items-center">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Payment methods */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-0 bg-gradient-to-r from-blue-400 to-purple-600 animate-progress" />
        </div>

        {/* Action button */}
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    </motion.div>
  );
}

export function ListingCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ListingCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}