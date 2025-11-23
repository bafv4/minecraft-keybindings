import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MinecraftAvatar } from '@/components/MinecraftAvatar';
import { ItemLayoutsDisplay } from '@/components/ItemLayoutsDisplay';
import { SearchCraftDisplay } from '@/components/SearchCraftDisplay';
import { getPlayerData } from '@/lib/playerData';
import { getLanguageName } from '@/lib/languages';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { KeybindingDisplaySkeleton } from '@/components/KeybindingDisplaySkeleton';
import { ShareButton } from '@/components/ShareButton';

const KeybindingDisplay = dynamic(() => import('@/components/KeybindingDisplay').then(mod => ({ default: mod.KeybindingDisplay })), {
  ssr: true,
  loading: () => <KeybindingDisplaySkeleton />
});

interface PlayerPageProps {
  params: Promise<{
    mcid: string;
  }>;
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { mcid } = await params;
  const user = await prisma.user.findUnique({
    where: { mcid },
  });

  if (!user) {
    return {
      title: 'プレイヤーが見つかりません | MCSRer Hotkeys',
    };
  }

  const displayName = user.displayName && user.displayName.trim() !== '' ? user.displayName : user.mcid;
  const avatarUrl = `/api/avatar?uuid=${user.uuid}&size=128`;
  const ogImageUrl = `/player/${mcid}/opengraph-image`;

  return {
    title: `${displayName} | MCSRer Hotkeys`,
    description: `${displayName} (${user.mcid}) のキーボード・マウス設定`,
    icons: {
      icon: [
        { url: avatarUrl, type: 'image/png' },
      ],
      apple: [
        { url: avatarUrl, type: 'image/png' },
      ],
    },
    openGraph: {
      title: `${displayName} | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} のキーボード・マウス設定`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定`,
      images: [ogImageUrl],
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { mcid } = await params;

  const playerData = await getPlayerData(mcid);

  if (!playerData) {
    notFound();
  }

  const { user, settings, rawKeybindings, rawCustomKeys, rawKeyRemaps, rawExternalTools, itemLayouts, searchCrafts } = playerData;

  const showDisplayName = user.displayName && user.displayName.trim() !== '';

  // 環境設定の存在チェック
  const hasPlayerConfig = settings && (
    settings.gameLanguage ||
    settings.mouseModel ||
    settings.keyboardModel ||
    settings.notes
  );

  return (
    <div className="pb-6 space-y-8">
      {/* プレイヤーヘッダー */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm p-6 space-y-6 relative">
        {/* 共有ボタン */}
        <div className="absolute top-4 right-4">
          <ShareButton mcid={mcid} />
        </div>

        {/* プレイヤー情報 */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-30"></div>
            <MinecraftAvatar uuid={user.uuid} mcid={user.mcid} size={96} priority />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold text-foreground">
                {showDisplayName ? user.displayName : user.mcid}
              </h1>
              {user.isGuest && (
                <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold">
                  GUEST
                </span>
              )}
            </div>
            {showDisplayName && user.displayName !== user.mcid && (
              <p className="text-muted-foreground text-lg mt-1">{user.mcid}</p>
            )}
          </div>
        </div>

        {/* 環境設定 */}
        {hasPlayerConfig && (
          <div className="border-t border-border/50 pt-6 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">環境</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {settings.gameLanguage && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">言語:</span>
                  <span className="font-medium">{getLanguageName(settings.gameLanguage)}</span>
                </div>
              )}
              {settings.mouseModel && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">マウス:</span>
                  <span className="font-medium">{settings.mouseModel}</span>
                </div>
              )}
              {settings.keyboardModel && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">キーボード:</span>
                  <span className="font-medium">{settings.keyboardModel}</span>
                </div>
              )}
            </div>
            {settings.notes && (
              <div className="bg-[rgb(var(--card))] p-5 rounded-lg border-2 border-[rgb(var(--border))] shadow-md">
                <p className="text-sm font-semibold text-muted-foreground mb-2">コメント</p>
                <p className="text-sm whitespace-pre-wrap">{settings.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {settings ? (
        <>
          <KeybindingDisplay
            settings={settings}
            keybindings={rawKeybindings}
            customKeys={rawCustomKeys}
            keyRemaps={rawKeyRemaps}
            externalTools={rawExternalTools}
          />

          {/* アイテム配置表示 */}
          <ItemLayoutsDisplay
            itemLayouts={itemLayouts}
            keybinds={{
              hotbar1: settings.hotbar1,
              hotbar2: settings.hotbar2,
              hotbar3: settings.hotbar3,
              hotbar4: settings.hotbar4,
              hotbar5: settings.hotbar5,
              hotbar6: settings.hotbar6,
              hotbar7: settings.hotbar7,
              hotbar8: settings.hotbar8,
              hotbar9: settings.hotbar9,
              swapHands: settings.swapHands,
            }}
            customKeys={rawCustomKeys}
          />

          {/* サーチクラフト表示 */}
          <SearchCraftDisplay
            searchCrafts={searchCrafts}
            keyRemaps={rawKeyRemaps}
            fingerAssignments={settings.fingerAssignments || {}}
          />
        </>
      ) : (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            設定が登録されていません
          </p>
          <p className="text-sm text-muted-foreground">
            このプレイヤーはまだキーボード・マウス設定を登録していません
          </p>
        </div>
      )}
    </div>
  );
}
