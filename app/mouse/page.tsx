import dynamic from 'next/dynamic';
import type { User } from '@/types/player';
import type { Metadata } from 'next';
import { getMousePageData } from '@/lib/playerData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'マウス設定一覧 | MCSRer Hotkeys',
  description: 'RTA勢のマウス設定一覧',
  openGraph: {
    title: 'マウス設定一覧 | MCSRer Hotkeys',
    description: 'RTA勢のマウス設定一覧',
  },
  twitter: {
    card: 'summary',
    title: 'マウス設定一覧 | MCSRer Hotkeys',
    description: 'RTA勢のマウス設定一覧',
  },
};

const MouseListView = dynamic(() => import('@/components/MouseListView').then(mod => ({ default: mod.MouseListView })), {
  ssr: true,
  loading: () => <div className="flex items-center justify-center py-12"><LoadingSpinner size="md" /></div>
});

export default async function MousePage() {
  const users = await getMousePageData();

  return <MouseListView users={users as User[]} />;
}
