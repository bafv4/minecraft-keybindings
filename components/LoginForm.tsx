'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [mcid, setMcid] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        mcid,
        passphrase,
        redirect: false,
      });

      if (result?.error) {
        setError('MCIDまたはパスフレーズが正しくありません');
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="mcid" className="block text-sm font-medium mb-1.5">
          MCID
        </label>
        <input
          id="mcid"
          type="text"
          value={mcid}
          onChange={(e) => setMcid(e.target.value)}
          required
          className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
        />
      </div>

      <div>
        <label htmlFor="passphrase" className="block text-sm font-medium mb-1.5">
          パスフレーズ
        </label>
        <input
          id="passphrase"
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          ※ パスフレーズ未設定の場合は空欄のままログイン
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
}
