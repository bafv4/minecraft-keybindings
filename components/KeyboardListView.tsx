'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import type { User } from '@/types/player';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getLanguageName } from '@/lib/utils';

interface KeyboardListViewProps {
  users: User[];
}

type SortKey = 'player' | 'model' | 'layout' | 'language' | 'remapCount';
type SortOrder = 'asc' | 'desc';

export function KeyboardListView({ users }: KeyboardListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('player');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ソートハンドラー
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // ソートアイコン
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />
    );
  };

  // リマップ数を計算
  const getRemapCount = (user: User): number => {
    if (!user.settings?.remappings) return 0;
    return Object.keys(user.settings.remappings).length;
  };

  // ソート済みユーザー
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let compareValue = 0;

      switch (sortKey) {
        case 'player':
          const nameA = a.displayName || a.mcid;
          const nameB = b.displayName || b.mcid;
          compareValue = nameA.localeCompare(nameB);
          break;

        case 'model':
          const modelA = a.settings?.keyboardModel || '';
          const modelB = b.settings?.keyboardModel || '';
          // 値がない場合は最下部に配置
          if (!modelA && modelB) return 1;
          if (modelA && !modelB) return -1;
          compareValue = modelA.localeCompare(modelB);
          break;

        case 'layout':
          const layoutA = a.settings?.keyboardLayout || '';
          const layoutB = b.settings?.keyboardLayout || '';
          // 値がない場合は最下部に配置
          if (!layoutA && layoutB) return 1;
          if (layoutA && !layoutB) return -1;
          compareValue = layoutA.localeCompare(layoutB);
          break;

        case 'language':
          const langA = a.settings?.gameLanguage || '';
          const langB = b.settings?.gameLanguage || '';
          // 値がない場合は最下部に配置
          if (!langA && langB) return 1;
          if (langA && !langB) return -1;
          compareValue = langA.localeCompare(langB);
          break;

        case 'remapCount':
          const countA = getRemapCount(a);
          const countB = getRemapCount(b);
          compareValue = countA - countB;
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }, [users, sortKey, sortOrder]);

  // 検索フィルター
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return sortedUsers;

    const query = searchQuery.toLowerCase();
    return sortedUsers.filter((user) => {
      const displayName = user.displayName?.toLowerCase() || '';
      const mcid = user.mcid.toLowerCase();
      const keyboardModel = user.settings?.keyboardModel?.toLowerCase() || '';
      return displayName.includes(query) || mcid.includes(query) || keyboardModel.includes(query);
    });
  }, [sortedUsers, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダーと検索 */}
      <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            {/* 戻るボタン */}
            <Link
              href="/"
              className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg transition-colors"
              title="プレイヤー一覧に戻る"
            >
              <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
            </Link>

            <h1 className="text-lg md:text-2xl font-semibold">キーボード設定一覧</h1>
          </div>

          {/* モバイル検索ボタン */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
          >
            {mobileSearchOpen ? (
              <XMarkIcon className="w-4 h-4" />
            ) : (
              <MagnifyingGlassIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 検索ボックス - デスクトップは常に表示、モバイルはトグル */}
        <div className={`relative ${mobileSearchOpen ? 'block' : 'hidden md:block'}`}>
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="プレイヤー / キーボード機種で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
          />
        </div>
      </div>

      {/* テーブル */}
      {filteredUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
          <p className="text-[rgb(var(--muted-foreground))]">
            {searchQuery ? '検索結果が見つかりませんでした' : '登録プレイヤーなし'}
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-sm">
              <thead className="bg-[rgb(var(--muted))] border-b border-[rgb(var(--border))] sticky top-0 z-10">
              <tr>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('player')}
                >
                  プレイヤー <SortIcon columnKey="player" />
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('model')}
                >
                  キーボード機種 <SortIcon columnKey="model" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('layout')}
                >
                  キー配列 <SortIcon columnKey="layout" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('language')}
                >
                  言語 <SortIcon columnKey="language" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('remapCount')}
                >
                  リマップ数 <SortIcon columnKey="remapCount" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.uuid}
                  onClick={() => window.location.href = `/player/${user.mcid}`}
                  className="border-b border-[rgb(var(--border))] last:border-b-0 group cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
                >
                  {/* プレイヤー */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <MinecraftAvatar uuid={user.uuid} mcid={user.mcid} size={32} />
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {user.displayName && user.displayName.trim() !== '' ? user.displayName : user.mcid}
                        </div>
                        {user.displayName && user.displayName.trim() !== '' && user.displayName !== user.mcid && (
                          <div className="text-xs text-[rgb(var(--muted-foreground))]">
                            {user.mcid}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* キーボード機種 */}
                  <td className="px-4 py-3">
                    {user.settings?.keyboardModel || '-'}
                  </td>

                  {/* キー配列 */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.keyboardLayout || '-'}
                  </td>

                  {/* 言語 */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.gameLanguage ? getLanguageName(user.settings.gameLanguage) : '-'}
                  </td>

                  {/* リマップ数 */}
                  <td className="px-4 py-3 text-center">
                    {getRemapCount(user)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
