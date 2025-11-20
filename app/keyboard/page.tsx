import dynamic from 'next/dynamic';
import type { User } from '@/types/player';
import type { Metadata } from 'next';
import { getKeyboardStatsData } from '@/lib/playerData';
import { KeyboardListSkeleton } from '@/components/KeyboardListSkeleton';

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
  loading: () => <KeyboardListSkeleton />
});

export default async function KeyboardPage() {
  const users = await getKeyboardStatsData();

  return <KeyboardListView users={users as User[]} />;
}
