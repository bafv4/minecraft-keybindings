'use client';

import { useState, useEffect, useCallback } from 'react';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { AutoHotKeyExportDialog } from '@/components/AutoHotKeyExportDialog';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Button } from '@/components/ui';
import { TrashIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { minecraftToWeb } from '@/lib/keyConversion';
import type { Finger } from '@/types/player';

const STORAGE_KEY = 'workspace_remaps';
const LAYOUT_STORAGE_KEY = 'workspace_keyboard_layout';

// キーボードレイアウトオプション
const KEYBOARD_LAYOUT_OPTIONS = [
  { value: 'JIS', label: 'JIS', description: '日本語配列フルサイズ' },
  { value: 'US', label: 'US', description: '英語配列フルサイズ' },
  { value: 'JIS-TKL', label: 'JIS (TKL)', description: '日本語配列テンキーレス' },
  { value: 'US-TKL', label: 'US (TKL)', description: '英語配列テンキーレス' },
];

export default function WorkspacePage() {
  const [remappings, setRemappings] = useState<Record<string, string>>({});
  const [keyboardLayout, setKeyboardLayout] = useState<'JIS' | 'JIS-TKL' | 'US' | 'US-TKL'>('JIS');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorageから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRemappings(JSON.parse(stored));
      }
      const storedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (storedLayout) {
        setKeyboardLayout(storedLayout as 'JIS' | 'JIS-TKL' | 'US' | 'US-TKL');
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // remappingsが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remappings));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }, [remappings, isLoaded]);

  // keyboardLayoutが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, keyboardLayout);
      } catch (e) {
        console.error('Failed to save layout to localStorage:', e);
      }
    }
  }, [keyboardLayout, isLoaded]);

  // 設定を更新
  const handleUpdateConfig = useCallback((key: string, config: {
    actions?: string[];
    remap?: string;
    externalTool?: string;
    finger?: Finger[];
  }) => {
    const webKey = minecraftToWeb(key);

    setRemappings(prev => {
      const updated = { ...prev };

      if (config.remap && config.remap.trim() !== '') {
        // リマップ先をMinecraft形式で保存
        updated[webKey] = config.remap;
      } else {
        // 空の場合は削除
        delete updated[webKey];
      }

      return updated;
    });
  }, []);

  // すべてクリア
  const handleClearAll = useCallback(() => {
    if (confirm('すべてのリマップ設定をクリアしますか？')) {
      setRemappings({});
    }
  }, []);

  // リマップ数をカウント
  const remapCount = Object.keys(remappings).length;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ワークスペース</h1>
          <p className="text-sm text-muted-foreground mt-1">
            リマップ設定の下書きを作成できます。設定はブラウザに保存されます。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExportDialog(true)}
            disabled={remapCount === 0}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
            エクスポート
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearAll}
            disabled={remapCount === 0}
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            クリア
          </Button>
        </div>
      </div>

      {/* 統計 */}
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">リマップ数:</span>
          <span className="text-lg font-bold text-primary">{remapCount}</span>
        </div>
      </div>

      {/* キーボードレイアウト選択 */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <RadioGroup
          label="キーボードレイアウト"
          name="keyboardLayout"
          options={KEYBOARD_LAYOUT_OPTIONS}
          value={keyboardLayout}
          onChange={(value) => setKeyboardLayout(value as 'JIS' | 'JIS-TKL' | 'US' | 'US-TKL')}
        />
      </div>

      {/* バーチャルキーボード */}
      <div className="p-4 bg-card border border-border rounded-lg overflow-x-auto">
        <VirtualKeyboard
          bindings={{}}
          mode="edit"
          remappings={remappings}
          externalTools={{}}
          fingerAssignments={{}}
          onUpdateConfig={handleUpdateConfig}
          keyboardLayout={keyboardLayout}
          showFingerColors={false}
          customKeys={[]}
        />
      </div>

      {/* リマップ一覧 */}
      {remapCount > 0 && (
        <div className="p-4 bg-card border border-border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">リマップ一覧</h2>
          <div className="space-y-2">
            {Object.entries(remappings).map(([sourceKey, targetKey]) => (
              <div
                key={sourceKey}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
                    {sourceKey}
                  </kbd>
                  <span className="text-muted-foreground">→</span>
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
                    {targetKey === 'key.keyboard.disabled' ? '無効化' : targetKey}
                  </kbd>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRemappings(prev => {
                      const updated = { ...prev };
                      delete updated[sourceKey];
                      return updated;
                    });
                  }}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* エクスポートダイアログ */}
      <AutoHotKeyExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        remappings={remappings}
      />
    </div>
  );
}
