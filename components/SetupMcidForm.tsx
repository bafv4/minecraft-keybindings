'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

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
      <div>
        <label htmlFor="mcid" className="block text-sm font-medium mb-1.5">
          MCID <span className="text-red-500">*</span>
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
        <label htmlFor="uuid" className="block text-sm font-medium mb-1.5">
          UUID <span className="text-xs text-[rgb(var(--muted-foreground))]">(任意)</span>
        </label>
        <input
          id="uuid"
          type="text"
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
          className="w-full px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ring))]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? '設定中...' : '設定'}
      </button>
    </form>
  );
}
