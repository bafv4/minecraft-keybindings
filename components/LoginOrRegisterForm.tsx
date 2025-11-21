'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';

interface LoginOrRegisterFormProps {
  onSuccess?: () => void;
}

export function LoginOrRegisterForm({ onSuccess }: LoginOrRegisterFormProps = {}) {
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
        onSuccess?.();
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
      <Input
        id="mcid"
        type="text"
        label="Minecraft Java版 ユーザー名（MCID）"
        value={mcid}
        onChange={(e) => setMcid(e.target.value)}
        required
        placeholder="例: Steve"
        description="※ 登録済みの場合はログイン、未登録の場合は新規登録されます"
      />

      <Input
        id="passphrase"
        type="password"
        label={<>パスフレーズ <span className="text-xs text-[rgb(var(--muted-foreground))]">(任意)</span></>}
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="未設定の場合は空欄"
        description="※ MCID変更時の認証に使用します"
      />

      {showDisplayName && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <Input
            id="displayName"
            type="text"
            label={<>表示名 <span className="text-red-500">*</span></>}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required={showDisplayName}
            placeholder="例: スティーブ"
            description="※ プレイヤー一覧に表示される名前です"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {message && (
        <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '処理中...' : '登録 / 編集'}
      </Button>
    </form>
  );
}
