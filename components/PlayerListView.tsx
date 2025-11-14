'use client';

import { useState, useMemo } from 'react';
import { PlayerListItem } from './PlayerListItem';
import type { User } from '@/types/player';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface PlayerListViewProps {
  users: User[];
}

export function PlayerListView({ users }: PlayerListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="flex flex-col h-full">
      {/* ヘッダーと検索 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">プレイヤー一覧</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            {filteredUsers.length}人
            {searchQuery && ` / ${users.length}人中`}
          </p>
        </div>

        {/* 検索ボックス */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="表示名 / MCIDで検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
          />
        </div>
      </div>

      {/* プレイヤーリスト */}
      {filteredUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
          <p className="text-[rgb(var(--muted-foreground))]">
            {searchQuery ? '検索結果が見つかりませんでした' : '登録プレイヤーなし'}
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] overflow-hidden flex flex-col min-h-0">
          {/* テーブルヘッダー（デスクトップ） - 固定 */}
          <div className="hidden lg:grid lg:grid-cols-[180px_240px_repeat(8,minmax(60px,1fr))] gap-3 px-4 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))] text-xs font-semibold sticky top-0 z-10">
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
          <div className="lg:hidden px-4 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))] text-xs font-semibold space-y-1 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>プレイヤー</div>
              <div className="flex items-center gap-2">
                <div>感度</div>
                <div>振り向き</div>
              </div>
            </div>
            <div className="text-[10px] text-[rgb(var(--muted-foreground))] font-normal">
              ホットバー / その他キーバインド
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
