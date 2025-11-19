'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';

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
      <Input
        id="mcid"
        type="text"
        label="MCID"
        value={mcid}
        onChange={(e) => setMcid(e.target.value)}
        required
      />

      <Input
        id="passphrase"
        type="password"
        label="パスフレーズ"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        description="※ パスフレーズ未設定の場合は空欄のままログイン"
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'ログイン中...' : 'ログイン'}
      </Button>
    </form>
  );
}
