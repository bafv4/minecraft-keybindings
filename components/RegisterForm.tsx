'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();
  const [mcid, setMcid] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mcid,
          displayName: displayName.trim() || mcid, // 未入力の場合はMCIDを使用
          passphrase: passphrase || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登録に失敗しました');
        return;
      }

      // 登録成功後、ログインページにリダイレクト
      router.push('/login?registered=true');
    } catch (err) {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mcid" className="block text-sm font-medium mb-1.5">
          Minecraft Java版 ユーザー名（MCID） <span className="text-red-500">*</span>
        </label>
        <input
          id="mcid"
          type="text"
          value={mcid}
          onChange={(e) => setMcid(e.target.value)}
          required
          placeholder="例: Steve"
          className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          ※ UUIDは自動的に取得されます。MCIDはパスフレーズを使って後から変更できます
        </p>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1.5">
          表示名 <span className="text-xs text-[rgb(var(--muted-foreground))]">(任意)</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="例: スティーブ"
          className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          ※ プレイヤー一覧に表示される名前です（未入力の場合はMCIDが使用されます）
        </p>
      </div>

      <div>
        <label htmlFor="passphrase" className="block text-sm font-medium mb-1.5">
          パスフレーズ <span className="text-xs text-[rgb(var(--muted-foreground))]">(任意)</span>
        </label>
        <input
          id="passphrase"
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          ※ MCID変更時の認証に使用します（設定しない場合は誰でも変更可能）
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
        {loading ? '登録中...' : '登録'}
      </button>
    </form>
  );
}
