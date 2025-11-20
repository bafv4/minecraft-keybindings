/**
 * アイテム配置エディタのスケルトンスクリーン
 */
export function ItemLayoutEditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* セグメント選択 */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-10 bg-muted rounded" />
      </div>

      {/* ホットバースロット */}
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-48" />
        <div className="grid grid-cols-9 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-8" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* オフハンド */}
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-32" />
        <div className="h-20 bg-muted rounded w-24" />
      </div>

      {/* ノート */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-24 bg-muted rounded" />
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        <div className="h-10 bg-muted rounded w-24" />
        <div className="h-10 bg-muted rounded w-24" />
      </div>
    </div>
  );
}
