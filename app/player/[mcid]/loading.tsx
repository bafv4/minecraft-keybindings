import { KeybindingDisplaySkeleton } from '@/components/KeybindingDisplaySkeleton';

export default function Loading() {
  return (
    <div className="pb-6">
      <div className="mb-8 flex items-center gap-4 animate-pulse">
        {/* Avatar skeleton */}
        <div className="w-24 h-24 bg-[rgb(var(--muted))] rounded-lg"></div>
        <div>
          {/* Title skeleton */}
          <div className="h-10 w-48 bg-[rgb(var(--muted))] rounded mb-2"></div>
          {/* Subtitle skeleton */}
          <div className="h-6 w-32 bg-[rgb(var(--muted))] rounded"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <KeybindingDisplaySkeleton />
    </div>
  );
}
