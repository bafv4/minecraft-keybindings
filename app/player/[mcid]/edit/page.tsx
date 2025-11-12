import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { KeybindingEditor } from '@/components/KeybindingEditor';
import type { PlayerSettings } from '@/types/player';

interface EditPageProps {
  params: Promise<{
    mcid: string;
  }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const session = await auth();
  const { mcid } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  // 自分の設定のみ編集可能
  if (session.user.mcid !== mcid) {
    redirect(`/player/${mcid}`);
  }

  const user = await prisma.user.findUnique({
    where: { mcid },
    include: { settings: true },
  });

  if (!user) {
    redirect('/');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">設定を編集</h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          {user.displayName} ({user.mcid}) の操作設定を編集します
        </p>
      </div>

      <KeybindingEditor
        initialSettings={(user.settings as PlayerSettings) || undefined}
        uuid={user.uuid}
        mcid={user.mcid}
        displayName={user.displayName}
      />
    </div>
  );
}
