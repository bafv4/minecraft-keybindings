'use client';

import { DraggableModal } from '@/components/ui/DraggableModal';
import { Button } from '@/components/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export function UnsavedChangesDialog({
  isOpen,
  onClose,
  onDiscard,
  onSave,
  showSaveButton = false,
}: UnsavedChangesDialogProps) {
  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="変更内容が保存されていません"
      maxWidth="md"
      panelClassName="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] select-none"
      headerClassName="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border flex-shrink-0"
      contentClassName="flex-1 overflow-y-auto p-6"
      footerClassName="px-6 py-4 border-t border-border bg-muted/30 flex-shrink-0"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
          >
            キャンセル
          </Button>
          {showSaveButton && onSave && (
            <Button
              onClick={() => {
                onSave();
                onClose();
              }}
              variant="primary"
              size="lg"
            >
              保存して移動
            </Button>
          )}
          <Button
            onClick={() => {
              onDiscard();
              onClose();
            }}
            variant="danger"
            size="lg"
          >
            破棄して移動
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-10 w-10 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          変更が保存されていません
        </h3>
      </div>

      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        編集した内容が保存されていません。このまま移動すると、変更内容は失われます。
      </p>
    </DraggableModal>
  );
}
