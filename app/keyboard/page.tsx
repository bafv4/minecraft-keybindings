import { prisma } from '@/lib/db';
import { KeyboardListView } from '@/components/KeyboardListView';
import type { User } from '@/types/player';

export default async function KeyboardPage() {
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

  return <KeyboardListView users={users as User[]} />;
}
