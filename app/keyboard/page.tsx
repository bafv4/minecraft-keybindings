import { prisma } from '@/lib/db';
import dynamic from 'next/dynamic';
import type { User } from '@/types/player';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'キーボード設定一覧 | MCSRer Hotkeys',
  description: 'RTA勢のキーボード設定一覧',
  openGraph: {
    title: 'キーボード設定一覧 | MCSRer Hotkeys',
    description: 'RTA勢のキーボード設定一覧',
  },
  twitter: {
    card: 'summary',
    title: 'キーボード設定一覧 | MCSRer Hotkeys',
    description: 'RTA勢のキーボード設定一覧',
  },
};

const KeyboardListView = dynamic(() => import('@/components/KeyboardListView').then(mod => ({ default: mod.KeyboardListView })), {
  ssr: true,
  loading: () => <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
});

export default async function KeyboardPage() {
  // 設定があるユーザーのみを取得（旧または新スキーマ）
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { settingsLegacy: { isNot: null } },
        { config: { isNot: null } },
      ],
    },
    include: {
      settingsLegacy: true,
      config: true,
    },
  });

  // 新スキーマ優先で settings を構築
  const usersWithSettings = users.map(user => ({
    ...user,
    settings: user.config || user.settingsLegacy,
  }));

  return <KeyboardListView users={usersWithSettings as User[]} />;
}
