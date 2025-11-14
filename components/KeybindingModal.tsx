'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  '特殊': [
    { value: 'key.keyboard.disabled', label: '無効化（キーを押しても反応しない）' },
  ],
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
  const [remapInput, setRemapInput] = useState<string>(''); // ユーザー入力値（表示用）
  const [showRemapDropdown, setShowRemapDropdown] = useState(false);
  const [externalToolName, setExternalToolName] = useState<string>(currentExternalTool?.tool || '');
  const [externalToolAction, setExternalToolAction] = useState<string>(currentExternalTool?.action || '');
  const [externalToolDescription, setExternalToolDescription] = useState<string>(currentExternalTool?.description || '');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedFinger, setSelectedFinger] = useState<Finger | undefined>(currentFinger);
  const remapDropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (remapDropdownRef.current && !remapDropdownRef.current.contains(event.target as Node)) {
        setShowRemapDropdown(false);
      }
    };

    if (showRemapDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRemapDropdown]);

  // キーコードからラベルを取得
  const getKeyLabel = (keyCode: string): string => {
    if (!keyCode) return '';
    // REMAPPABLE_KEYSから検索
    for (const keys of Object.values(REMAPPABLE_KEYS)) {
      const found = keys.find(k => k.value === keyCode);
      if (found) return found.label;
    }
    // 見つからなければformatKeyLabelを使用
    return formatKeyLabel(keyCode);
  };

  // ユーザー入力からキーコードに変換
  const parseInputToKeyCode = (input: string): string => {
    if (!input.trim()) return '';

    const normalized = input.trim().toLowerCase();

    // 既にキーコード形式なら検証してそのまま返す
    if (normalized.startsWith('key.')) {
      return input.trim();
    }

    // REMAPPABLE_KEYSから完全一致または部分一致を検索
    for (const keys of Object.values(REMAPPABLE_KEYS)) {
      const found = keys.find(k =>
        k.label.toLowerCase() === normalized ||
        k.label.toLowerCase().includes(normalized)
      );
      if (found) return found.value;
    }

    // ファンクションキー: f1-f20
    const fKeyMatch = normalized.match(/^f(\d+)$/);
    if (fKeyMatch) {
      const num = parseInt(fKeyMatch[1]);
      if (num >= 1 && num <= 20) return `key.keyboard.f${num}`;
    }

    // 単一文字
    if (/^[a-z]$/.test(normalized)) {
      return `key.keyboard.${normalized}`;
    }

    // 数字
    if (/^[0-9]$/.test(normalized)) {
      return `key.keyboard.${normalized}`;
    }

    // テンキー
    if (normalized.startsWith('numpad') || normalized.startsWith('keypad')) {
      const numMatch = normalized.match(/(\d+)$/);
      if (numMatch) return `key.keyboard.keypad.${numMatch[1]}`;
    }

    // 特殊キーのエイリアス
    const aliases: { [key: string]: string } = {
      'space': 'key.keyboard.space',
      'enter': 'key.keyboard.enter',
      'tab': 'key.keyboard.tab',
      'backspace': 'key.keyboard.backspace',
      'esc': 'key.keyboard.escape',
      'escape': 'key.keyboard.escape',
      'caps': 'key.keyboard.caps.lock',
      'capslock': 'key.keyboard.caps.lock',
      'shift': 'key.keyboard.left.shift',
      'lshift': 'key.keyboard.left.shift',
      'rshift': 'key.keyboard.right.shift',
      'ctrl': 'key.keyboard.left.control',
      'control': 'key.keyboard.left.control',
      'lctrl': 'key.keyboard.left.control',
      'rctrl': 'key.keyboard.right.control',
      'alt': 'key.keyboard.left.alt',
      'lalt': 'key.keyboard.left.alt',
      'ralt': 'key.keyboard.right.alt',
      'win': 'key.keyboard.left.win',
      'windows': 'key.keyboard.left.win',
      'up': 'key.keyboard.up',
      'down': 'key.keyboard.down',
      'left': 'key.keyboard.left',
      'right': 'key.keyboard.right',
      '無変換': 'key.keyboard.nonconvert',
      '変換': 'key.keyboard.convert',
      'かな': 'key.keyboard.kana',
    };

    if (aliases[normalized]) return aliases[normalized];

    // デフォルト: key.keyboard.として扱う
    return `key.keyboard.${normalized}`;
  };

  // モーダルが開くたびに現在の設定で状態をリセット
  useEffect(() => {
    if (isOpen) {
      setSelectedAction(currentAction);
      // 既存のリマップをラベル形式で表示
      setRemapInput(currentRemap ? getKeyLabel(currentRemap) : '');
      setExternalToolName(currentExternalTool?.tool || '');
      setExternalToolAction(currentExternalTool?.action || '');
      setExternalToolDescription(currentExternalTool?.description || '');
      setSelectedPreset('');
      setSelectedFinger(currentFinger);
      setActiveTab('action');
    }
  }, [isOpen, currentAction, currentRemap, currentExternalTool, currentFinger]);

  // リマップ候補のフィルタリング
  const filteredRemapOptions = useMemo(() => {
    if (!remapInput.trim()) {
      // 入力がない場合は全カテゴリを返す
      return Object.entries(REMAPPABLE_KEYS);
    }

    const query = remapInput.toLowerCase();
    const filtered: [string, typeof REMAPPABLE_KEYS[keyof typeof REMAPPABLE_KEYS]][] = [];

    for (const [category, keys] of Object.entries(REMAPPABLE_KEYS)) {
      const matchingKeys = keys.filter(k =>
        k.label.toLowerCase().includes(query) ||
        k.value.toLowerCase().includes(query)
      );
      if (matchingKeys.length > 0) {
        filtered.push([category, matchingKeys]);
      }
    }

    return filtered;
  }, [remapInput]);

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
    // 入力値をキーコードに変換
    const finalRemapKey = remapInput.trim() ? parseInputToKeyCode(remapInput) : undefined;

    const config = {
      action: selectedAction || undefined,
      remap: finalRemapKey,
      // 外部ツールはツール名があれば保存（アクションは空でもOK - プリセットの場合）
      externalTool: externalToolName && externalToolName.trim()
        ? { tool: externalToolName.trim(), action: externalToolAction || '', description: externalToolDescription || undefined }
        : undefined,
      finger: selectedFinger,
    };
    console.log('KeybindingModal saving:', { selectedKey, config, parsedRemap: finalRemapKey });
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
        'disabled': '無効化',
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
              <div className="space-y-6">
                {/* 左手 - 小指から親指の順 */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-center">左手</h3>
                  <div className="flex justify-center gap-1">
                    {FINGER_OPTIONS.filter(f => f.hand === 'left').map((finger) => (
                      <button
                        key={finger.value}
                        onClick={() => setSelectedFinger(finger.value)}
                        className={`px-2 py-8 rounded-lg border transition-colors text-center text-xs w-16 ${
                          selectedFinger === finger.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                            : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                        }`}
                        style={{
                          marginTop: finger.value === 'left-pinky' ? '20px' :
                                    finger.value === 'left-ring' ? '8px' :
                                    finger.value === 'left-middle' ? '0px' :
                                    finger.value === 'left-index' ? '4px' : '28px'
                        }}
                      >
                        {finger.label.replace('左手 ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 右手 - 正順で配置（親指から小指） */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-center">右手</h3>
                  <div className="flex justify-center gap-1">
                    {FINGER_OPTIONS.filter(f => f.hand === 'right').map((finger) => (
                      <button
                        key={finger.value}
                        onClick={() => setSelectedFinger(finger.value)}
                        className={`px-2 py-8 rounded-lg border transition-colors text-center text-xs w-16 ${
                          selectedFinger === finger.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                            : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                        }`}
                        style={{
                          marginTop: finger.value === 'right-thumb' ? '28px' :
                                    finger.value === 'right-index' ? '4px' :
                                    finger.value === 'right-middle' ? '0px' :
                                    finger.value === 'right-ring' ? '8px' : '20px'
                        }}
                      >
                        {finger.label.replace('右手 ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedFinger && (
                  <div className="flex justify-center">
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
              <div className="relative" ref={remapDropdownRef}>
                <label className="block text-sm font-medium mb-2">
                  リマップ先のキー
                </label>
                <input
                  type="text"
                  value={remapInput}
                  onChange={(e) => {
                    setRemapInput(e.target.value);
                    if (!showRemapDropdown) setShowRemapDropdown(true);
                  }}
                  onFocus={() => setShowRemapDropdown(true)}
                  placeholder="例: F13, Ctrl, A, 無変換, Numpad 0"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  キー名を入力してください。候補から選択するか、直接入力できます。
                </p>

                {/* ドロップダウン候補 */}
                {showRemapDropdown && filteredRemapOptions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg">
                    {filteredRemapOptions.map(([category, keys]) => (
                      <div key={category}>
                        <div className="px-3 py-1 text-xs font-semibold text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted))] sticky top-0">
                          {category}
                        </div>
                        {keys.map((key) => (
                          <button
                            key={key.value}
                            type="button"
                            onClick={() => {
                              setRemapInput(key.label);
                              setShowRemapDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--muted))] focus:bg-[rgb(var(--muted))] focus:outline-none"
                          >
                            {key.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* プレビュー */}
              {remapInput.trim() && (
                <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatKeyLabel(selectedKey)}</span>
                    {' → '}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {remapInput}
                    </span>
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    キーコード: <code className="px-1 py-0.5 bg-[rgb(var(--background))] rounded text-xs">{parseInputToKeyCode(remapInput)}</code>
                  </p>
                </div>
              )}

              {/* リマップクリアボタン */}
              {remapInput.trim() && (
                <div className="mt-4">
                  <button
                    onClick={() => setRemapInput('')}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    リマップをクリア
                  </button>
                </div>
              )}

              {/* ヘルプテキスト */}
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  <strong>入力例:</strong><br />
                  • ファンクションキー: F13, F14, F20<br />
                  • 文字キー: A, B, C<br />
                  • 修飾キー: Ctrl, Shift, Alt<br />
                  • 特殊キー: Space, Enter, Tab<br />
                  • テンキー: Numpad 0, Keypad 1<br />
                  • 日本語: 無変換, 変換, かな<br />
                  • カスタムコード: key.keyboard.f13
                </p>
              </div>
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
