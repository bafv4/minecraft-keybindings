import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MinecraftAvatar } from '@/components/MinecraftAvatar';
import { KeybindingDisplay } from '@/components/KeybindingDisplay';
import type { PlayerSettings } from '@/types/player';

interface PlayerPageProps {
  params: Promise<{
    mcid: string;
  }>;
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

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <MinecraftAvatar uuid={user.uuid} mcid={user.mcid} size={96} />
        <div>
          <h1 className="text-3xl font-bold">{user.displayName}</h1>
          <p className="text-[rgb(var(--muted-foreground))] text-sm">{user.mcid}</p>
          <p className="text-[rgb(var(--muted-foreground))] text-xs font-mono">{user.uuid}</p>
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
