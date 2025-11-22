import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { GuestManagement } from '@/components/GuestManagement';

export const metadata = {
  title: 'ゲストユーザー管理 | MCSRer Hotkeys',
  description: 'ゲストユーザーの作成・編集・削除',
};

export default async function GuestManagementPage() {
  const session = await auth();

  if (!isAdmin(session?.user?.uuid)) {
    redirect('/');
  }

  return (
    <div className="pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ゲストユーザー管理</h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          ゲストユーザーの作成・編集・削除を行います
        </p>
      </div>

      <GuestManagement />
    </div>
  );
}
