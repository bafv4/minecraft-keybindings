'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';

interface SetupMcidFormProps {
  userId: string;
}

export function SetupMcidForm({ userId }: SetupMcidFormProps) {
  const router = useRouter();
  const [mcid, setMcid] = useState('');
  const [uuid, setUuid] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mcid.trim()) {
      setError('MCIDを入力してください');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/update-mcid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mcid: mcid.trim(),
          uuid: uuid.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '設定に失敗しました');
        return;
      }

      // 成功したらホームページへリダイレクト
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('設定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="mcid"
        type="text"
        label={<>MCID <span className="text-red-500">*</span></>}
        value={mcid}
        onChange={(e) => setMcid(e.target.value)}
        required
      />

      <Input
        id="uuid"
        type="text"
        label={<>UUID <span className="text-xs text-[rgb(var(--muted-foreground))]">(任意)</span></>}
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '設定中...' : '設定'}
      </Button>
    </form>
  );
}
