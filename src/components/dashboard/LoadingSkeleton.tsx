import React from 'react';

function SkeletonLine({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return (
    <div className={`${width} ${height} rounded-lg bg-surface-800/80 animate-pulse`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="space-y-2">
        <SkeletonLine width="w-56" height="h-8" />
        <SkeletonLine width="w-40" height="h-4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-surface-800/60 bg-surface-900/80 p-5 space-y-4">
            <div className="flex justify-between">
              <SkeletonLine width="w-24" height="h-4" />
              <div className="h-8 w-8 rounded-xl bg-surface-800/80 animate-pulse" />
            </div>
            <SkeletonLine width="w-16" height="h-8" />
            <SkeletonLine width="w-32" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface-900/80 border border-surface-800/60">
          <div className="h-9 w-9 rounded-xl bg-surface-800/80 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-48" height="h-4" />
            <SkeletonLine width="w-32" height="h-3" />
          </div>
          <SkeletonLine width="w-20" height="h-6" />
        </div>
      ))}
    </div>
  );
}
