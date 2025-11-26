/**
 * キーバインド編集画面のスケルトンスクリーン
 */
export function KeybindingEditorSkeleton() {
  return (
    <div className="flex flex-col flex-1 min-h-0 pb-32 animate-pulse">
      {/* プレイヤー情報カード */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm p-4 md:p-6 flex-shrink-0 mb-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-10 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="flex gap-2">
                <div className="h-10 bg-muted rounded flex-1" />
                <div className="h-10 bg-muted rounded w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインカード（タブ＋コンテンツ） */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* タブナビゲーション */}
        <div className="border-b border-border flex-shrink-0">
          <div className="flex gap-1 p-2">
            <div className="h-10 w-28 bg-muted rounded-lg" />
            <div className="h-10 w-24 bg-muted rounded-lg" />
            <div className="h-10 w-32 bg-muted rounded-lg" />
            <div className="h-10 w-28 bg-muted rounded-lg" />
            <div className="h-10 w-32 bg-muted rounded-lg" />
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* セクション1 */}
            <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
              <div className="h-6 bg-muted rounded w-32 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* セクション2 */}
            <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
              <div className="h-6 bg-muted rounded w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-muted rounded w-20" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* セクション3 */}
            <div className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
              <div className="h-6 bg-muted rounded w-36 mb-4" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* 固定ボタンエリア */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgb(var(--background))]/95 backdrop-blur-sm border-t border-[rgb(var(--border))] z-40">
        <div className="container mx-auto px-4 py-4 flex gap-4 justify-between items-center">
          <div className="hidden md:flex gap-2">
            <div className="h-10 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-10" />
            <div className="h-10 bg-muted rounded w-10" />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
