import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MinecraftAvatar } from '@/components/MinecraftAvatar';
import { KeybindingDisplay } from '@/components/KeybindingDisplay';

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
          <h1 className="text-3xl font-bold">{user.mcid}</h1>
          <p className="text-gray-600 text-sm font-mono">{user.uuid}</p>
        </div>
      </div>

      {user.settings ? (
        <KeybindingDisplay settings={user.settings} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            このプレイヤーはまだ設定を登録していません
          </p>
        </div>
      )}
    </div>
  );
}
