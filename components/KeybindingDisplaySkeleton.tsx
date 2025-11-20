/**
 * キーバインド表示のスケルトンスクリーン
 */
export function KeybindingDisplaySkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* マウス設定セクション */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-10 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* キーボード設定セクション */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-10 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* バーチャルキーボード */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-64 bg-muted rounded" />
      </div>

      {/* キーバインド一覧 */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 bg-muted rounded flex-1" />
              <div className="h-10 bg-muted rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
