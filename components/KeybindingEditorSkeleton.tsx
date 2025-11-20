export function KeybindingEditorSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 基本設定セクション */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* マウス設定セクション */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* キーボード設定セクション */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* バーチャルキーボード */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        </div>
        <div className="h-64 bg-muted rounded"></div>
      </div>

      {/* キーバインド編集 */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-12 bg-muted rounded flex-1"></div>
              <div className="h-12 bg-muted rounded w-40"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end gap-4">
        <div className="h-12 bg-muted rounded w-32"></div>
        <div className="h-12 bg-muted rounded w-32"></div>
      </div>
    </div>
  );
}
