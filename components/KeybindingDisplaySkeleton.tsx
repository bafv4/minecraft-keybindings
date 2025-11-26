/**
 * キーバインド表示のスケルトンスクリーン
 */
export function KeybindingDisplaySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 移動キーセクション */}
      <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
        <div className="h-6 bg-muted rounded w-32 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* アクションキーセクション */}
      <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
        <div className="h-6 bg-muted rounded w-40 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* インベントリキーセクション */}
      <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
        <div className="h-6 bg-muted rounded w-48 mb-3" />
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-muted rounded w-12" />
              <div className="h-8 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
