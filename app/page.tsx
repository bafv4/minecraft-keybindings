import { prisma } from '@/lib/db';
import { PlayerCard } from '@/components/PlayerCard';

export default async function HomePage() {
  // MCIDの昇順でユーザーを取得
  const users = await prisma.user.findMany({
    include: {
      settings: true,
    },
    orderBy: {
      mcid: 'asc',
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">プレイヤー一覧</h1>
        <p className="text-gray-600">
          登録されているプレイヤーの操作設定を閲覧できます
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            まだプレイヤーが登録されていません
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <PlayerCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
