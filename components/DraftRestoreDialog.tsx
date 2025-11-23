'use client';

import { DraggableModal } from '@/components/ui/DraggableModal';
import { Button } from '@/components/ui';

interface DraftRestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
  onDiscard: () => void;
  timestamp: Date | null;
}

export function DraftRestoreDialog({
  isOpen,
  onClose,
  onRestore,
  onDiscard,
  timestamp,
}: DraftRestoreDialogProps) {
  const formatTimestamp = (date: Date | null) => {
    if (!date) return '不明';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="編集中の下書きが見つかりました"
      subtitle={`最終保存: ${formatTimestamp(timestamp)}`}
      maxWidth="md"
      panelClassName="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] select-none"
      headerClassName="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border flex-shrink-0"
      contentClassName="flex-1 overflow-y-auto p-6"
      footerClassName="px-6 py-4 border-t border-border bg-muted/30 flex-shrink-0"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => {
              onDiscard();
              onClose();
            }}
            variant="outline"
            size="lg"
          >
            破棄する
          </Button>
          <Button
            onClick={() => {
              onRestore();
              onClose();
            }}
            variant="primary"
            size="lg"
          >
            復元する
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[rgb(var(--foreground))]">
        前回の編集内容を復元しますか？
      </p>
    </DraggableModal>
  );
}
