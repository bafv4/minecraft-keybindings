'use client';

import Link from 'next/link';
import { DraggableModal } from '@/components/ui/DraggableModal';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: Array<{ mcid: string; uuid: string }>;
}

export function UserListModal({ isOpen, onClose, title, users }: UserListModalProps) {
  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`プレイヤー: ${users.length}人`}
      maxWidth="2xl"
      panelClassName="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] select-none"
      headerClassName="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border flex-shrink-0"
    >
      <div className="p-6">
        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user) => (
              <Link
                key={user.uuid}
                href={`/player/${user.mcid}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border))] hover:border-blue-500 hover:bg-[rgb(var(--muted))] transition-colors select-text"
                onClick={onClose}
              >
                <img
                  src={`/api/avatar?uuid=${user.uuid}&size=32`}
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
    </DraggableModal>
  );
}
