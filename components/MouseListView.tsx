'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import type { User } from '@/types/player';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface MouseListViewProps {
  users: User[];
}

type SortKey = 'player' | 'model' | 'dpi' | 'acceleration' | 'rawInput' | 'cm360' | 'windowsSpeed' | 'sensitivity';
type SortOrder = 'asc' | 'desc';

export function MouseListView({ users }: MouseListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
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
          compareValue = modelA.localeCompare(modelB);
          break;

        case 'dpi':
          const dpiA = a.settings?.mouseDpi || 0;
          const dpiB = b.settings?.mouseDpi || 0;
          compareValue = dpiA - dpiB;
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
          const cm360A = a.settings?.cm360 || 0;
          const cm360B = b.settings?.cm360 || 0;
          compareValue = cm360A - cm360B;
          break;

        case 'windowsSpeed':
          const winSpeedA = a.settings?.windowsSpeed || 0;
          const winSpeedB = b.settings?.windowsSpeed || 0;
          compareValue = winSpeedA - winSpeedB;
          break;

        case 'sensitivity':
          const sensA = a.settings?.gameSensitivity || 0;
          const sensB = b.settings?.gameSensitivity || 0;
          compareValue = sensA - sensB;
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
    <div className="space-y-6">
      {/* ヘッダーと検索 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">マウス設定一覧</h1>
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
            placeholder="プレイヤー / マウス機種で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
          />
        </div>
      </div>

      {/* テーブル */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
          <p className="text-[rgb(var(--muted-foreground))]">
            {searchQuery ? '検索結果が見つかりませんでした' : '登録プレイヤーなし'}
          </p>
        </div>
      ) : (
        <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgb(var(--muted))] border-b border-[rgb(var(--border))]">
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
                  マウス機種 <SortIcon columnKey="model" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('dpi')}
                >
                  DPI <SortIcon columnKey="dpi" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('acceleration')}
                >
                  マウス加速 <SortIcon columnKey="acceleration" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('rawInput')}
                >
                  RawInput <SortIcon columnKey="rawInput" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('cm360')}
                >
                  振り向き <SortIcon columnKey="cm360" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('windowsSpeed')}
                >
                  Windows速度 <SortIcon columnKey="windowsSpeed" />
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-[rgb(var(--muted))]/80 transition-colors"
                  onClick={() => handleSort('sensitivity')}
                >
                  カーソル速度 <SortIcon columnKey="sensitivity" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.uuid}
                  className="border-b border-[rgb(var(--border))] last:border-b-0 hover:bg-[rgb(var(--muted))]/30 transition-colors"
                >
                  {/* プレイヤー */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/player/${user.mcid}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <MinecraftAvatar uuid={user.uuid} size={32} />
                      <div>
                        <div className="font-medium">{user.displayName || user.mcid}</div>
                        {user.displayName && (
                          <div className="text-xs text-[rgb(var(--muted-foreground))]">
                            {user.mcid}
                          </div>
                        )}
                      </div>
                    </Link>
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
                      <span className="text-green-600 dark:text-green-400">有</span>
                    ) : (
                      <span className="text-[rgb(var(--muted-foreground))]">無</span>
                    )}
                  </td>

                  {/* RawInput */}
                  <td className="px-4 py-3 text-center">
                    {user.settings?.rawInput ? (
                      <span className="text-green-600 dark:text-green-400">有</span>
                    ) : (
                      <span className="text-[rgb(var(--muted-foreground))]">無</span>
                    )}
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
                    {user.settings?.gameSensitivity !== null && user.settings?.gameSensitivity !== undefined
                      ? `${user.settings.gameSensitivity}%`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
