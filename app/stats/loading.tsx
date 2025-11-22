export default function Loading() {
  return (
    <div className="pb-6 space-y-6 animate-pulse">
      {/* ページタイトル */}
      <div className="h-8 w-32 bg-[rgb(var(--muted))] rounded mb-6"></div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl md:rounded-2xl shadow-sm p-6 space-y-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="h-6 bg-[rgb(var(--muted))] rounded w-3/4"></div>
            <div className="h-32 bg-[rgb(var(--muted))] rounded"></div>
            <div className="h-4 bg-[rgb(var(--muted))] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
