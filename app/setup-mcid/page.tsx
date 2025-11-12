import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SetupMcidForm } from '@/components/SetupMcidForm';

export default async function SetupMcidPage() {
  const session = await auth();

  // 未ログインの場合はログインページへ
  if (!session) {
    redirect('/login');
  }

  // 既にMCIDが設定されている場合はホームページへ
  if (session.user.mcid) {
    redirect('/');
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="bg-[rgb(var(--card))] p-8 rounded-lg border border-[rgb(var(--border))]">
          <h1 className="text-2xl font-semibold mb-2">MCID設定</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">
            Minecraftのユーザー名を入力してください
          </p>

          <SetupMcidForm userId={session.user.uuid} />

          <p className="mt-4 text-xs text-[rgb(var(--muted-foreground))]">
            ※ MCIDは後から変更できません
          </p>
        </div>
      </div>
    </div>
  );
}
