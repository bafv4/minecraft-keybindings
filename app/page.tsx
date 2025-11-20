import dynamic from 'next/dynamic';
import type { User } from '@/types/player';
import type { Metadata } from 'next';
import { getPlayersList } from '@/lib/playerData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
  loading: () => <div className="flex items-center justify-center py-12"><LoadingSpinner size="md" /></div>
});

export default async function HomePage() {
  const users = await getPlayersList();

  return <PlayerListView users={users as User[]} />;
}
