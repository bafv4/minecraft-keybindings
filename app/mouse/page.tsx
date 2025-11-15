import { prisma } from '@/lib/db';
import dynamic from 'next/dynamic';
import type { User } from '@/types/player';
import type { Metadata } from 'next';

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
  loading: () => <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
});

export default async function MousePage() {
  // 設定があるユーザーのみを取得
  const users = await prisma.user.findMany({
    where: {
      settings: {
        isNot: null,
      },
    },
    include: {
      settings: true,
    },
  });

  return <MouseListView users={users as User[]} />;
}
