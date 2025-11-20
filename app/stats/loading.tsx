import { LoadingPage } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="pb-6">
      <div className="h-8 w-24 bg-[rgb(var(--muted))] rounded animate-pulse mb-4"></div>
      <LoadingPage />
    </div>
  );
}
