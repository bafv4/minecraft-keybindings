import { prisma } from '@/lib/db';
import { MouseListView } from '@/components/MouseListView';
import type { User } from '@/types/player';

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
