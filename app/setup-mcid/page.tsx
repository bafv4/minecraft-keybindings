import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SetupMcidForm } from '@/components/SetupMcidForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCID設定 | MCSRer Hotkeys',
  description: 'Minecraftユーザー名の設定',
};

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
      <div className="max-w-md w-full px-4">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light via-secondary to-foreground bg-clip-text text-transparent mb-2">
              MCID設定
            </h1>
            <p className="text-sm text-muted-foreground">
              Minecraftのユーザー名を入力してください
            </p>
          </div>

          <SetupMcidForm userId={session.user.uuid} />

          <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              ※ MCIDは後から変更できません
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
