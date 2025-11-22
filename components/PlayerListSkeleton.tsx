/**
 * プレイヤーリストのスケルトンスクリーン
 */
export function PlayerListSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-0 space-y-3 md:space-y-6">
      {/* ヘッダースケルトン */}
      <div className="flex flex-col gap-3 md:gap-6 flex-shrink-0 animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-4">
          <div>
            <div className="h-6 md:h-8 w-32 md:w-40 bg-muted rounded-lg mb-1 md:mb-2" />
            <div className="h-3 md:h-4 w-24 bg-muted rounded" />
          </div>
          <div className="flex gap-1.5 md:gap-2">
            <div className="h-8 md:h-10 w-28 md:w-32 bg-muted rounded-lg" />
            <div className="h-8 md:h-10 w-20 md:w-24 bg-muted rounded-lg" />
          </div>
        </div>

        {/* 検索ボックススケルトン */}
        <div className="h-10 md:h-12 w-full bg-muted rounded-lg" />
      </div>

      {/* リストスケルトン */}
      <div className="flex-1 bg-card rounded-xl md:rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-0">
        {/* テーブルヘッダー（デスクトップ） */}
        <div className="hidden lg:grid lg:grid-cols-[180px_240px_repeat(8,minmax(60px,1fr))] gap-3 px-6 py-3 border-b border-border bg-muted/50">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>

        {/* テーブルヘッダー（モバイル） */}
        <div className="lg:hidden px-3 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* プレイヤー行スケルトン */}
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-b border-border last:border-b-0 px-4 py-3 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* デスクトップ表示 */}
              <div className="hidden lg:grid lg:grid-cols-[180px_240px_repeat(8,minmax(60px,1fr))] gap-3 items-center">
                {/* プレイヤー */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>

                {/* ホットバー */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <div key={j} className="w-6 h-5 bg-muted rounded" />
                  ))}
                </div>

                {/* その他のキー */}
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} className="h-4 bg-muted rounded mx-auto w-12" />
                ))}
              </div>

              {/* モバイル表示 */}
              <div className="lg:hidden space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-muted rounded" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-28" />
                    <div className="h-3 bg-muted rounded w-20" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <div key={j} className="w-5 h-5 bg-muted rounded" />
                    ))}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="w-16 h-5 bg-muted rounded" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
