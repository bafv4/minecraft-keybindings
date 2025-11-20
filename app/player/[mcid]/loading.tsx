import { LoadingPage } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="pb-6">
      <div className="mb-8 flex items-center gap-4">
        {/* Avatar skeleton */}
        <div className="w-24 h-24 bg-[rgb(var(--muted))] rounded-lg animate-pulse"></div>
        <div>
          {/* Title skeleton */}
          <div className="h-10 w-48 bg-[rgb(var(--muted))] rounded animate-pulse mb-2"></div>
          {/* Subtitle skeleton */}
          <div className="h-6 w-32 bg-[rgb(var(--muted))] rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content loading spinner */}
      <LoadingPage />
    </div>
  );
}
