'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import type { User } from '@/types/player';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getLanguageName } from '@/lib/languages';

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
    // keyRemapsプロパティが存在する場合はその長さを返す
    if ('keyRemaps' in user && Array.isArray((user as any).keyRemaps)) {
      return (user as any).keyRemaps.length;
    }
    // 後方互換性のため、古い形式もサポート
    if (user.settings?.remappings) {
      return Object.keys(user.settings.remappings).length;
    }
    return 0;
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
      <div className="flex flex-col gap-3 md:gap-6 mb-4 md:mb-6 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            {/* 戻るボタン */}
            <Link
              href="/"
              className="inline-flex items-center justify-center w-10 h-10 bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] border-2 border-[rgb(var(--border))] rounded-lg transition-colors shadow-sm"
              title="プレイヤー一覧に戻る"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <h1 className="text-xl md:text-3xl font-bold">キーボード設定一覧</h1>
          </div>

          {/* モバイル検索ボタン */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 bg-[rgb(var(--card))] border-2 border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors shadow-sm"
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
          <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="プレイヤー / キーボード機種で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3.5 text-sm md:text-base border-2 border-[rgb(var(--border))] rounded-lg md:rounded-xl bg-[rgb(var(--card))] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* テーブル */}
      {filteredUsers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[rgb(var(--card))] rounded-xl md:rounded-2xl border border-[rgb(var(--border))] shadow-sm p-8 md:p-12">
          <div className="w-16 h-16 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-[rgb(var(--muted-foreground))]" />
          </div>
          <p className="text-lg font-medium text-[rgb(var(--foreground))] mb-1">
            {searchQuery ? '検索結果が見つかりませんでした' : 'プレイヤーが登録されていません'}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            {searchQuery ? '別のキーワードで検索してみてください' : '最初のプレイヤーになりましょう！'}
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-[rgb(var(--card))] rounded-xl md:rounded-2xl border border-[rgb(var(--border))] shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-x-auto min-h-0">
            <table className="w-full text-sm relative">
              <thead className="bg-[rgb(var(--card))] border-b border-[rgb(var(--border))] sticky top-0 z-20 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:via-secondary/5 before:to-transparent before:pointer-events-none">
              <tr>
                <th
                  className="sticky left-0 z-30 bg-[rgb(var(--card))] px-4 py-3 text-left font-semibold cursor-pointer hover:bg-[rgb(var(--muted))] transition-colors whitespace-nowrap border-r border-[rgb(var(--border))] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-primary/5 before:pointer-events-none"
                  onClick={() => handleSort('player')}
                >
                  プレイヤー <SortIcon columnKey="player" />
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('model')}
                >
                  キーボード機種 <SortIcon columnKey="model" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('layout')}
                >
                  キー配列 <SortIcon columnKey="layout" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('language')}
                >
                  言語 <SortIcon columnKey="language" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
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
                  <td className="sticky left-0 z-10 bg-[rgb(var(--card))] px-4 py-3 border-r border-[rgb(var(--border))] group-hover:bg-gradient-to-r group-hover:from-primary/5 group-hover:to-transparent shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                      <MinecraftAvatar uuid={user.uuid} mcid={user.mcid} size={32} />
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors whitespace-nowrap">
                          {user.displayName && user.displayName.trim() !== '' ? user.displayName : user.mcid}
                        </div>
                        {user.displayName && user.displayName.trim() !== '' && user.displayName !== user.mcid && (
                          <div className="text-xs text-[rgb(var(--muted-foreground))] whitespace-nowrap">
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
