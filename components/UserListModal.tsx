'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: Array<{ mcid: string; uuid: string }>;
}

export function UserListModal({ isOpen, onClose, title, users }: UserListModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border))]">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              プレイヤー: {users.length}人
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map((user) => (
                <Link
                  key={user.uuid}
                  href={`/player/${user.mcid}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border))] hover:border-blue-500 hover:bg-[rgb(var(--muted))] transition-colors"
                  onClick={onClose}
                >
                  <img
                    src={`https://mc-heads.net/avatar/${user.uuid}/32`}
                    alt={user.mcid}
                    className="w-8 h-8 rounded"
                  />
                  <span className="font-medium">{user.mcid}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
              該当ユーザーがいません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
