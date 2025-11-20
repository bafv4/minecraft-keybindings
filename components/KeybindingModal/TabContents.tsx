'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@/components/ui/Combobox';
import type { Finger } from '@/types/player';
import { ACTIONS, FINGER_OPTIONS, REMAPPABLE_KEYS_OPTIONS, EXTERNAL_TOOL_ACTIONS } from './constants';
import { formatKeyLabel, getKeyLabel } from './utils';

// 操作割り当てタブ
interface ActionTabContentProps {
  selectedActions: string[];
  onToggleAction: (actionId: string) => void;
}

export function ActionTabContent({ selectedActions, onToggleAction }: ActionTabContentProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        このキーに割り当てる操作を選択してください（複数選択可）
      </p>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((action) => {
          const isSelected = selectedActions.includes(action.id);
          return (
            <button
              key={action.id}
              onClick={() => onToggleAction(action.id)}
              className={`px-4 py-2 rounded-lg border transition-colors text-left flex items-center gap-2 ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {isSelected && <CheckIcon className="w-5 h-5 flex-shrink-0" />}
              <span className={isSelected ? '' : 'ml-7'}>{action.label}</span>
            </button>
          );
        })}
      </div>
      {selectedActions.length > 0 && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm">
            <strong>選択中:</strong> {selectedActions.length}個のアクション
          </p>
        </div>
      )}
    </div>
  );
}

// 指の割り当てタブ
interface FingerTabContentProps {
  selectedFingers: Finger[];
  onToggleFinger: (finger: Finger) => void;
}

export function FingerTabContent({ selectedFingers, onToggleFinger }: FingerTabContentProps) {
  const fingerMargins: Record<Finger, string> = {
    'left-pinky': '20px',
    'left-ring': '8px',
    'left-middle': '0px',
    'left-index': '4px',
    'left-thumb': '28px',
    'right-thumb': '28px',
    'right-index': '4px',
    'right-middle': '0px',
    'right-ring': '8px',
    'right-pinky': '20px'
  };

  const renderFingerButton = (finger: typeof FINGER_OPTIONS[0]) => {
    const isSelected = selectedFingers.includes(finger.value);
    const marginTop = fingerMargins[finger.value];

    return (
      <button
        key={finger.value}
        onClick={() => onToggleFinger(finger.value)}
        className={`px-2 py-8 rounded-lg border transition-colors text-center text-xs w-16 ${
          isSelected
            ? 'border-primary bg-primary/10 text-primary font-bold'
            : 'border-border hover:bg-accent'
        }`}
        style={{ marginTop }}
      >
        {finger.label.replace(/^(左手|右手) /, '')}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        このキーをどの指で押すかを選択してください。複数の指を選択できます。
      </p>
      <div className="space-y-6">
        {/* 左手 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-center">左手</h3>
          <div className="flex justify-center gap-1">
            {FINGER_OPTIONS.filter(f => f.hand === 'left').map(renderFingerButton)}
          </div>
        </div>

        {/* 右手 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-center">右手</h3>
          <div className="flex justify-center gap-1">
            {FINGER_OPTIONS.filter(f => f.hand === 'right').map(renderFingerButton)}
          </div>
        </div>
      </div>
    </div>
  );
}

// リマップタブ
interface RemapTabContentProps {
  selectedKey: string;
  remapInput: string;
  onRemapChange: (value: string) => void;
}

export function RemapTabContent({ selectedKey, remapInput, onRemapChange }: RemapTabContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        このキーを別のキーに置き換えます。ハードウェアレベルでの変更をシミュレートします。
      </p>

      <Combobox
        label="リマップ先のキー"
        value={remapInput}
        onChange={onRemapChange}
        options={REMAPPABLE_KEYS_OPTIONS}
        placeholder="例: F13, 無変換, A"
        allowCustomValue={true}
        helpText="候補から選択するか、直接キー名を入力してください"
      />

      {/* プレビュー */}
      {remapInput.trim() && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">{formatKeyLabel(selectedKey)}</span>
            {' → '}
            <span className="font-medium text-primary">
              {getKeyLabel(remapInput)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            キーコード: <code className="px-1 py-0.5 bg-background rounded text-xs">{remapInput}</code>
          </p>
        </div>
      )}

      {/* ヘルプテキスト */}
      <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <strong>使用例:</strong><br />
          • Caps Lock → Ctrlに変更（修飾キー化）<br />
          • 無変換 → F13に変更（ファンクションキー化）<br />
          • マウスサイドボタン → Ctrlに変更<br />
          • 無効化: 特殊 &gt; 無効化を選択
        </p>
      </div>
    </div>
  );
}

// 外部ツール・Modタブ
interface ExternalToolTabContentProps {
  externalToolAction: string;
  onExternalToolChange: (value: string) => void;
}

export function ExternalToolTabContent({ externalToolAction, onExternalToolChange }: ExternalToolTabContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        外部ツールやModで実行するアクションを設定します。
        ドロップダウンから選択するか、直接入力してください。
      </p>

      <div>
        <label className="block text-sm font-medium mb-2">
          アクション
        </label>
        <input
          type="text"
          list="external-tool-actions"
          value={externalToolAction}
          onChange={(e) => onExternalToolChange(e.target.value)}
          placeholder="ドロップダウンから選択、または直接入力"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <datalist id="external-tool-actions">
          {EXTERNAL_TOOL_ACTIONS.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground mt-2">
          プリセットから選択するか、カスタムアクション名を入力してください
        </p>
      </div>
    </div>
  );
}

// カスタムキータブ
interface CustomKeyTabContentProps {
  editedLabel: string;
  onLabelChange: (value: string) => void;
  onDeleteCustomKey?: () => void;
}

export function CustomKeyTabContent({ editedLabel, onLabelChange, onDeleteCustomKey }: CustomKeyTabContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        カスタムキーの名前を変更、または削除できます
      </p>
      <div>
        <label className="block text-sm font-medium mb-2">
          キー名
        </label>
        <input
          type="text"
          value={editedLabel}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="キー名（例: F13, MB4）"
          maxLength={6}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground mt-2">
          キーボード上に表示される名前です（最大6文字）
        </p>
      </div>
      <div className="pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => {
            if (onDeleteCustomKey && confirm('このカスタムキーを削除しますか？')) {
              onDeleteCustomKey();
            }
          }}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          カスタムキーを削除
        </button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          削除すると、このキーに割り当てられた設定もすべて失われます
        </p>
      </div>
    </div>
  );
}
