'use client';

import { useState, useEffect } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { formatKeyName } from '@/lib/utils';
import { DraggableModal } from '@/components/ui/DraggableModal';

interface WorkspaceRemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: string;
  currentRemap?: string;
  onSave: (remap: string | undefined) => void;
}

// リマップ可能なキー
const REMAP_KEYS = [
  { value: 'key.keyboard.disabled', label: '無効化' },
  // 修飾キー
  { value: 'key.keyboard.left.shift', label: 'LShift' },
  { value: 'key.keyboard.right.shift', label: 'RShift' },
  { value: 'key.keyboard.left.control', label: 'LCtrl' },
  { value: 'key.keyboard.right.control', label: 'RCtrl' },
  { value: 'key.keyboard.left.alt', label: 'LAlt' },
  { value: 'key.keyboard.right.alt', label: 'RAlt' },
  { value: 'key.keyboard.caps.lock', label: 'Caps Lock' },
  // 特殊キー
  { value: 'key.keyboard.space', label: 'Space' },
  { value: 'key.keyboard.tab', label: 'Tab' },
  { value: 'key.keyboard.enter', label: 'Enter' },
  { value: 'key.keyboard.backspace', label: 'Backspace' },
  { value: 'key.keyboard.escape', label: 'Escape' },
  { value: 'key.keyboard.insert', label: 'Insert' },
  { value: 'key.keyboard.delete', label: 'Delete' },
  { value: 'key.keyboard.home', label: 'Home' },
  { value: 'key.keyboard.end', label: 'End' },
  { value: 'key.keyboard.page.up', label: 'Page Up' },
  { value: 'key.keyboard.page.down', label: 'Page Down' },
  // 矢印キー
  { value: 'key.keyboard.up', label: '↑' },
  { value: 'key.keyboard.down', label: '↓' },
  { value: 'key.keyboard.left', label: '←' },
  { value: 'key.keyboard.right', label: '→' },
  // ファンクションキー
  ...Array.from({ length: 12 }, (_, i) => ({
    value: `key.keyboard.f${i + 1}`,
    label: `F${i + 1}`,
  })),
  // 数字キー
  ...Array.from({ length: 10 }, (_, i) => ({
    value: `key.keyboard.${i}`,
    label: `${i}`,
  })),
  // アルファベットキー
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map(char => ({
    value: `key.keyboard.${char}`,
    label: char.toUpperCase(),
  })),
  // 記号キー
  { value: 'key.keyboard.minus', label: '-' },
  { value: 'key.keyboard.equal', label: '=' },
  { value: 'key.keyboard.left.bracket', label: '[' },
  { value: 'key.keyboard.right.bracket', label: ']' },
  { value: 'key.keyboard.backslash', label: '\\' },
  { value: 'key.keyboard.semicolon', label: ';' },
  { value: 'key.keyboard.apostrophe', label: "'" },
  { value: 'key.keyboard.grave.accent', label: '`' },
  { value: 'key.keyboard.comma', label: ',' },
  { value: 'key.keyboard.period', label: '.' },
  { value: 'key.keyboard.slash', label: '/' },
  // マウスボタン
  { value: 'key.mouse.left', label: 'LClick' },
  { value: 'key.mouse.right', label: 'RClick' },
  { value: 'key.mouse.middle', label: 'MButton' },
  { value: 'key.mouse.4', label: 'MB4' },
  { value: 'key.mouse.5', label: 'MB5' },
];

export function WorkspaceRemapModal({
  isOpen,
  onClose,
  selectedKey,
  currentRemap,
  onSave,
}: WorkspaceRemapModalProps) {
  const [remapValue, setRemapValue] = useState('');
  const [remapQuery, setRemapQuery] = useState('');

  // モーダルが開いたら初期化
  useEffect(() => {
    if (isOpen) {
      setRemapValue(currentRemap || '');
      setRemapQuery('');
    }
  }, [isOpen, currentRemap]);

  // 保存処理
  const handleSave = () => {
    onSave(remapValue || undefined);
    onClose();
  };

  // リマップキーのフィルタリング
  const filteredRemapKeys = remapQuery === ''
    ? REMAP_KEYS
    : REMAP_KEYS.filter((key) =>
        key.label.toLowerCase().includes(remapQuery.toLowerCase())
      );

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="リマップ設定"
      subtitle={
        <kbd className="bg-muted border border-border rounded px-2 py-0.5 text-xs font-mono">
          {formatKeyName(selectedKey)}
        </kbd>
      }
      maxWidth="md"
      panelClassName="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] select-none"
      headerClassName="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border flex-shrink-0"
      contentClassName="flex-1 flex flex-col overflow-hidden"
      footerClassName="px-6 py-4 border-t border-[rgb(var(--border))] bg-muted/30 flex-shrink-0"
      noScroll
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
          >
            保存
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          物理的なキーを別のキーにリマップします（例: Caps Lock → Ctrl）
        </p>
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              setRemapValue('');
              setRemapQuery('');
            }}
            disabled={!remapValue}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-accent/50 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            クリア
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">リマップ先を選択</label>
          <Combobox
            value={remapValue}
            onChange={(value) => setRemapValue(value || '')}
            immediate
          >
            <div className="relative">
              <ComboboxInput
                className="w-full px-4 py-2 pr-10 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                displayValue={(value: string) => {
                  if (!value) return '';
                  const key = REMAP_KEYS.find(k => k.value === value);
                  return key ? key.label : value;
                }}
                onChange={(event) => {
                  setRemapQuery(event.target.value);
                  setRemapValue(event.target.value);
                }}
                placeholder="リマップ先を選択または入力"
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </ComboboxButton>
              <ComboboxOptions
                anchor="bottom start"
                portal
                className="z-[100] w-[var(--input-width)] max-h-60 overflow-auto rounded-lg bg-[rgb(var(--card))] border border-border shadow-lg focus:outline-none"
              >
                {filteredRemapKeys.length === 0 && remapQuery !== '' ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    カスタム値: &quot;{remapQuery}&quot;
                  </div>
                ) : (
                  filteredRemapKeys.map((key) => (
                    <ComboboxOption
                      key={key.value}
                      value={key.value}
                      className="px-4 py-2 text-sm cursor-pointer ui-active:bg-accent ui-selected:bg-accent ui-selected:font-medium"
                    >
                      {key.label}
                    </ComboboxOption>
                  ))
                )}
              </ComboboxOptions>
            </div>
          </Combobox>
        </div>
      </div>
    </DraggableModal>
  );
}
