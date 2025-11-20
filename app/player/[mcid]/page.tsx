import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MinecraftAvatar } from '@/components/MinecraftAvatar';
import { ItemLayoutsDisplay } from '@/components/ItemLayoutsDisplay';
import { getPlayerData } from '@/lib/playerData';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { KeybindingDisplaySkeleton } from '@/components/KeybindingDisplaySkeleton';

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
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fullAvatarUrl = `${baseUrl}${avatarUrl}`;

  return {
    title: `${displayName} | MCSRer Hotkeys`,
    description: `${displayName} (${user.mcid}) のキーボード・マウス設定`,
    icons: {
      icon: [
        { url: fullAvatarUrl, type: 'image/png' },
      ],
      apple: [
        { url: fullAvatarUrl, type: 'image/png' },
      ],
    },
    openGraph: {
      title: `${displayName} | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定`,
      images: [
        {
          url: fullAvatarUrl,
          width: 128,
          height: 128,
          alt: `${displayName} のアバター`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${displayName} | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定`,
      images: [fullAvatarUrl],
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { mcid } = await params;

  const playerData = await getPlayerData(mcid);

  if (!playerData) {
    notFound();
  }

  const { user, settings, rawKeybindings, rawCustomKeys, rawKeyRemaps, rawExternalTools, itemLayouts } = playerData;

  const showDisplayName = user.displayName && user.displayName.trim() !== '';

  // ゲーム設定と環境設定の存在チェック
  const hasGameSettings = settings && (
    settings.toggleSprint !== null ||
    settings.toggleSneak !== null ||
    settings.autoJump !== null
  );
  const hasPlayerConfig = settings && (
    settings.gameLanguage ||
    settings.mouseModel ||
    settings.keyboardModel ||
    settings.notes
  );

  // 言語コードを言語名に変換
  const getLanguageName = (code: string | null | undefined): string => {
    if (!code) return '-';
    const languageMap: Record<string, string> = {
      'ja_jp': '日本語',
      'en_us': 'English (US)',
      'en_gb': 'English (UK)',
      'zh_cn': '简体中文',
      'zh_tw': '繁體中文',
      'ko_kr': '한국어',
      'fr_fr': 'Français',
      'de_de': 'Deutsch',
      'es_es': 'Español',
      'pt_br': 'Português (Brasil)',
      'ru_ru': 'Русский',
    };
    return languageMap[code.toLowerCase()] || code;
  };

  return (
    <div className="pb-6 space-y-8">
      {/* プレイヤーヘッダー */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm p-6 space-y-6">
        {/* プレイヤー情報 */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-30"></div>
            <MinecraftAvatar uuid={user.uuid} mcid={user.mcid} size={96} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              {showDisplayName ? user.displayName : user.mcid}
            </h1>
            {showDisplayName && user.displayName !== user.mcid && (
              <p className="text-muted-foreground text-lg mt-1">{user.mcid}</p>
            )}
          </div>
        </div>

        {/* 環境設定とゲーム設定 */}
        {(hasPlayerConfig || hasGameSettings) && (
          <div className="border-t border-border/50 pt-6 space-y-4">
            {/* 環境設定 */}
            {hasPlayerConfig && (
              <div className="space-y-3">
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

            {/* ゲーム設定 */}
            {hasGameSettings && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ゲーム設定</h3>
                <div className="flex flex-wrap gap-3">
                  {settings.toggleSprint !== null && (
                    <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                      settings.toggleSprint
                        ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-300'
                    }`}>
                      Toggle Sprint: {settings.toggleSprint ? 'ON' : 'OFF'}
                    </div>
                  )}
                  {settings.toggleSneak !== null && (
                    <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                      settings.toggleSneak
                        ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-300'
                    }`}>
                      Toggle Sneak: {settings.toggleSneak ? 'ON' : 'OFF'}
                    </div>
                  )}
                  {settings.autoJump !== null && (
                    <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                      settings.autoJump
                        ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-300'
                    }`}>
                      Auto Jump: {settings.autoJump ? 'ON' : 'OFF'}
                    </div>
                  )}
                </div>
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
          <ItemLayoutsDisplay itemLayouts={itemLayouts} />
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
