import { LoadingSpinner } from './ui/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * キーボード設定リストのスケルトンスクリーン
 */
export function KeyboardListSkeleton() {
  return (
    <div className="flex flex-col h-full relative">
      {/* スピナーオーバーレイ */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm rounded-full p-4">
          <LoadingSpinner size="lg" />
        </div>
      </div>

      {/* ヘッダーと検索スケルトン */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg" />
          <div className="h-7 w-44 bg-muted rounded" />
        </div>
        <div className="w-full sm:w-96 h-12 bg-muted rounded-lg" />
      </div>

      {/* テーブルスケルトン */}
      <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border sticky top-0 z-10">
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-b-0 animate-pulse"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* プレイヤー */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded" />
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  </td>

                  {/* その他のカラム */}
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded mx-auto w-16" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
