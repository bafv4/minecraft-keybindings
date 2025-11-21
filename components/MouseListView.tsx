'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import { calculateCursorSpeed } from '@/lib/utils';
import type { User } from '@/types/player';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface MouseListViewProps {
  users: User[];
}

type SortKey = 'player' | 'model' | 'dpi' | 'acceleration' | 'rawInput' | 'sensitivity' | 'cm360' | 'windowsSpeed' | 'cursorSpeed';
type SortOrder = 'asc' | 'desc';

export function MouseListView({ users }: MouseListViewProps) {
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
          const modelA = a.settings?.mouseModel || '';
          const modelB = b.settings?.mouseModel || '';
          // 値がない場合は最下部に配置
          if (!modelA && modelB) return 1;
          if (modelA && !modelB) return -1;
          compareValue = modelA.localeCompare(modelB);
          break;

        case 'dpi':
          const dpiA = a.settings?.mouseDpi;
          const dpiB = b.settings?.mouseDpi;
          // 値がない場合は最下部に配置
          if (!dpiA && dpiB) return 1;
          if (dpiA && !dpiB) return -1;
          compareValue = (dpiA || 0) - (dpiB || 0);
          break;

        case 'acceleration':
          const accelA = a.settings?.mouseAcceleration ? 1 : 0;
          const accelB = b.settings?.mouseAcceleration ? 1 : 0;
          compareValue = accelA - accelB;
          break;

        case 'rawInput':
          const rawA = a.settings?.rawInput ? 1 : 0;
          const rawB = b.settings?.rawInput ? 1 : 0;
          compareValue = rawA - rawB;
          break;

        case 'cm360':
          const cm360A = a.settings?.cm360;
          const cm360B = b.settings?.cm360;
          // 値がない場合は最下部に配置
          if (!cm360A && cm360B) return 1;
          if (cm360A && !cm360B) return -1;
          compareValue = (cm360A || 0) - (cm360B || 0);
          break;

        case 'windowsSpeed':
          const winSpeedA = a.settings?.windowsSpeed;
          const winSpeedB = b.settings?.windowsSpeed;
          // 値がない場合は最下部に配置
          if (winSpeedA === null || winSpeedA === undefined) {
            if (winSpeedB !== null && winSpeedB !== undefined) return 1;
          }
          if (winSpeedB === null || winSpeedB === undefined) {
            if (winSpeedA !== null && winSpeedA !== undefined) return -1;
          }
          compareValue = (winSpeedA || 0) - (winSpeedB || 0);
          break;

        case 'sensitivity':
          const sensA = a.settings?.gameSensitivity;
          const sensB = b.settings?.gameSensitivity;
          // 値がない場合は最下部に配置
          if (sensA === null || sensA === undefined) {
            if (sensB !== null && sensB !== undefined) return 1;
          }
          if (sensB === null || sensB === undefined) {
            if (sensA !== null && sensA !== undefined) return -1;
          }
          compareValue = (sensA || 0) - (sensB || 0);
          break;

        case 'cursorSpeed':
          const cursorSpeedA = a.settings?.mouseDpi
            ? calculateCursorSpeed(
                a.settings.mouseDpi,
                a.settings.windowsSpeed ?? 10,
                a.settings.rawInput ?? true,
                a.settings.mouseAcceleration ?? false
              ) || 0
            : 0;
          const cursorSpeedB = b.settings?.mouseDpi
            ? calculateCursorSpeed(
                b.settings.mouseDpi,
                b.settings.windowsSpeed ?? 10,
                b.settings.rawInput ?? true,
                b.settings.mouseAcceleration ?? false
              ) || 0
            : 0;
          // 値がない場合は最下部に配置
          if (!cursorSpeedA && cursorSpeedB) return 1;
          if (cursorSpeedA && !cursorSpeedB) return -1;
          compareValue = cursorSpeedA - cursorSpeedB;
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
      const mouseModel = user.settings?.mouseModel?.toLowerCase() || '';
      return displayName.includes(query) || mcid.includes(query) || mouseModel.includes(query);
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

            <h1 className="text-xl md:text-3xl font-bold">マウス設定一覧</h1>
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
            placeholder="プレイヤー / マウス機種で検索..."
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
              <thead className="bg-[rgb(var(--muted))] border-b border-[rgb(var(--border))] sticky top-0 z-20">
              <tr>
                <th
                  className="sticky left-0 z-30 bg-[rgb(var(--muted))] px-4 py-3 text-left font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap border-r border-[rgb(var(--border))] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                  onClick={() => handleSort('player')}
                >
                  プレイヤー <SortIcon columnKey="player" />
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('model')}
                >
                  マウス機種 <SortIcon columnKey="model" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('dpi')}
                >
                  DPI <SortIcon columnKey="dpi" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('acceleration')}
                >
                  マウス加速 <SortIcon columnKey="acceleration" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('rawInput')}
                >
                  RawInput <SortIcon columnKey="rawInput" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('sensitivity')}
                >
                  ゲーム内感度 <SortIcon columnKey="sensitivity" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('cm360')}
                >
                  振り向き <SortIcon columnKey="cm360" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('windowsSpeed')}
                >
                  Win Sens <SortIcon columnKey="windowsSpeed" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('cursorSpeed')}
                >
                  カーソル速度 <SortIcon columnKey="cursorSpeed" />
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

                  {/* マウス機種 */}
                  <td className="px-4 py-3">
                    {user.settings?.mouseModel || '-'}
                  </td>

                  {/* DPI */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.mouseDpi || '-'}
                  </td>

                  {/* マウス加速 */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.mouseAcceleration ? (
                      <span className="text-green-600 dark:text-green-400">ON</span>
                    ) : (
                      <span className="text-[rgb(var(--muted-foreground))]">OFF</span>
                    )}
                  </td>

                  {/* RawInput */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.rawInput ? (
                      <span className="text-green-600 dark:text-green-400">ON</span>
                    ) : (
                      <span className="text-[rgb(var(--muted-foreground))]">OFF</span>
                    )}
                  </td>

                  {/* ゲーム内感度 */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.gameSensitivity !== null && user.settings?.gameSensitivity !== undefined
                      ? `${Math.floor(Number(user.settings.gameSensitivity) * 200)}%`
                      : '-'}
                  </td>

                  {/* 振り向き */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.cm360 ? `${user.settings.cm360}cm` : '-'}
                  </td>

                  {/* Windows速度 */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.windowsSpeed !== null && user.settings?.windowsSpeed !== undefined
                      ? user.settings.windowsSpeed
                      : '-'}
                  </td>

                  {/* カーソル速度 */}
                  <td className="px-4 py-3 text-center">
                    {(() => {
                      if (!user.settings?.mouseDpi) return '-';
                      const cursorSpeed = calculateCursorSpeed(
                        user.settings.mouseDpi,
                        user.settings.windowsSpeed ?? 10,
                        user.settings.rawInput ?? true,
                        user.settings.mouseAcceleration ?? false
                      );
                      return cursorSpeed !== null ? `${cursorSpeed.toLocaleString()}dpi` : '-';
                    })()}
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
