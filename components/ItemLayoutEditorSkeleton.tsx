/**
 * アイテム配置エディタのスケルトンスクリーン
 */
export function ItemLayoutEditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* セグメント選択 */}
      <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>

      {/* ホットバースロット */}
      <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
        <div className="h-6 bg-muted rounded w-48 mb-4" />
        <div className="grid grid-cols-9 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-muted rounded w-6 mx-auto" />
              <div className="h-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* オフハンド */}
      <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
        <div className="h-6 bg-muted rounded w-32 mb-4" />
        <div className="h-16 bg-muted rounded w-16" />
      </div>

      {/* ノート */}
      <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
        <div className="h-4 bg-muted rounded w-24 mb-3" />
        <div className="h-20 bg-muted rounded" />
      </div>
    </div>
  );
}
