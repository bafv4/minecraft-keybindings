import dynamic from 'next/dynamic';
import type { User } from '@/types/player';
import type { Metadata } from 'next';
import { getPlayersList } from '@/lib/playerData';
import { PlayerListSkeleton } from '@/components/PlayerListSkeleton';

// ISR: 5分ごとに再生成
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'プレイヤー一覧 | MCSRer Hotkeys',
  description: 'RTA勢の設定はこうなっている！',
  openGraph: {
    title: 'プレイヤー一覧 | MCSRer Hotkeys',
    description: 'RTA勢の設定はこうなっている！',
  },
  twitter: {
    card: 'summary',
    title: 'プレイヤー一覧 | MCSRer Hotkeys',
    description: 'RTA勢の設定はこうなっている！',
  },
};

const PlayerListView = dynamic(() => import('@/components/PlayerListView').then(mod => ({ default: mod.PlayerListView })), {
  ssr: true,
  loading: () => <PlayerListSkeleton />
});

export default async function HomePage() {
  const users = await getPlayersList();

  return <PlayerListView users={users as User[]} />;
}
