'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Finger } from '@/types/player';

interface KeybindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: string;
  currentAction: string | null;
  onSave: (config: {
    action?: string;
    remap?: string;
    externalTool?: { tool: string; action: string; description?: string };
    finger?: Finger;
  }) => void;
  // 既存の設定を渡す
  currentRemap?: string;
  currentExternalTool?: { tool: string; action: string; description?: string };
  currentFinger?: Finger;
}

type TabType = 'action' | 'remap' | 'external' | 'finger';

// 外部ツールのプリセット定義
const EXTERNAL_TOOL_PRESETS = {
  'Jingle': [
    { name: 'ThinBT', description: 'ThinBT (細めのBT)', action: '' },
    { name: 'Wide', description: 'Wide (広めのBT)', action: '' },
    { name: 'Zoom', description: 'Zoom', action: '' },
  ],
  'NinjabrainBot': [
    { name: 'Add Throw', description: '投擲を追加', action: '' },
    { name: 'Reset', description: 'リセット', action: '' },
    { name: 'Lock Direction', description: '方向をロック', action: '' },
    { name: 'Undo', description: '元に戻す', action: '' },
  ],
};

// 指の選択肢定義
const FINGER_OPTIONS: { value: Finger; label: string; hand: 'left' | 'right' }[] = [
  { value: 'left-pinky', label: '左手 小指', hand: 'left' },
  { value: 'left-ring', label: '左手 薬指', hand: 'left' },
  { value: 'left-middle', label: '左手 中指', hand: 'left' },
  { value: 'left-index', label: '左手 人差し指', hand: 'left' },
  { value: 'left-thumb', label: '左手 親指', hand: 'left' },
  { value: 'right-thumb', label: '右手 親指', hand: 'right' },
  { value: 'right-index', label: '右手 人差し指', hand: 'right' },
  { value: 'right-middle', label: '右手 中指', hand: 'right' },
  { value: 'right-ring', label: '右手 薬指', hand: 'right' },
  { value: 'right-pinky', label: '右手 小指', hand: 'right' },
];

export function KeybindingModal({
  isOpen,
  onClose,
  selectedKey,
  currentAction,
  onSave,
  currentRemap,
  currentExternalTool,
  currentFinger,
}: KeybindingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('action');
  const [selectedAction, setSelectedAction] = useState<string | null>(currentAction);
  const [remapKey, setRemapKey] = useState<string>(currentRemap || '');
  const [externalToolName, setExternalToolName] = useState<string>(currentExternalTool?.tool || '');
  const [externalToolAction, setExternalToolAction] = useState<string>(currentExternalTool?.action || '');
  const [externalToolDescription, setExternalToolDescription] = useState<string>(currentExternalTool?.description || '');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedFinger, setSelectedFinger] = useState<Finger | undefined>(currentFinger);

  // モーダルが開くたびに現在の設定で状態をリセット
  useEffect(() => {
    if (isOpen) {
      setSelectedAction(currentAction);
      setRemapKey(currentRemap || '');
      setExternalToolName(currentExternalTool?.tool || '');
      setExternalToolAction(currentExternalTool?.action || '');
      setExternalToolDescription(currentExternalTool?.description || '');
      setSelectedPreset('');
      setSelectedFinger(currentFinger);
      setActiveTab('action');
    }
  }, [isOpen, currentAction, currentRemap, currentExternalTool, currentFinger]);

  // プリセット選択時のハンドラー
  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPreset(value);

    if (!value) return;

    const [tool, presetName] = value.split('::');
    const preset = EXTERNAL_TOOL_PRESETS[tool as keyof typeof EXTERNAL_TOOL_PRESETS]?.find(
      (p) => p.name === presetName
    );

    if (preset) {
      setExternalToolName(tool);
      setExternalToolDescription(preset.description);
      // actionは空文字列なので既存の値を保持するか、カスタム入力を促す
      if (preset.action) {
        setExternalToolAction(preset.action);
      }
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const config = {
      action: selectedAction || undefined,
      remap: remapKey || undefined,
      // 外部ツールはツール名があれば保存（アクションは空でもOK - プリセットの場合）
      externalTool: externalToolName
        ? { tool: externalToolName, action: externalToolAction || '', description: externalToolDescription || undefined }
        : undefined,
      finger: selectedFinger,
    };
    console.log('KeybindingModal saving:', { selectedKey, config });
    onSave(config);
    onClose();
  };

  // キーラベルを表示用にフォーマット
  const formatKeyLabel = (keyCode: string): string => {
    if (keyCode.startsWith('key.mouse.')) {
      const button = keyCode.replace('key.mouse.', '');
      if (button === 'left') return 'マウス左';
      if (button === 'right') return 'マウス右';
      if (button === 'middle') return 'マウスホイール';
      if (button === '4') return 'マウス4';
      if (button === '5') return 'マウス5';
      return button.toUpperCase();
    }

    if (keyCode.startsWith('key.keyboard.')) {
      const key = keyCode.replace('key.keyboard.', '');
      const specialKeys: { [key: string]: string } = {
        'left.shift': '左Shift',
        'right.shift': '右Shift',
        'left.control': '左Ctrl',
        'right.control': '右Ctrl',
        'left.alt': '左Alt',
        'right.alt': '右Alt',
        'space': 'スペース',
        'caps.lock': 'Caps Lock',
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→',
      };

      if (specialKeys[key]) return specialKeys[key];
      return key.toUpperCase();
    }

    return keyCode;
  };

  // 利用可能なアクション一覧（攻撃/使用は除外 - MCSRルール）
  const actions = [
    { id: 'forward', label: '前進' },
    { id: 'back', label: '後退' },
    { id: 'left', label: '左移動' },
    { id: 'right', label: '右移動' },
    { id: 'jump', label: 'ジャンプ' },
    { id: 'sneak', label: 'スニーク' },
    { id: 'sprint', label: 'ダッシュ' },
    { id: 'inventory', label: 'インベントリ' },
    { id: 'swapHands', label: 'オフハンド持ち替え' },
    { id: 'drop', label: 'ドロップ' },
    // attack と use は MCSRルールにより除外
    { id: 'pickBlock', label: 'ブロック選択' },
    { id: 'chat', label: 'チャット' },
    { id: 'command', label: 'コマンド' },
    { id: 'togglePerspective', label: '視点変更' },
    { id: 'fullscreen', label: 'フルスクリーン' },
    { id: 'toggleHud', label: 'Hide HUD' },
    { id: 'playerList', label: 'プレイヤーリスト' },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `hotbar${i + 1}`,
      label: `ホットバー${i + 1}`,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))] flex-shrink-0">
          <h2 className="text-xl font-semibold">
            キー設定: {formatKeyLabel(selectedKey)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-[rgb(var(--border))] flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('action')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
              activeTab === 'action'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            操作割り当て
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('finger')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
              activeTab === 'finger'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            指の割り当て
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remap')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
              activeTab === 'remap'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            リマップ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('external')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
              activeTab === 'external'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            外部ツール
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4 min-h-[300px] overflow-y-auto flex-1">
          {activeTab === 'action' && (
            <div className="space-y-3">
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                このキーに割り当てる操作を選択してください
              </p>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors text-left ${
                      selectedAction === action.id
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                        : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'finger' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                このキーをどの指で押すかを選択してください。指による色分け表示が有効になります。
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold mb-2">左手</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {FINGER_OPTIONS.filter(f => f.hand === 'left').map((finger) => (
                      <button
                        key={finger.value}
                        onClick={() => setSelectedFinger(finger.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors text-left ${
                          selectedFinger === finger.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                            : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                        }`}
                      >
                        {finger.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">右手</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {FINGER_OPTIONS.filter(f => f.hand === 'right').map((finger) => (
                      <button
                        key={finger.value}
                        onClick={() => setSelectedFinger(finger.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors text-left ${
                          selectedFinger === finger.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                            : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                        }`}
                      >
                        {finger.label}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedFinger && (
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedFinger(undefined)}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      指の割り当てをクリア
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'remap' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                このキーを別のキーに置き換えます。ハードウェアレベルでの変更をシミュレートします。
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">
                  リマップ先のキー
                </label>
                <input
                  type="text"
                  value={remapKey}
                  onChange={(e) => setRemapKey(e.target.value)}
                  placeholder="例: key.keyboard.left.control"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  Minecraft のキーコード形式で入力してください（例: key.keyboard.caps.lock → key.keyboard.left.control）
                </p>
              </div>
              {remapKey && (
                <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatKeyLabel(selectedKey)}</span>
                    {' → '}
                    <span className="font-medium">{formatKeyLabel(remapKey)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                外部ツール（AutoHotKey、マクロソフトウェアなど）で実行するアクションを記録します。
              </p>

              {/* プリセット選択 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  プリセット（Jingle / NinjabrainBot）
                </label>
                <select
                  value={selectedPreset}
                  onChange={handlePresetSelect}
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                >
                  <option value="">-- プリセットを選択 --</option>
                  <optgroup label="Jingle">
                    {EXTERNAL_TOOL_PRESETS.Jingle.map((preset) => (
                      <option key={preset.name} value={`Jingle::${preset.name}`}>
                        {preset.description}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="NinjabrainBot">
                    {EXTERNAL_TOOL_PRESETS.NinjabrainBot.map((preset) => (
                      <option key={preset.name} value={`NinjabrainBot::${preset.name}`}>
                        {preset.description}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  プリセットを選択すると、ツール名と説明が自動的に入力されます
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ツール名
                </label>
                <input
                  type="text"
                  value={externalToolName}
                  onChange={(e) => setExternalToolName(e.target.value)}
                  placeholder="例: AutoHotKey, Jingle, NinjabrainBot"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  アクション
                </label>
                <textarea
                  value={externalToolAction}
                  onChange={(e) => setExternalToolAction(e.target.value)}
                  placeholder="例: Send {LButton Down}&#x0A;Sleep 10&#x0A;Send {LButton Up}"
                  rows={4}
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] font-mono text-sm"
                />
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  このキーが押されたときに実行される外部ツールのスクリプトを記述してください（プリセットの場合は空でもOK）
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  説明（任意）
                </label>
                <input
                  type="text"
                  value={externalToolDescription}
                  onChange={(e) => setExternalToolDescription(e.target.value)}
                  placeholder="このアクションの説明"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgb(var(--border))] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
