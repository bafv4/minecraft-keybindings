'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';

interface LoginOrRegisterFormProps {
  onSuccess?: () => void;
}

type FormStep = 'mcid' | 'login' | 'register';

export function LoginOrRegisterForm({ onSuccess }: LoginOrRegisterFormProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>('mcid');
  const [mcid, setMcid] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // MCIDを確認して次のステップに進む
  const handleMcidNext = async () => {
    if (!mcid.trim()) {
      setError('MCIDを入力してください');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // MCIDが登録済みかチェック
      const response = await fetch(`/api/auth/check-mcid?mcid=${encodeURIComponent(mcid)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'チェックに失敗しました');
        setLoading(false);
        return;
      }

      // 登録済みならログイン、未登録なら新規登録
      setStep(data.exists ? 'login' : 'register');
      setLoading(false);
    } catch (err) {
      setError('チェックに失敗しました');
      setLoading(false);
    }
  };

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        mcid,
        passphrase: passphrase || '',
        redirect: false,
      });

      if (result?.error) {
        setError('MCIDまたはパスフレーズが正しくありません');
        setLoading(false);
        return;
      }

      setMessage('ログインしました！編集画面に移動します...');
      setTimeout(() => {
        onSuccess?.();
        router.push(`/player/${mcid}/edit`);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('ログインに失敗しました');
      setLoading(false);
    }
  };

  // 新規登録処理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 新規登録API呼び出し
      const response = await fetch('/api/auth/login-or-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mcid,
          passphrase: passphrase || undefined,
          displayName: displayName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登録に失敗しました');
        setLoading(false);
        return;
      }

      // 登録成功後、ログイン
      const result = await signIn('credentials', {
        mcid,
        passphrase: passphrase || '',
        redirect: false,
      });

      if (result?.error) {
        setError('登録は成功しましたが、ログインに失敗しました');
        setLoading(false);
        return;
      }

      setMessage('登録が完了しました！編集画面に移動します...');
      setTimeout(() => {
        onSuccess?.();
        router.push(`/player/${mcid}/edit`);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('登録に失敗しました');
      setLoading(false);
    }
  };

  // MCID入力画面
  if (step === 'mcid') {
    return (
      <div className="space-y-4">
        <Input
          id="mcid"
          type="text"
          label="Minecraft Java版 ユーザー名（MCID）"
          value={mcid}
          onChange={(e) => setMcid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleMcidNext();
            }
          }}
          required
          placeholder="例: Steve"
          autoFocus
        />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button
          type="button"
          onClick={handleMcidNext}
          disabled={loading || !mcid.trim()}
          className="w-full"
        >
          {loading ? '確認中...' : '次へ'}
        </Button>
      </div>
    );
  }

  // ログイン画面
  if (step === 'login') {
    return (
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          id="mcid-display"
          type="text"
          label="Minecraft Java版 ユーザー名（MCID）"
          value={mcid}
          disabled
        />

        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <Input
            id="passphrase"
            type="password"
            label={<>パスフレーズ <span className="text-xs text-muted-foreground">(任意)</span></>}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="未設定の場合は空欄"
            description="※ 設定していない場合は空欄のまま進んでください"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {message && (
          <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStep('mcid');
              setPassphrase('');
              setError('');
            }}
            disabled={loading}
          >
            戻る
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </div>
      </form>
    );
  }

  // 新規登録画面
  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <Input
        id="mcid-display"
        type="text"
        label="Minecraft Java版 ユーザー名（MCID）"
        value={mcid}
        disabled
      />

      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
        <Input
          id="displayName"
          type="text"
          label={<>表示名 <span className="text-red-500">*</span></>}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          placeholder="例: スティーブ"
          description="※ プレイヤー一覧に表示される名前です"
          autoFocus
        />

        <Input
          id="passphrase"
          type="password"
          label={<>パスフレーズ <span className="text-xs text-muted-foreground">(任意)</span></>}
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="未設定の場合は空欄"
          description="※ MCID変更時の認証に使用します（任意）"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {message && (
        <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setStep('mcid');
            setDisplayName('');
            setPassphrase('');
            setError('');
          }}
          disabled={loading}
        >
          戻る
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? '登録中...' : '登録'}
        </Button>
      </div>
    </form>
  );
}
