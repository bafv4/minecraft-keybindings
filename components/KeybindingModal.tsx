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

// リマップ可能なキー一覧
const REMAPPABLE_KEYS = {
  '修飾キー': [
    { value: 'key.keyboard.left.shift', label: '左Shift' },
    { value: 'key.keyboard.right.shift', label: '右Shift' },
    { value: 'key.keyboard.left.control', label: '左Ctrl' },
    { value: 'key.keyboard.right.control', label: '右Ctrl' },
    { value: 'key.keyboard.left.alt', label: '左Alt' },
    { value: 'key.keyboard.right.alt', label: '右Alt' },
    { value: 'key.keyboard.caps.lock', label: 'Caps Lock' },
  ],
  '文字キー': [
    { value: 'key.keyboard.a', label: 'A' },
    { value: 'key.keyboard.b', label: 'B' },
    { value: 'key.keyboard.c', label: 'C' },
    { value: 'key.keyboard.d', label: 'D' },
    { value: 'key.keyboard.e', label: 'E' },
    { value: 'key.keyboard.f', label: 'F' },
    { value: 'key.keyboard.g', label: 'G' },
    { value: 'key.keyboard.h', label: 'H' },
    { value: 'key.keyboard.i', label: 'I' },
    { value: 'key.keyboard.j', label: 'J' },
    { value: 'key.keyboard.k', label: 'K' },
    { value: 'key.keyboard.l', label: 'L' },
    { value: 'key.keyboard.m', label: 'M' },
    { value: 'key.keyboard.n', label: 'N' },
    { value: 'key.keyboard.o', label: 'O' },
    { value: 'key.keyboard.p', label: 'P' },
    { value: 'key.keyboard.q', label: 'Q' },
    { value: 'key.keyboard.r', label: 'R' },
    { value: 'key.keyboard.s', label: 'S' },
    { value: 'key.keyboard.t', label: 'T' },
    { value: 'key.keyboard.u', label: 'U' },
    { value: 'key.keyboard.v', label: 'V' },
    { value: 'key.keyboard.w', label: 'W' },
    { value: 'key.keyboard.x', label: 'X' },
    { value: 'key.keyboard.y', label: 'Y' },
    { value: 'key.keyboard.z', label: 'Z' },
  ],
  '数字キー': [
    { value: 'key.keyboard.1', label: '1' },
    { value: 'key.keyboard.2', label: '2' },
    { value: 'key.keyboard.3', label: '3' },
    { value: 'key.keyboard.4', label: '4' },
    { value: 'key.keyboard.5', label: '5' },
    { value: 'key.keyboard.6', label: '6' },
    { value: 'key.keyboard.7', label: '7' },
    { value: 'key.keyboard.8', label: '8' },
    { value: 'key.keyboard.9', label: '9' },
    { value: 'key.keyboard.0', label: '0' },
  ],
  'ファンクションキー': [
    { value: 'key.keyboard.f1', label: 'F1' },
    { value: 'key.keyboard.f2', label: 'F2' },
    { value: 'key.keyboard.f3', label: 'F3' },
    { value: 'key.keyboard.f4', label: 'F4' },
    { value: 'key.keyboard.f5', label: 'F5' },
    { value: 'key.keyboard.f6', label: 'F6' },
    { value: 'key.keyboard.f7', label: 'F7' },
    { value: 'key.keyboard.f8', label: 'F8' },
    { value: 'key.keyboard.f9', label: 'F9' },
    { value: 'key.keyboard.f10', label: 'F10' },
    { value: 'key.keyboard.f11', label: 'F11' },
    { value: 'key.keyboard.f12', label: 'F12' },
    { value: 'key.keyboard.f13', label: 'F13' },
    { value: 'key.keyboard.f14', label: 'F14' },
    { value: 'key.keyboard.f15', label: 'F15' },
    { value: 'key.keyboard.f16', label: 'F16' },
    { value: 'key.keyboard.f17', label: 'F17' },
    { value: 'key.keyboard.f18', label: 'F18' },
    { value: 'key.keyboard.f19', label: 'F19' },
    { value: 'key.keyboard.f20', label: 'F20' },
  ],
  '記号キー': [
    { value: 'key.keyboard.comma', label: ', (コンマ)' },
    { value: 'key.keyboard.period', label: '. (ピリオド)' },
    { value: 'key.keyboard.slash', label: '/ (スラッシュ)' },
    { value: 'key.keyboard.semicolon', label: '; (セミコロン)' },
    { value: 'key.keyboard.apostrophe', label: '\' (アポストロフィ)' },
    { value: 'key.keyboard.left.bracket', label: '[ (左角括弧)' },
    { value: 'key.keyboard.right.bracket', label: '] (右角括弧)' },
    { value: 'key.keyboard.minus', label: '- (マイナス)' },
    { value: 'key.keyboard.equal', label: '= (イコール)' },
    { value: 'key.keyboard.grave.accent', label: '` (グレイヴ)' },
    { value: 'key.keyboard.backslash', label: '\\ (バックスラッシュ)' },
  ],
  '特殊キー': [
    { value: 'key.keyboard.space', label: 'スペース' },
    { value: 'key.keyboard.enter', label: 'Enter' },
    { value: 'key.keyboard.tab', label: 'Tab' },
    { value: 'key.keyboard.backspace', label: 'Backspace' },
    { value: 'key.keyboard.escape', label: 'Esc' },
  ],
  '日本語キーボード': [
    { value: 'key.keyboard.nonconvert', label: '無変換' },
    { value: 'key.keyboard.convert', label: '変換' },
    { value: 'key.keyboard.kana', label: 'かな' },
  ],
  '矢印キー': [
    { value: 'key.keyboard.up', label: '↑' },
    { value: 'key.keyboard.down', label: '↓' },
    { value: 'key.keyboard.left', label: '←' },
    { value: 'key.keyboard.right', label: '→' },
  ],
  '国際キー / 特殊文字': [
    { value: 'key.keyboard.world.1', label: 'World 1 (汎用特殊キー1)' },
    { value: 'key.keyboard.world.2', label: 'World 2 (汎用特殊キー2)' },
    { value: 'key.keyboard.section', label: '§ (セクション)' },
  ],
  '北欧語・ドイツ語キー': [
    { value: 'key.keyboard.ae', label: 'æ (AE合字)' },
    { value: 'key.keyboard.oe', label: 'ø (O with Stroke)' },
    { value: 'key.keyboard.aa', label: 'å (A with Ring)' },
    { value: 'key.keyboard.a.umlaut', label: 'ä (A Umlaut)' },
    { value: 'key.keyboard.o.umlaut', label: 'ö (O Umlaut)' },
    { value: 'key.keyboard.u.umlaut', label: 'ü (U Umlaut)' },
    { value: 'key.keyboard.eszett', label: 'ß (Eszett)' },
  ],
  'フランス語・その他の国際キー': [
    { value: 'key.keyboard.e.acute', label: 'é (E Acute)' },
    { value: 'key.keyboard.e.grave', label: 'è (E Grave)' },
    { value: 'key.keyboard.a.grave', label: 'à (A Grave)' },
    { value: 'key.keyboard.c.cedilla', label: 'ç (C Cedilla)' },
    { value: 'key.keyboard.n.tilde', label: 'ñ (N Tilde)' },
  ],
  'マウスボタン': [
    { value: 'key.mouse.left', label: 'マウス左' },
    { value: 'key.mouse.right', label: 'マウス右' },
    { value: 'key.mouse.middle', label: 'マウスホイール' },
    { value: 'key.mouse.4', label: 'マウス4' },
    { value: 'key.mouse.5', label: 'マウス5' },
  ],
};

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
      externalTool: externalToolName && externalToolName.trim()
        ? { tool: externalToolName.trim(), action: externalToolAction || '', description: externalToolDescription || undefined }
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
        'enter': 'Enter',
        'tab': 'Tab',
        'backspace': 'Backspace',
        'escape': 'Esc',
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→',
        'nonconvert': '無変換',
        'convert': '変換',
        'kana': 'かな',
        'comma': ',',
        'period': '.',
        'slash': '/',
        'semicolon': ';',
        'apostrophe': '\'',
        'left.bracket': '[',
        'right.bracket': ']',
        'minus': '-',
        'equal': '=',
        'grave.accent': '`',
        'backslash': '\\',
        'world.1': 'World 1',
        'world.2': 'World 2',
        'section': '§',
        // 北欧語・ドイツ語キー
        'ae': 'æ',
        'oe': 'ø',
        'aa': 'å',
        'a.umlaut': 'ä',
        'o.umlaut': 'ö',
        'u.umlaut': 'ü',
        'eszett': 'ß',
        // フランス語・その他
        'e.acute': 'é',
        'e.grave': 'è',
        'a.grave': 'à',
        'c.cedilla': 'ç',
        'n.tilde': 'ñ',
      };

      if (specialKeys[key]) return specialKeys[key];

      // F13-F20の処理
      if (key.match(/^f(1[3-9]|20)$/)) {
        return key.toUpperCase();
      }

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
    { id: 'toggleHud', label: 'HUD非表示' },
    { id: 'playerList', label: 'プレイヤーリスト' },
    { id: 'reset', label: 'リセット' },
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
              {selectedAction && (
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedAction(null)}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    操作割り当てをクリア
                  </button>
                </div>
              )}
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
                <select
                  value={remapKey}
                  onChange={(e) => setRemapKey(e.target.value)}
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                >
                  <option value="">-- キーを選択 --</option>
                  {Object.entries(REMAPPABLE_KEYS).map(([category, keys]) => (
                    <optgroup key={category} label={category}>
                      {keys.map((key) => (
                        <option key={key.value} value={key.value}>
                          {key.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  よく使われるリマップ例: Caps Lock → Ctrl、無変換 → スペース
                </p>
              </div>
              {remapKey && (
                <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatKeyLabel(selectedKey)}</span>
                    {' → '}
                    <span className="font-medium text-blue-600 dark:text-blue-400">{formatKeyLabel(remapKey)}</span>
                  </p>
                </div>
              )}
              {remapKey && (
                <div className="mt-4">
                  <button
                    onClick={() => setRemapKey('')}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    リマップをクリア
                  </button>
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
              {externalToolName && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setExternalToolName('');
                      setExternalToolAction('');
                      setExternalToolDescription('');
                      setSelectedPreset('');
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    外部ツール割り当てをクリア
                  </button>
                </div>
              )}
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
