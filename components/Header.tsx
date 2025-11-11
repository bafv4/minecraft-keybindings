import Link from 'next/link';
import { auth, signIn, signOut } from '@/lib/auth';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <Link href="/">Minecraft Keybindings</Link>
        </h1>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm text-gray-600">
                {session.user.mcid || session.user.name}
              </span>
              {session.user.mcid && (
                <Link
                  href={`/player/${session.user.mcid}/edit`}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  設定を編集
                </Link>
              )}
              <form
                action={async () => {
                  'use server';
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                'use server';
                await signIn('microsoft-entra-id', { redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ログイン
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
