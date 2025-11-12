'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function LoginOrRegisterForm() {
  const router = useRouter();
  const [mcid, setMcid] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showDisplayName, setShowDisplayName] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // まず統合APIを呼び出し
      const response = await fetch('/api/auth/login-or-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mcid,
          passphrase: passphrase || undefined,
          displayName: showDisplayName ? displayName : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 初回登録で表示名が必要な場合
        if (data.error === '初回登録には表示名が必要です') {
          setShowDisplayName(true);
          setError('初回登録です。表示名を入力してください');
          setLoading(false);
          return;
        }

        setError(data.error || '処理に失敗しました');
        setLoading(false);
        return;
      }

      // 成功したらNextAuthでログイン
      const result = await signIn('credentials', {
        mcid,
        passphrase: passphrase || '',
        redirect: false,
      });

      if (result?.error) {
        setError('ログインに失敗しました');
        setLoading(false);
        return;
      }

      // 成功メッセージを表示
      if (data.action === 'register') {
        setMessage('登録が完了しました！編集画面に移動します...');
      } else {
        setMessage('ログインしました！編集画面に移動します...');
      }

      // 編集画面にリダイレクト
      setTimeout(() => {
        router.push(`/player/${mcid}/edit`);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('処理に失敗しました');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mcid" className="block text-sm font-medium mb-1.5">
          Minecraft Java版 ユーザー名（MCID）
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
          ※ 登録済みの場合はログイン、未登録の場合は新規登録されます
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
          placeholder="未設定の場合は空欄"
          className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          ※ MCID変更時の認証に使用します
        </p>
      </div>

      {showDisplayName && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="displayName" className="block text-sm font-medium mb-1.5">
            表示名 <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required={showDisplayName}
            placeholder="例: スティーブ"
            className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
          />
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            ※ プレイヤー一覧に表示される名前です
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {message && (
        <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? '処理中...' : '登録 / 編集'}
      </button>
    </form>
  );
}
