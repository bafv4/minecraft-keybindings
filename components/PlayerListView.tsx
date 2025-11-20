'use client';

import { useState, useMemo } from 'react';
import { PlayerListItem } from './PlayerListItem';
import type { User } from '@/types/player';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PlayerListViewProps {
  users: User[];
}

export function PlayerListView({ users }: PlayerListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // 表示名またはMCIDでソート
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const nameA = a.displayName || a.mcid;
      const nameB = b.displayName || b.mcid;
      return nameA.localeCompare(nameB);
    });
  }, [users]);

  // 検索フィルター
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return sortedUsers;

    const query = searchQuery.toLowerCase();
    return sortedUsers.filter((user) => {
      const displayName = user.displayName?.toLowerCase() || '';
      const mcid = user.mcid.toLowerCase();
      return displayName.includes(query) || mcid.includes(query);
    });
  }, [sortedUsers, searchQuery]);

  return (
    <div className="flex flex-col h-full min-h-0 space-y-3 md:space-y-6">
      {/* ヘッダーセクション */}
      <div className="flex flex-col gap-3 md:gap-6 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold">
              プレイヤー一覧
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
              {filteredUsers.length}人のプレイヤー
            </p>
          </div>

          {/* モバイル検索ボタン */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 bg-card border-2 border-border rounded-lg hover:bg-accent transition-colors shadow-sm"
          >
            {mobileSearchOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <MagnifyingGlassIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 検索ボックス - デスクトップは常に表示、モバイルはトグル */}
        <div className={`relative ${mobileSearchOpen ? 'block' : 'hidden md:block'}`}>
          <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="表示名 / MCIDで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3.5 text-sm md:text-base border-2 border-border rounded-lg md:rounded-xl bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* プレイヤーリスト */}
      {filteredUsers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-xl md:rounded-2xl border border-border shadow-sm p-8 md:p-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            {searchQuery ? '検索結果が見つかりませんでした' : 'プレイヤーが登録されていません'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? '別のキーワードで検索してみてください' : '最初のプレイヤーになりましょう！'}
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-card rounded-xl md:rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-0">
          {/* テーブルヘッダー（デスクトップ） - 固定 */}
          <div className="hidden lg:grid lg:grid-cols-[180px_240px_repeat(8,minmax(60px,1fr))] gap-3 px-6 py-3 border-b border-border bg-muted/50 text-xs font-semibold sticky top-0 z-10 backdrop-blur-sm">
            <div>プレイヤー</div>
            <div>ホットバー</div>
            <div className="text-center">オフハンド</div>
            <div className="text-center">スニーク</div>
            <div className="text-center">ダッシュ</div>
            <div className="text-center">ジャンプ</div>
            <div className="text-center">インベントリ</div>
            <div className="text-center">ドロップ</div>
            <div className="text-center">感度</div>
            <div className="text-center">振り向き</div>
          </div>

          {/* テーブルヘッダー（モバイル/タブレット） - 固定 */}
          <div className="lg:hidden px-3 py-2 border-b border-border bg-muted/50 text-xs font-semibold sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>プレイヤー</div>
              <div className="flex items-center gap-2 text-[10px]">
                <div>感度</div>
                <div>振り向き</div>
              </div>
            </div>
          </div>

          {/* プレイヤー行 - スクロール可能 */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => (
              <PlayerListItem key={user.uuid} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
