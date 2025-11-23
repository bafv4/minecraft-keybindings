'use client';

import { useState, useMemo } from 'react';
import { DraggableModal } from '@/components/ui/DraggableModal';
import { Button } from '@/components/ui';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { generateAutoHotKeyScript, downloadAutoHotKeyScript, minecraftToAutoHotKey } from '@/lib/autohotkey';
import { minecraftToKeyName } from '@/lib/keyConversion';

interface RemappingConfig {
  sourceKey: string;
  targetKey: string;
}

interface AutoHotKeyExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  remappings: { [key: string]: string };
}

export function AutoHotKeyExportDialog({
  isOpen,
  onClose,
  remappings,
}: AutoHotKeyExportDialogProps) {
  // リマップを配列形式に変換
  const remappingArray: RemappingConfig[] = useMemo(() => {
    return Object.entries(remappings).map(([sourceKey, targetKey]) => ({
      sourceKey,
      targetKey,
    }));
  }, [remappings]);

  // 選択状態（初期は全て選択）
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(() => {
    return new Set(remappingArray.map((_, index) => index));
  });

  // 全て選択
  const selectAll = () => {
    setSelectedIndices(new Set(remappingArray.map((_, index) => index)));
  };

  // 全て解除
  const deselectAll = () => {
    setSelectedIndices(new Set());
  };

  // 個別のチェックボックストグル
  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // AutoHotKeyスクリプトを生成
  const script = useMemo(() => {
    return generateAutoHotKeyScript(remappingArray, selectedIndices);
  }, [remappingArray, selectedIndices]);

  // ダウンロード
  const handleDownload = () => {
    downloadAutoHotKeyScript(script, 'minecraft_remap.ahk');
  };

  // クリップボードにコピー
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      alert('スクリプトをクリップボードにコピーしました');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('コピーに失敗しました');
    }
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="AutoHotKeyスクリプト出力"
      maxWidth="4xl"
      panelClassName="w-full max-w-4xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] select-none"
      headerClassName="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border flex-shrink-0"
      contentClassName="flex-1 overflow-y-auto p-8 space-y-6"
      footerClassName="px-6 py-4 border-t border-border bg-muted/30 flex-shrink-0"
      footer={
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose} variant="outline" size="lg">
            閉じる
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="lg"
            disabled={selectedIndices.size === 0}
          >
            コピー
          </Button>
          <Button
            onClick={handleDownload}
            variant="primary"
            size="lg"
            disabled={selectedIndices.size === 0}
            className="flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            AHKファイルをダウンロード
          </Button>
        </div>
      }
    >
      {/* リマップリスト */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">リマップ一覧（{selectedIndices.size}/{remappingArray.length}個選択中）</h3>
          <div className="flex gap-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              全て選択
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              全て解除
            </Button>
          </div>
        </div>

        {remappingArray.length === 0 ? (
          <p className="text-[rgb(var(--muted-foreground))] text-sm">
            リマップが設定されていません。仮想キーボードからキーを選択してリマップを追加してください。
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto border border-[rgb(var(--border))] rounded-lg p-4">
            {remappingArray.map((remap, index) => {
              const sourceAhk = minecraftToAutoHotKey(remap.sourceKey);
              const targetAhk = minecraftToAutoHotKey(remap.targetKey);
              const sourceName = minecraftToKeyName(remap.sourceKey);
              const targetName = minecraftToKeyName(remap.targetKey);

              return (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedIndices.has(index)
                      ? 'bg-[rgb(var(--primary))]/10 border-[rgb(var(--primary))]'
                      : 'bg-[rgb(var(--muted))]/30 border-[rgb(var(--border))]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIndices.has(index)}
                    onChange={() => toggleSelection(index)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{sourceName || remap.sourceKey}</span>
                      <span className="text-[rgb(var(--muted-foreground))]">→</span>
                      <span className="font-mono text-sm">{targetName || remap.targetKey}</span>
                    </div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                      AHK: {sourceAhk}::{targetAhk}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* スクリプトプレビュー */}
      <div>
        <h3 className="text-lg font-semibold mb-4">スクリプトプレビュー</h3>
        <div className="bg-[rgb(var(--muted))] rounded-lg p-4 border border-[rgb(var(--border))]">
          <pre className="text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {script}
          </pre>
        </div>
      </div>
    </DraggableModal>
  );
}
