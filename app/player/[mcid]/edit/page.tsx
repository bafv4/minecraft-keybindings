import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import dynamic from 'next/dynamic';
import type { PlayerSettings } from '@/types/player';
import type { Metadata } from 'next';
import { normalizeKeyCode } from '@/lib/keyConversion';

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
  const avatarUrl = `/api/avatar?uuid=${user.uuid}&size=128`;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fullAvatarUrl = `${baseUrl}${avatarUrl}`;

  return {
    title: `${displayName} の設定を編集 | MCSRer Hotkeys`,
    description: `${displayName} (${user.mcid}) のキーボード・マウス設定を編集`,
    icons: {
      icon: [
        { url: fullAvatarUrl, type: 'image/png' },
      ],
      apple: [
        { url: fullAvatarUrl, type: 'image/png' },
      ],
    },
    openGraph: {
      title: `${displayName} の設定を編集 | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定を編集`,
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
      title: `${displayName} の設定を編集 | MCSRer Hotkeys`,
      description: `${displayName} (${user.mcid}) のキーボード・マウス設定を編集`,
      images: [fullAvatarUrl],
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

  // 全データを並列取得
  const [user, keybindings, keyRemaps, externalTools, customKeys] = await Promise.all([
    prisma.user.findUnique({
      where: { mcid },
      include: {
        config: true,
      },
    }),
    prisma.keybinding.findMany({
      where: { user: { mcid } },
    }),
    prisma.keyRemap.findMany({
      where: { user: { mcid } },
    }),
    prisma.externalTool.findMany({
      where: { user: { mcid } },
    }),
    prisma.customKey.findMany({
      where: { user: { mcid } },
    }),
  ]);

  if (!user) {
    redirect('/');
  }

  // Keybindingテーブルのデータを PlayerSettings 形式に変換
  const keybindingMap: { [action: string]: string | string[] } = {};
  const additionalSettingsMap: { [action: string]: string | string[] } = {};

  if (keybindings && keybindings.length > 0) {
    // アクションごとにキーコードをグループ化
    const grouped = keybindings.reduce((acc, kb) => {
      if (!acc[kb.action]) {
        acc[kb.action] = [];
      }
      acc[kb.action].push(kb.keyCode);
      return acc;
    }, {} as { [action: string]: string[] });

    // 配列が1つの要素の場合は文字列に、複数の場合は配列のまま
    Object.entries(grouped).forEach(([action, keyCodes]) => {
      const value = keyCodes.length === 1 ? keyCodes[0] : keyCodes;

      // reset、playerListはadditionalSettingsに分類
      if (action === 'reset' || action === 'playerList') {
        additionalSettingsMap[action] = value;
      } else {
        keybindingMap[action] = value;
      }
    });
  }

  // KeyRemapを旧形式のオブジェクトに変換（キーコードを正規化）
  const remappings: { [key: string]: string } = {};
  keyRemaps.forEach(remap => {
    if (remap.targetKey) {
      // キーコードをWeb標準形式に正規化（Minecraft形式の既存データにも対応）
      const normalizedKey = normalizeKeyCode(remap.sourceKey);
      remappings[normalizedKey] = remap.targetKey;
    }
  });

  // ExternalToolを旧形式のオブジェクトに変換（キーコードを正規化）
  const externalToolsMap: { [key: string]: string } = {};
  externalTools.forEach(tool => {
    // キーコードをWeb標準形式に正規化（Minecraft形式の既存データにも対応）
    const normalizedKey = normalizeKeyCode(tool.triggerKey);
    externalToolsMap[normalizedKey] = tool.actionName;
  });

  // CustomKeyを旧形式の配列に変換
  const customKeysArray = customKeys.map(ck => ({
    id: ck.keyCode,
    label: ck.keyName,
    keyCode: ck.keyCode,
  }));

  // settings を構築（configとkeybindingsをマージ）
  const settings: PlayerSettings | undefined = user.config ? {
    ...user.config,
    ...keybindingMap,
    remappings,
    externalTools: externalToolsMap,
    additionalSettings: {
      ...additionalSettingsMap,
      customKeys: customKeysArray.length > 0 ? { keys: customKeysArray } : undefined,
    },
  } as PlayerSettings : undefined;

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
          initialSettings={settings}
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
