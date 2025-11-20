import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import { formatKeyName } from '@/lib/utils';
import type { User } from '@/types/player';

interface PlayerListItemProps {
  user: User;
}

export function PlayerListItem({ user }: PlayerListItemProps) {
  const { mcid, uuid, displayName, settings } = user;
  const showDisplayName = displayName && displayName.trim() !== '';

  return (
    <Link
      href={`/player/${mcid}`}
      className="block border-b border-border hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:border-primary/20 active:from-primary/10 active:to-secondary/10 transition-all duration-200 last:border-b-0 group"
    >
      {/* デスクトップ表示: 1行 */}
      <div className="hidden lg:grid lg:grid-cols-[180px_240px_repeat(8,minmax(60px,1fr))] gap-3 px-4 py-3 items-center text-xs">
        {/* プレイヤー */}
        <div className="flex items-center gap-2">
          <MinecraftAvatar uuid={uuid} mcid={mcid} size={32} />
          <div className="font-semibold truncate flex-1 min-w-0">
            <div className="truncate text-sm group-hover:text-primary transition-colors">
              {showDisplayName ? displayName : mcid}
            </div>
            {showDisplayName && displayName !== mcid && (
              <div className="text-[10px] text-muted-foreground truncate">
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

      {/* モバイル/タブレット表示: 改良されたレイアウト */}
      <div className="lg:hidden px-3 py-2 space-y-2 text-xs">
        {/* プレイヤー情報 */}
        <div className="flex items-center gap-2.5">
          <MinecraftAvatar uuid={uuid} mcid={mcid} size={36} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
              {showDisplayName ? displayName : mcid}
            </div>
            {showDisplayName && displayName !== mcid && (
              <div className="text-[10px] text-muted-foreground truncate">
                {mcid}
              </div>
            )}
            {/* マウス設定 - アバターの下に配置 */}
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
              {settings?.gameSensitivity && (
                <span className="inline-flex items-center gap-1">
                  <span className="opacity-70">感度</span>
                  <span className="text-foreground font-medium">
                    {Math.floor(Number(settings.gameSensitivity) * 200)}%
                  </span>
                </span>
              )}
              {settings?.cm360 && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="opacity-70">振り向き</span>
                    <span className="text-foreground font-medium">{settings.cm360}cm</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* キーバインド */}
        <div className="space-y-1">
          {/* ホットバー */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">ホットバー</span>
            <div className="flex gap-0.5 overflow-x-auto flex-1 scrollbar-hide">
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
          </div>

          {/* その他のキー */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">その他</span>
            <div className="flex gap-1 flex-wrap flex-1">
              <KeyBadgeWithLabel keyName={settings?.swapHands || 'key.keyboard.f'} label="オフハンド" />
              <KeyBadgeWithLabel keyName={settings?.sneak || 'key.keyboard.left.shift'} label="スニーク" />
              <KeyBadgeWithLabel keyName={settings?.sprint || 'key.keyboard.left.control'} label="ダッシュ" />
              <KeyBadgeWithLabel keyName={settings?.jump || 'key.keyboard.space'} label="ジャンプ" />
              <KeyBadgeWithLabel keyName={settings?.inventory || 'key.keyboard.e'} label="インベ" />
              <KeyBadgeWithLabel keyName={settings?.drop || 'key.keyboard.q'} label="ドロップ" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function KeyBadge({ keyName, size = 'sm' }: { keyName: string | string[]; size?: 'xs' | 'sm' }) {
  const formattedKey = Array.isArray(keyName)
    ? keyName.map(k => formatKeyName(k)).join(', ')
    : formatKeyName(keyName);

  return (
    <kbd
      className={`
        inline-flex items-center justify-center rounded-md font-mono bg-muted border border-border
        shadow-sm group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors
        ${size === 'xs' ? 'px-1 py-0.5 text-[9px] min-w-[18px]' : 'px-1 py-0.5 text-[10px]'}
      `}
    >
      {formattedKey}
    </kbd>
  );
}

function KeyBadgeWithLabel({ keyName, label }: { keyName: string | string[]; label: string }) {
  const formattedKey = Array.isArray(keyName)
    ? keyName.map(k => formatKeyName(k)).join(', ')
    : formatKeyName(keyName);

  return (
    <div className="inline-flex items-center gap-1 bg-muted border border-border rounded-md px-1.5 py-0.5 text-[9px]">
      <span className="text-muted-foreground">{label}</span>
      <kbd className="font-mono font-medium">{formattedKey}</kbd>
    </div>
  );
}
