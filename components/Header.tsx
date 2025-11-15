import Link from 'next/link';
import Image from 'next/image';
import { auth, signOut } from '@/lib/auth';
import { PencilSquareIcon, ArrowRightOnRectangleIcon, UserCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export async function Header() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/95 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 flex-shrink-0 pt-2">
              <Image
                src="/icon.svg"
                alt="MCSRer Hotkeys"
                width={64}
                height={64}
                className="w-full h-full"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#47a1d4] via-[#8b5cf6] to-[#64748b] bg-clip-text text-transparent leading-tight z-50">
                MCSRer Hotkeys
              </h1>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5 leading-tight z-49 bg-transparent">RTA勢の設定はこうなっている！</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/stats"
              className="flex items-center gap-2 px-4 py-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
              title="統計"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">統計</span>
            </Link>

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
