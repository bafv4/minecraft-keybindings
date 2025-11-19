export default function Loading() {
  return (
    <div className="pb-6">
      <div className="h-8 w-24 bg-[rgb(var(--muted))] rounded animate-pulse mb-4"></div>

      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    </div>
  );
}
