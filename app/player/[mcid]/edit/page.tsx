import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import dynamic from 'next/dynamic';
import type { PlayerSettings } from '@/types/player';
import type { Metadata } from 'next';

const KeybindingEditor = dynamic(() => import('@/components/KeybindingEditor').then(mod => ({ default: mod.KeybindingEditor })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
});

const ItemLayoutEditor = dynamic(() => import('@/components/ItemLayoutEditor').then(mod => ({ default: mod.ItemLayoutEditor })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
});

interface EditPageProps {
  params: Promise<{
    mcid: string;
  }>;
}

export async function generateMetadata({ params }: EditPageProps): Promise<Metadata> {
  const { mcid } = await params;
  const user = await prisma.user.findUnique({
    where: { mcid },
  });

  if (!user) {
    return {
      title: '設定を編集 | MCSRer Hotkeys',
    };
  }

  const displayName = user.displayName && user.displayName.trim() !== '' ? user.displayName : user.mcid;
  const avatarUrl = `https://crafatar.com/avatars/${user.uuid}?size=128&overlay`;

  return {
    title: `${displayName} の設定を編集 | MCSRer Hotkeys`,
    description: `${displayName} (${user.mcid}) のキーボード・マウス設定を編集`,
    icons: {
      icon: [
        { url: avatarUrl, type: 'image/png' },
      ],
      apple: [
        { url: avatarUrl, type: 'image/png' },
      ],
    },
    openGraph: {
      title: `${displayName} の設定を編集 | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定を編集`,
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
      title: `${displayName} の設定を編集 | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定を編集`,
      images: [avatarUrl],
    },
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const session = await auth();
  const { mcid } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  // 自分の設定のみ編集可能
  if (session.user.mcid !== mcid) {
    redirect(`/player/${mcid}`);
  }

  const user = await prisma.user.findUnique({
    where: { mcid },
    include: {
      settingsLegacy: true,
      config: true,
      keybindings: true,
    },
  });

  if (!user) {
    redirect('/');
  }

  // 新スキーマ優先で settings を構築
  const settings = user.config || user.settingsLegacy;

  return (
    <div className="pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">設定を編集</h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          {user.displayName || user.mcid} ({user.mcid}) の操作設定を編集します
        </p>
      </div>

      {/* キーバインド設定 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">キーバインド設定</h2>
        <KeybindingEditor
          initialSettings={(settings as PlayerSettings) || undefined}
          uuid={user.uuid}
          mcid={user.mcid}
          displayName={user.displayName || ''}
        />
      </div>

      {/* アイテム配置設定 */}
      <div className="border-t border-gray-700 pt-12">
        <h2 className="text-2xl font-bold mb-6">アイテム配置設定</h2>
        <div className="bg-[rgb(var(--muted))] rounded-lg p-6">
          <ItemLayoutEditor uuid={user.uuid} />
        </div>
      </div>
    </div>
  );
}
