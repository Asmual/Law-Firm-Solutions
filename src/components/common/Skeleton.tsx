import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-800/80 dark:bg-slate-800/80 bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800 bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 6,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-3 p-4", className)}>
      {/* Table Header Skeleton */}
      <div className="flex items-center gap-4 pb-3 border-b border-slate-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={`th-${i}`}
            className="h-4 flex-1 bg-slate-800"
          />
        ))}
      </div>
      {/* Table Body Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`tr-${r}`}
          className="flex items-center gap-4 py-3 border-b border-slate-800/60"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={`td-${r}-${c}`}
              className={cn(
                "h-4 flex-1",
                c === 0 && "max-w-[120px] bg-[#cca776]/20",
                c === cols - 1 && "max-w-[80px]"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800/70">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CaseDossierSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-[#cca776]/20" />
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg bg-[#cca776]/30" />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
