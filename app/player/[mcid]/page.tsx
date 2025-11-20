import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MinecraftAvatar } from '@/components/MinecraftAvatar';
import { HotbarDisplay } from '@/components/HotbarDisplay';
import { getSegmentInfo } from '@/lib/segments';
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

  return (
    <div className="pb-6 space-y-8">
      {/* プレイヤーヘッダー */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent rounded-2xl border border-border shadow-sm p-6">
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
          {itemLayouts && itemLayouts.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">アイテム配置</h2>
              <div className="space-y-4">
                {itemLayouts.map((layout: any) => {
                  const segmentInfo = getSegmentInfo(layout.segment);
                  return (
                    <div key={layout.segment} className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {segmentInfo?.label || layout.segment}
                        </h3>
                        {segmentInfo?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {segmentInfo.description}
                          </p>
                        )}
                      </div>
                      <HotbarDisplay
                        slot1={layout.slot1}
                        slot2={layout.slot2}
                        slot3={layout.slot3}
                        slot4={layout.slot4}
                        slot5={layout.slot5}
                        slot6={layout.slot6}
                        slot7={layout.slot7}
                        slot8={layout.slot8}
                        slot9={layout.slot9}
                        offhand={layout.offhand}
                      />
                      {layout.notes && (
                        <div className="p-4 bg-muted/50 rounded-xl border border-border">
                          <p className="text-sm">{layout.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
