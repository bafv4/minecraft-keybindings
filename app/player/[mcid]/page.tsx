import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MinecraftAvatar } from '@/components/MinecraftAvatar';
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
    include: { settings: true },
  });

  if (!user) {
    notFound();
  }

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

      {user.settings ? (
        <KeybindingDisplay settings={user.settings as PlayerSettings} />
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
