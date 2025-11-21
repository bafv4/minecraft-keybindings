'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';

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
      <Input
        id="mcid"
        type="text"
        label={<>Minecraft Java版 ユーザー名（MCID） <span className="text-red-500">*</span></>}
        value={mcid}
        onChange={(e) => setMcid(e.target.value)}
        required
        placeholder="例: Steve"
        description="※ UUIDは自動的に取得されます。MCIDはパスフレーズを使って後から変更できます"
      />

      <Input
        id="displayName"
        type="text"
        label={<>表示名 <span className="text-xs text-[rgb(var(--muted-foreground))]">(任意)</span></>}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="例: スティーブ"
        description="※ プレイヤー一覧に表示される名前です（未入力の場合はMCIDが使用されます）"
      />

      <Input
        id="passphrase"
        type="password"
        label={<>パスフレーズ <span className="text-xs text-[rgb(var(--muted-foreground))]">(任意)</span></>}
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        description="※ 設定更時の認証に使用します（設定しない場合は誰でも変更可能）"
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '登録中...' : '登録'}
      </Button>
    </form>
  );
}
