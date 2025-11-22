'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Guest {
  uuid: string;
  mcid: string;
  displayName: string | null;
  isGuest: boolean;
  createdAt: string;
}

export function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // フォーム入力
  const [mcid, setMcid] = useState('');
  const [uuid, setUuid] = useState('');
  const [displayName, setDisplayName] = useState('');

  // ゲストユーザー一覧を取得
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/guests');
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('Failed to fetch guests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  // ゲストユーザーを作成
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcid,
          uuid,
          displayName: displayName.trim() || undefined,
        }),
      });

      if (response.ok) {
        // フォームをリセット
        setMcid('');
        setUuid('');
        setDisplayName('');
        setShowForm(false);
        // 一覧を再取得
        fetchGuests();
      } else {
        const error = await response.json();
        alert(error.error || 'ゲストユーザーの作成に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create guest:', error);
      alert('ゲストユーザーの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  // ゲストユーザーを削除
  const handleDelete = async (uuid: string, mcid: string) => {
    if (!confirm(`${mcid} を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/guests?uuid=${uuid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 一覧を再取得
        fetchGuests();
      } else {
        const error = await response.json();
        alert(error.error || 'ゲストユーザーの削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete guest:', error);
      alert('ゲストユーザーの削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 作成フォーム */}
      <div className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">新規ゲストユーザー</h2>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {showForm ? '閉じる' : '追加'}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="MCID"
              type="text"
              value={mcid}
              onChange={(e) => setMcid(e.target.value)}
              placeholder="例: Dream"
              required
            />
            <Input
              label="UUID"
              type="text"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              placeholder="例: ec70bcaf-702f-4bb8-b48d-276fa52a780c"
              required
            />
            <Input
              label="表示名（オプション）"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: ドリーム"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={creating} className="flex items-center gap-2">
                {creating && <LoadingSpinner size="sm" variant="light" />}
                {creating ? '作成中...' : '作成'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                キャンセル
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ゲストユーザー一覧 */}
      <div className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">ゲストユーザー一覧</h2>

        {guests.length === 0 ? (
          <p className="text-[rgb(var(--muted-foreground))] text-center py-8">
            ゲストユーザーが登録されていません
          </p>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div
                key={guest.uuid}
                className="flex items-center justify-between p-4 bg-[rgb(var(--muted))] rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/player/${guest.mcid}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {guest.displayName || guest.mcid}
                    </Link>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50">
                      GUEST
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {guest.mcid} • {guest.uuid}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/player/${guest.mcid}/edit`}>
                    <Button variant="outline" size="sm">
                      編集
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDelete(guest.uuid, guest.mcid)}
                    variant="danger-outline"
                    size="sm"
                    className="p-2"
                    title="削除"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
