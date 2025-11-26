import { KeybindingDisplaySkeleton } from '@/components/KeybindingDisplaySkeleton';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 pb-4">
      {/* プレイヤー情報カード */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm p-4 md:p-6 flex-shrink-0 animate-pulse">
        <div className="flex items-start gap-4 md:gap-6">
          {/* アバター */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-lg" />
          </div>

          {/* 名前・MCID */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-8 md:h-9 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>

          {/* 共有ボタン */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-muted rounded-lg" />
          </div>
        </div>
      </div>

      {/* メインカード（タブ＋コンテンツ） */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* タブナビゲーション */}
        <div className="border-b border-border flex-shrink-0">
          <div className="flex gap-1 p-2 animate-pulse">
            <div className="h-10 w-24 bg-muted rounded-lg" />
            <div className="h-10 w-24 bg-muted rounded-lg" />
            <div className="h-10 w-20 bg-muted rounded-lg" />
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <KeybindingDisplaySkeleton />
        </div>
      </div>
    </div>
  );
}
