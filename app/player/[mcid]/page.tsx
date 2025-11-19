import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MinecraftAvatar } from '@/components/MinecraftAvatar';
import { HotbarDisplay } from '@/components/HotbarDisplay';
import { getSegmentInfo } from '@/lib/segments';
import dynamic from 'next/dynamic';
import type { PlayerSettings } from '@/types/player';
import type { Metadata } from 'next';

const KeybindingDisplay = dynamic(() => import('@/components/KeybindingDisplay').then(mod => ({ default: mod.KeybindingDisplay })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
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
  const avatarUrl = `https://crafatar.com/avatars/${user.uuid}?size=128&overlay`;

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
          url: avatarUrl,
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
      images: [avatarUrl],
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { mcid } = await params;

  const user = await prisma.user.findUnique({
    where: { mcid },
    include: {
      config: true,
      keybindings: true,
      customKeys: true,
      keyRemaps: true,
      externalTools: true,
      itemLayouts: {
        orderBy: { segment: 'asc' },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // settings を構築
  const settings = user.config;

  const showDisplayName = user.displayName && user.displayName.trim() !== '';

  return (
    <div className="pb-6">
      <div className="mb-8 flex items-center gap-4">
        <MinecraftAvatar uuid={user.uuid} mcid={user.mcid} size={96} />
        <div>
          <h1 className="text-4xl font-bold">{showDisplayName ? user.displayName : user.mcid}</h1>
          {showDisplayName && user.displayName !== user.mcid && (
            <p className="text-[rgb(var(--muted-foreground))] text-lg mt-1">{user.mcid}</p>
          )}
        </div>
      </div>

      {settings ? (
        <>
          <KeybindingDisplay
            settings={settings as PlayerSettings}
            keybindings={user.keybindings}
            customKeys={user.customKeys}
            keyRemaps={user.keyRemaps}
            externalTools={user.externalTools}
          />

          {/* アイテム配置表示 */}
          {user.itemLayouts && user.itemLayouts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">アイテム配置</h2>
              <div className="space-y-8">
                {user.itemLayouts.map((layout) => {
                  const segmentInfo = getSegmentInfo(layout.segment);
                  return (
                    <div key={layout.segment} className="bg-[rgb(var(--muted))] rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">
                        {segmentInfo?.label || layout.segment}
                        {segmentInfo?.description && (
                          <span className="text-sm text-[rgb(var(--muted-foreground))] ml-2">
                            {segmentInfo.description}
                          </span>
                        )}
                      </h3>
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
                        <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <p className="text-sm text-gray-300">{layout.notes}</p>
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
        <div className="text-center py-12 bg-[rgb(var(--muted))] rounded-lg">
          <p className="text-[rgb(var(--muted-foreground))]">
            このプレイヤーはまだ設定を登録していません
          </p>
        </div>
      )}
    </div>
  );
}
