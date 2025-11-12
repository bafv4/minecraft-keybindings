import { prisma } from '@/lib/db';
import { PlayerListView } from '@/components/PlayerListView';
import type { User } from '@/types/player';

export default async function HomePage() {
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

  return <PlayerListView users={users as User[]} />;
}
