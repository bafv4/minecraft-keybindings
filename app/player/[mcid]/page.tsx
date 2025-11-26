import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getPlayerData } from '@/lib/playerData';
import { PlayerPageContent } from '@/components/PlayerPageContent';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

const KeybindingDisplay = dynamic(() => import('@/components/KeybindingDisplay').then(mod => ({ default: mod.KeybindingDisplay })), {
  ssr: true,
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

  return (
    <PlayerPageContent
      user={{
        uuid: user.uuid,
        mcid: user.mcid,
        displayName: user.displayName,
        isGuest: user.isGuest,
      }}
      settings={settings}
      rawKeybindings={rawKeybindings}
      rawCustomKeys={rawCustomKeys}
      rawKeyRemaps={rawKeyRemaps}
      rawExternalTools={rawExternalTools}
      itemLayouts={itemLayouts}
      searchCrafts={searchCrafts}
    />
  );
}
