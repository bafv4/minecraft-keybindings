import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { PencilSquareIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
              M
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MCSRer Hotkeys
              </h1>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">操作設定共有サイト</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {session?.user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[rgb(var(--muted))] rounded-lg">
                  <UserCircleIcon className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                </div>

                <Link
                  href={`/player/${session.user.mcid}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">設定を編集</span>
                </Link>

                <form
                  action={async () => {
                    'use server';
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
                    title="ログアウト"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">ログアウト</span>
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>登録 / 編集</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
