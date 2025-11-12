import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import { formatKeyName } from '@/lib/utils';
import type { User } from '@/types/player';

interface PlayerListItemProps {
  user: User;
}

export function PlayerListItem({ user }: PlayerListItemProps) {
  const { mcid, uuid, displayName, settings } = user;

  return (
    <Link
      href={`/player/${mcid}`}
      className="block border-b border-[rgb(var(--border))] hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500/40 active:bg-blue-100 dark:active:bg-blue-900/40 active:border-blue-500/60 transition-all duration-200 last:border-b-0 group"
    >
      {/* デスクトップ表示: 1行 */}
      <div className="hidden lg:grid lg:grid-cols-[180px_240px_repeat(8,minmax(60px,1fr))] gap-3 px-4 py-3 items-center text-xs">
        {/* プレイヤー */}
        <div className="flex items-center gap-2">
          <MinecraftAvatar uuid={uuid} mcid={mcid} size={32} />
          <div className="font-semibold truncate flex-1 min-w-0">
            <div className="truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{displayName}</div>
            {displayName !== mcid && (
              <div className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">
                {mcid}
              </div>
            )}
          </div>
        </div>

        {/* ホットバー */}
        <div className="flex gap-0.5 whitespace-nowrap">
          {[
            settings?.hotbar1 || 'key.keyboard.1',
            settings?.hotbar2 || 'key.keyboard.2',
            settings?.hotbar3 || 'key.keyboard.3',
            settings?.hotbar4 || 'key.keyboard.4',
            settings?.hotbar5 || 'key.keyboard.5',
            settings?.hotbar6 || 'key.keyboard.6',
            settings?.hotbar7 || 'key.keyboard.7',
            settings?.hotbar8 || 'key.keyboard.8',
            settings?.hotbar9 || 'key.keyboard.9',
          ].map((keyName, i) => (
            <KeyBadge key={i} keyName={keyName} />
          ))}
        </div>

        {/* オフハンド */}
        <div className="text-center">
          <KeyBadge keyName={settings?.swapHands || 'key.keyboard.f'} />
        </div>

        {/* スニーク */}
        <div className="text-center">
          <KeyBadge keyName={settings?.sneak || 'key.keyboard.left.shift'} />
        </div>

        {/* ダッシュ */}
        <div className="text-center">
          <KeyBadge keyName={settings?.sprint || 'key.keyboard.left.control'} />
        </div>

        {/* ジャンプ */}
        <div className="text-center">
          <KeyBadge keyName={settings?.jump || 'key.keyboard.space'} />
        </div>

        {/* インベントリ */}
        <div className="text-center">
          <KeyBadge keyName={settings?.inventory || 'key.keyboard.e'} />
        </div>

        {/* ドロップ */}
        <div className="text-center">
          <KeyBadge keyName={settings?.drop || 'key.keyboard.q'} />
        </div>

        {/* 感度 */}
        <div className="text-center">
          {settings?.gameSensitivity ? `${Math.floor(Number(settings.gameSensitivity) * 200)}%` : '-'}
        </div>

        {/* 振り向き */}
        <div className="text-center">
          {settings?.cm360 ? `${settings.cm360}cm` : '-'}
        </div>
      </div>

      {/* モバイル/タブレット表示: 2行 */}
      <div className="lg:hidden px-4 py-3 space-y-2 text-xs">
        {/* 1行目: プレイヤー情報 + マウス設定 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MinecraftAvatar uuid={uuid} mcid={mcid} size={32} />
            <div className="font-semibold truncate flex-1 min-w-0">
              <div className="truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{displayName}</div>
              {displayName !== mcid && (
                <div className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">
                  {mcid}
                </div>
              )}
            </div>
          </div>

          {/* マウス設定 */}
          <div className="flex items-center gap-2 text-[10px] text-[rgb(var(--muted-foreground))] flex-shrink-0">
            {settings?.gameSensitivity && (
              <span>
                感度 <span className="text-[rgb(var(--foreground))] font-semibold">{Math.floor(Number(settings.gameSensitivity) * 200)}%</span>
              </span>
            )}
            {settings?.cm360 && (
              <span>
                振り向き <span className="text-[rgb(var(--foreground))] font-semibold">{settings.cm360}cm</span>
              </span>
            )}
          </div>
        </div>

        {/* 2行目: キーバインド */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* ホットバー */}
          <div className="flex gap-0.5 flex-shrink-0">
            {[
              settings?.hotbar1 || 'key.keyboard.1',
              settings?.hotbar2 || 'key.keyboard.2',
              settings?.hotbar3 || 'key.keyboard.3',
              settings?.hotbar4 || 'key.keyboard.4',
              settings?.hotbar5 || 'key.keyboard.5',
              settings?.hotbar6 || 'key.keyboard.6',
              settings?.hotbar7 || 'key.keyboard.7',
              settings?.hotbar8 || 'key.keyboard.8',
              settings?.hotbar9 || 'key.keyboard.9',
            ].map((keyName, i) => (
              <KeyBadge key={i} keyName={keyName} size="xs" />
            ))}
          </div>

          {/* セパレーター */}
          <div className="h-4 w-px bg-[rgb(var(--border))] flex-shrink-0" />

          {/* オフハンド */}
          <KeyBadge keyName={settings?.swapHands || 'key.keyboard.f'} size="xs" />

          {/* スニーク */}
          <KeyBadge keyName={settings?.sneak || 'key.keyboard.left.shift'} size="xs" />

          {/* ダッシュ */}
          <KeyBadge keyName={settings?.sprint || 'key.keyboard.left.control'} size="xs" />

          {/* ジャンプ */}
          <KeyBadge keyName={settings?.jump || 'key.keyboard.space'} size="xs" />

          {/* インベントリ */}
          <KeyBadge keyName={settings?.inventory || 'key.keyboard.e'} size="xs" />

          {/* ドロップ */}
          <KeyBadge keyName={settings?.drop || 'key.keyboard.q'} size="xs" />
        </div>
      </div>
    </Link>
  );
}

function KeyBadge({ keyName, size = 'sm' }: { keyName: string; size?: 'xs' | 'sm' }) {
  const formattedKey = formatKeyName(keyName);

  return (
    <kbd
      className={`
        inline-flex items-center justify-center rounded font-mono bg-[rgb(var(--muted))] border border-[rgb(var(--border))]
        ${size === 'xs' ? 'px-1 py-0.5 text-[9px]' : 'px-1 py-0.5 text-[10px]'}
      `}
    >
      {formattedKey}
    </kbd>
  );
}
