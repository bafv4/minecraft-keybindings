'use client';

import { useState, useEffect, useCallback } from 'react';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { WorkspaceRemapModal } from '@/components/WorkspaceRemapModal';
import { WorkspaceSearchCraftEditor } from '@/components/WorkspaceSearchCraftEditor';
import { AutoHotKeyExportDialog } from '@/components/AutoHotKeyExportDialog';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Button } from '@/components/ui';
import { TrashIcon, ArrowDownTrayIcon, ArrowPathIcon, MagnifyingGlassIcon, KeyIcon } from '@heroicons/react/24/outline';
import { minecraftToWeb } from '@/lib/keyConversion';
import { formatKeyNameShort } from '@/lib/utils';

const STORAGE_KEY = 'workspace_remaps';
const LAYOUT_STORAGE_KEY = 'workspace_keyboard_layout';
const SEARCH_CRAFT_STORAGE_KEY = 'workspace_search_crafts';
const SEARCH_CRAFT_ENABLED_KEY = 'workspace_search_craft_enabled';

interface SearchCraftEntry {
  sequence: number;
  item1?: string;
  item2?: string;
  item3?: string;
  inputString: string;
  keys: string[];
  originalKeys: string[];
  comment?: string;
  error?: string;
}

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
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // サーチクラフト
  const [searchCrafts, setSearchCrafts] = useState<SearchCraftEntry[]>([]);
  const [searchCraftEnabled, setSearchCraftEnabled] = useState(false);

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
      const storedSearchCrafts = localStorage.getItem(SEARCH_CRAFT_STORAGE_KEY);
      if (storedSearchCrafts) {
        setSearchCrafts(JSON.parse(storedSearchCrafts));
      }
      const storedSearchCraftEnabled = localStorage.getItem(SEARCH_CRAFT_ENABLED_KEY);
      if (storedSearchCraftEnabled) {
        setSearchCraftEnabled(JSON.parse(storedSearchCraftEnabled));
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

  // searchCraftsが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SEARCH_CRAFT_STORAGE_KEY, JSON.stringify(searchCrafts));
      } catch (e) {
        console.error('Failed to save search crafts to localStorage:', e);
      }
    }
  }, [searchCrafts, isLoaded]);

  // searchCraftEnabledが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SEARCH_CRAFT_ENABLED_KEY, JSON.stringify(searchCraftEnabled));
      } catch (e) {
        console.error('Failed to save search craft enabled to localStorage:', e);
      }
    }
  }, [searchCraftEnabled, isLoaded]);

  // キーがクリックされたとき
  const handleKeyClick = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  // リマップを保存
  const handleSaveRemap = useCallback((remap: string | undefined) => {
    if (!selectedKey) return;

    const webKey = minecraftToWeb(selectedKey);

    setRemappings(prev => {
      const updated = { ...prev };

      if (remap && remap.trim() !== '') {
        updated[webKey] = remap;
      } else {
        delete updated[webKey];
      }

      return updated;
    });
  }, [selectedKey]);

  // すべてクリア
  const handleClearAll = useCallback(() => {
    if (confirm('すべての設定をクリアしますか？（リマップとサーチクラフト）')) {
      setRemappings({});
      setSearchCrafts([]);
      setSearchCraftEnabled(false);
    }
  }, []);

  // リマップ数をカウント
  const remapCount = Object.keys(remappings).length;

  // サーチクラフト数をカウント
  const searchCraftCount = searchCraftEnabled ? searchCrafts.filter(c => c.item1 || c.inputString).length : 0;

  // 選択中のキーのWeb形式
  const webSelectedKey = selectedKey ? minecraftToWeb(selectedKey) : '';

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto flex-1 pb-8">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ワークスペース</h1>
          <p className="text-sm text-muted-foreground mt-1">
            リマップ・サーチクラフト設定の下書きを作成できます。設定はブラウザに保存されます。
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
            disabled={remapCount === 0 && searchCraftCount === 0}
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            クリア
          </Button>
        </div>
      </div>

      {/* 統計 */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">リマップ数:</span>
          <span className="text-lg font-bold text-primary">{remapCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium">サーチクラフト:</span>
          <span className="text-lg font-bold text-secondary">{searchCraftCount}</span>
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

      {/* バーチャルキーボード（display モードでクリックハンドラーを使用） */}
      <div className="p-4 bg-card border border-border rounded-lg overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">リマップ設定</h2>
        <VirtualKeyboard
          bindings={{}}
          mode="display"
          remappings={remappings}
          externalTools={{}}
          fingerAssignments={{}}
          onKeyClick={handleKeyClick}
          keyboardLayout={keyboardLayout}
          showFingerColors={false}
          customKeys={[]}
        />
      </div>

      {/* リマップ一覧 */}
      {remapCount > 0 && (
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-base font-semibold mb-3">リマップ一覧</h3>
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

      {/* サーチクラフト設定 */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <WorkspaceSearchCraftEditor
          remappings={remappings}
          searchCrafts={searchCrafts}
          onSearchCraftsChange={setSearchCrafts}
          enabled={searchCraftEnabled}
          onEnabledChange={setSearchCraftEnabled}
        />
      </div>

      {/* サーチクラフト押すキー一覧 */}
      {searchCraftEnabled && searchCrafts.some(c => c.inputString && !c.error) && (
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <KeyIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">押すキー一覧</h3>
          </div>
          <div className="space-y-3">
            {searchCrafts
              .filter(c => c.inputString && !c.error && c.keys.length > 0)
              .map((craft) => (
                <div
                  key={craft.sequence}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  {/* 連番 */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/20 rounded-full text-xs font-bold">
                    {craft.sequence}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* 入力文字 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">入力文字:</span>
                      <div className="flex gap-1 flex-wrap">
                        {craft.inputString.split('').map((char, idx) => (
                          <kbd
                            key={idx}
                            className="px-1.5 py-0.5 bg-secondary/20 border border-secondary/30 rounded text-xs font-mono"
                          >
                            {char}
                          </kbd>
                        ))}
                      </div>
                    </div>
                    {/* 押すキー */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">押すキー:</span>
                      <div className="flex gap-1 flex-wrap">
                        {craft.keys.map((key, idx) => (
                          <kbd
                            key={idx}
                            className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono"
                          >
                            {formatKeyNameShort(key)}
                          </kbd>
                        ))}
                      </div>
                    </div>
                    {/* コメント */}
                    {craft.comment && (
                      <div className="text-xs text-muted-foreground">
                        {craft.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* リマップ専用モーダル */}
      {selectedKey && (
        <WorkspaceRemapModal
          isOpen={!!selectedKey}
          onClose={() => setSelectedKey(null)}
          selectedKey={selectedKey}
          currentRemap={remappings[webSelectedKey]}
          onSave={handleSaveRemap}
        />
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
