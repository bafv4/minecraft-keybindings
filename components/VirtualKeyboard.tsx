'use client';

import { useState } from 'react';
import { KeybindingModal } from './KeybindingModal';
import type { Finger, FingerAssignments } from '@/types/player';

interface VirtualKeyboardProps {
  bindings: {
    [action: string]: string;
  };
  onKeyClick?: (key: string) => void;
  mode?: 'display' | 'edit';
  selectedAction?: string | null;
  onSelectAction?: (action: string) => void;
  // リマップと外部ツールの設定
  remappings?: { [key: string]: string };
  externalTools?: { [key: string]: { tool: string; action: string; description?: string } };
  fingerAssignments?: FingerAssignments;
  onUpdateConfig?: (key: string, config: {
    action?: string;
    remap?: string;
    externalTool?: { tool: string; action: string; description?: string };
    finger?: Finger;
  }) => void;
  keyboardLayout?: 'JIS' | 'US';
  showFingerColors?: boolean;
}

// JISキーボードレイアウト定義
const KEYBOARD_LAYOUT_JIS = [
  // Fキー列
  [
    { key: 'key.keyboard.escape', label: 'Esc', width: 'w-16' },
    { key: 'spacer', width: 'w-4' },
    { key: 'key.keyboard.f1', label: 'F1', width: 'w-16' },
    { key: 'key.keyboard.f2', label: 'F2', width: 'w-16' },
    { key: 'key.keyboard.f3', label: 'F3', width: 'w-16' },
    { key: 'key.keyboard.f4', label: 'F4', width: 'w-16' },
    { key: 'spacer', width: 'w-4' },
    { key: 'key.keyboard.f5', label: 'F5', width: 'w-16' },
    { key: 'key.keyboard.f6', label: 'F6', width: 'w-16' },
    { key: 'key.keyboard.f7', label: 'F7', width: 'w-16' },
    { key: 'key.keyboard.f8', label: 'F8', width: 'w-16' },
    { key: 'spacer', width: 'w-4' },
    { key: 'key.keyboard.f9', label: 'F9', width: 'w-16' },
    { key: 'key.keyboard.f10', label: 'F10', width: 'w-16' },
    { key: 'key.keyboard.f11', label: 'F11', width: 'w-16' },
    { key: 'key.keyboard.f12', label: 'F12', width: 'w-16' },
  ],
  // 数字列
  [
    { key: 'key.keyboard.grave.accent', label: '半角', width: 'w-16' },
    { key: 'key.keyboard.1', label: '1', width: 'w-16' },
    { key: 'key.keyboard.2', label: '2', width: 'w-16' },
    { key: 'key.keyboard.3', label: '3', width: 'w-16' },
    { key: 'key.keyboard.4', label: '4', width: 'w-16' },
    { key: 'key.keyboard.5', label: '5', width: 'w-16' },
    { key: 'key.keyboard.6', label: '6', width: 'w-16' },
    { key: 'key.keyboard.7', label: '7', width: 'w-16' },
    { key: 'key.keyboard.8', label: '8', width: 'w-16' },
    { key: 'key.keyboard.9', label: '9', width: 'w-16' },
    { key: 'key.keyboard.0', label: '0', width: 'w-16' },
    { key: 'key.keyboard.minus', label: '-', width: 'w-16' },
    { key: 'key.keyboard.equal', label: '^', width: 'w-16' },
    { key: 'key.keyboard.backslash', label: '¥', width: 'w-16' },
    { key: 'key.keyboard.backspace', label: 'BS', width: 'w-20' },
  ],
  // QWERTY列
  [
    { key: 'key.keyboard.tab', label: 'Tab', width: 'w-20' },
    { key: 'key.keyboard.q', label: 'Q', width: 'w-16' },
    { key: 'key.keyboard.w', label: 'W', width: 'w-16' },
    { key: 'key.keyboard.e', label: 'E', width: 'w-16' },
    { key: 'key.keyboard.r', label: 'R', width: 'w-16' },
    { key: 'key.keyboard.t', label: 'T', width: 'w-16' },
    { key: 'key.keyboard.y', label: 'Y', width: 'w-16' },
    { key: 'key.keyboard.u', label: 'U', width: 'w-16' },
    { key: 'key.keyboard.i', label: 'I', width: 'w-16' },
    { key: 'key.keyboard.o', label: 'O', width: 'w-16' },
    { key: 'key.keyboard.p', label: 'P', width: 'w-16' },
    { key: 'key.keyboard.left.bracket', label: '@', width: 'w-16' },
    { key: 'key.keyboard.right.bracket', label: '[', width: 'w-16' },
  ],
  // ASDF列
  [
    { key: 'key.keyboard.caps.lock', label: 'Caps', width: 'w-24' },
    { key: 'key.keyboard.a', label: 'A', width: 'w-16' },
    { key: 'key.keyboard.s', label: 'S', width: 'w-16' },
    { key: 'key.keyboard.d', label: 'D', width: 'w-16' },
    { key: 'key.keyboard.f', label: 'F', width: 'w-16' },
    { key: 'key.keyboard.g', label: 'G', width: 'w-16' },
    { key: 'key.keyboard.h', label: 'H', width: 'w-16' },
    { key: 'key.keyboard.j', label: 'J', width: 'w-16' },
    { key: 'key.keyboard.k', label: 'K', width: 'w-16' },
    { key: 'key.keyboard.l', label: 'L', width: 'w-16' },
    { key: 'key.keyboard.semicolon', label: ';', width: 'w-16' },
    { key: 'key.keyboard.apostrophe', label: ':', width: 'w-16' },
    { key: 'key.keyboard.enter', label: 'Enter', width: 'w-24' },
  ],
  // ZXCV列 + 矢印キー（上）
  [
    { key: 'key.keyboard.left.shift', label: 'Shift', width: 'w-28' },
    { key: 'key.keyboard.z', label: 'Z', width: 'w-16' },
    { key: 'key.keyboard.x', label: 'X', width: 'w-16' },
    { key: 'key.keyboard.c', label: 'C', width: 'w-16' },
    { key: 'key.keyboard.v', label: 'V', width: 'w-16' },
    { key: 'key.keyboard.b', label: 'B', width: 'w-16' },
    { key: 'key.keyboard.n', label: 'N', width: 'w-16' },
    { key: 'key.keyboard.m', label: 'M', width: 'w-16' },
    { key: 'key.keyboard.comma', label: ',', width: 'w-16' },
    { key: 'key.keyboard.period', label: '.', width: 'w-16' },
    { key: 'key.keyboard.slash', label: '/', width: 'w-16' },
    { key: 'key.keyboard.backslash', label: '\\', width: 'w-16' },
    { key: 'key.keyboard.right.shift', label: 'Shift', width: 'w-20' },
    { key: 'spacer', width: 'w-6' },
    { key: 'spacer', width: 'w-16' },
    { key: 'key.keyboard.up', label: '↑', width: 'w-16' },
    { key: 'spacer', width: 'w-16' },
  ],
  // 最下段 + 矢印キー（下・左・右）
  [
    { key: 'key.keyboard.left.control', label: 'Ctrl', width: 'w-20' },
    { key: 'key.keyboard.left.win', label: 'Win', width: 'w-16' },
    { key: 'key.keyboard.left.alt', label: 'Alt', width: 'w-16' },
    { key: 'key.keyboard.nonconvert', label: '無変換', width: 'w-24' },
    { key: 'key.keyboard.space', label: 'Space', width: 'w-48' },
    { key: 'key.keyboard.convert', label: '変換', width: 'w-24' },
    { key: 'key.keyboard.kana', label: 'かな', width: 'w-16' },
    { key: 'key.keyboard.right.alt', label: 'Alt', width: 'w-16' },
    { key: 'key.keyboard.right.win', label: 'Win', width: 'w-16' },
    { key: 'key.keyboard.menu', label: 'Fn', width: 'w-16' },
    { key: 'key.keyboard.right.control', label: 'Ctrl', width: 'w-20' },
    { key: 'spacer', width: 'w-6' },
    { key: 'key.keyboard.left', label: '←', width: 'w-16' },
    { key: 'key.keyboard.down', label: '↓', width: 'w-16' },
    { key: 'key.keyboard.right', label: '→', width: 'w-16' },
  ],
];

// USキーボードレイアウト定義
const KEYBOARD_LAYOUT_US = [
  // Fキー列
  [
    { key: 'key.keyboard.escape', label: 'Esc', width: 'w-16' },
    { key: 'spacer', width: 'w-4' },
    { key: 'key.keyboard.f1', label: 'F1', width: 'w-16' },
    { key: 'key.keyboard.f2', label: 'F2', width: 'w-16' },
    { key: 'key.keyboard.f3', label: 'F3', width: 'w-16' },
    { key: 'key.keyboard.f4', label: 'F4', width: 'w-16' },
    { key: 'spacer', width: 'w-4' },
    { key: 'key.keyboard.f5', label: 'F5', width: 'w-16' },
    { key: 'key.keyboard.f6', label: 'F6', width: 'w-16' },
    { key: 'key.keyboard.f7', label: 'F7', width: 'w-16' },
    { key: 'key.keyboard.f8', label: 'F8', width: 'w-16' },
    { key: 'spacer', width: 'w-4' },
    { key: 'key.keyboard.f9', label: 'F9', width: 'w-16' },
    { key: 'key.keyboard.f10', label: 'F10', width: 'w-16' },
    { key: 'key.keyboard.f11', label: 'F11', width: 'w-16' },
    { key: 'key.keyboard.f12', label: 'F12', width: 'w-16' },
  ],
  // 数字列
  [
    { key: 'key.keyboard.grave.accent', label: '`', width: 'w-16' },
    { key: 'key.keyboard.1', label: '1', width: 'w-16' },
    { key: 'key.keyboard.2', label: '2', width: 'w-16' },
    { key: 'key.keyboard.3', label: '3', width: 'w-16' },
    { key: 'key.keyboard.4', label: '4', width: 'w-16' },
    { key: 'key.keyboard.5', label: '5', width: 'w-16' },
    { key: 'key.keyboard.6', label: '6', width: 'w-16' },
    { key: 'key.keyboard.7', label: '7', width: 'w-16' },
    { key: 'key.keyboard.8', label: '8', width: 'w-16' },
    { key: 'key.keyboard.9', label: '9', width: 'w-16' },
    { key: 'key.keyboard.0', label: '0', width: 'w-16' },
    { key: 'key.keyboard.minus', label: '-', width: 'w-16' },
    { key: 'key.keyboard.equal', label: '=', width: 'w-16' },
    { key: 'key.keyboard.backspace', label: 'Back', width: 'w-24' },
  ],
  // QWERTY列
  [
    { key: 'key.keyboard.tab', label: 'Tab', width: 'w-20' },
    { key: 'key.keyboard.q', label: 'Q', width: 'w-16' },
    { key: 'key.keyboard.w', label: 'W', width: 'w-16' },
    { key: 'key.keyboard.e', label: 'E', width: 'w-16' },
    { key: 'key.keyboard.r', label: 'R', width: 'w-16' },
    { key: 'key.keyboard.t', label: 'T', width: 'w-16' },
    { key: 'key.keyboard.y', label: 'Y', width: 'w-16' },
    { key: 'key.keyboard.u', label: 'U', width: 'w-16' },
    { key: 'key.keyboard.i', label: 'I', width: 'w-16' },
    { key: 'key.keyboard.o', label: 'O', width: 'w-16' },
    { key: 'key.keyboard.p', label: 'P', width: 'w-16' },
    { key: 'key.keyboard.left.bracket', label: '[', width: 'w-16' },
    { key: 'key.keyboard.right.bracket', label: ']', width: 'w-16' },
    { key: 'key.keyboard.backslash', label: '\\', width: 'w-20' },
  ],
  // ASDF列
  [
    { key: 'key.keyboard.caps.lock', label: 'Caps', width: 'w-24' },
    { key: 'key.keyboard.a', label: 'A', width: 'w-16' },
    { key: 'key.keyboard.s', label: 'S', width: 'w-16' },
    { key: 'key.keyboard.d', label: 'D', width: 'w-16' },
    { key: 'key.keyboard.f', label: 'F', width: 'w-16' },
    { key: 'key.keyboard.g', label: 'G', width: 'w-16' },
    { key: 'key.keyboard.h', label: 'H', width: 'w-16' },
    { key: 'key.keyboard.j', label: 'J', width: 'w-16' },
    { key: 'key.keyboard.k', label: 'K', width: 'w-16' },
    { key: 'key.keyboard.l', label: 'L', width: 'w-16' },
    { key: 'key.keyboard.semicolon', label: ';', width: 'w-16' },
    { key: 'key.keyboard.apostrophe', label: "'", width: 'w-16' },
    { key: 'key.keyboard.enter', label: 'Enter', width: 'w-24' },
  ],
  // ZXCV列 + 矢印キー（上）
  [
    { key: 'key.keyboard.left.shift', label: 'Shift', width: 'w-32' },
    { key: 'key.keyboard.z', label: 'Z', width: 'w-16' },
    { key: 'key.keyboard.x', label: 'X', width: 'w-16' },
    { key: 'key.keyboard.c', label: 'C', width: 'w-16' },
    { key: 'key.keyboard.v', label: 'V', width: 'w-16' },
    { key: 'key.keyboard.b', label: 'B', width: 'w-16' },
    { key: 'key.keyboard.n', label: 'N', width: 'w-16' },
    { key: 'key.keyboard.m', label: 'M', width: 'w-16' },
    { key: 'key.keyboard.comma', label: ',', width: 'w-16' },
    { key: 'key.keyboard.period', label: '.', width: 'w-16' },
    { key: 'key.keyboard.slash', label: '/', width: 'w-16' },
    { key: 'key.keyboard.right.shift', label: 'Shift', width: 'w-28' },
    { key: 'spacer', width: 'w-6' },
    { key: 'spacer', width: 'w-16' },
    { key: 'key.keyboard.up', label: '↑', width: 'w-16' },
    { key: 'spacer', width: 'w-16' },
  ],
  // 最下段 + 矢印キー（下・左・右）
  [
    { key: 'key.keyboard.left.control', label: 'Ctrl', width: 'w-20' },
    { key: 'key.keyboard.left.win', label: 'Win', width: 'w-16' },
    { key: 'key.keyboard.left.alt', label: 'Alt', width: 'w-16' },
    { key: 'key.keyboard.space', label: 'Space', width: 'w-64' },
    { key: 'key.keyboard.right.alt', label: 'Alt', width: 'w-16' },
    { key: 'key.keyboard.right.win', label: 'Win', width: 'w-16' },
    { key: 'key.keyboard.menu', label: 'Fn', width: 'w-16' },
    { key: 'key.keyboard.right.control', label: 'Ctrl', width: 'w-20' },
    { key: 'spacer', width: 'w-6' },
    { key: 'key.keyboard.left', label: '←', width: 'w-16' },
    { key: 'key.keyboard.down', label: '↓', width: 'w-16' },
    { key: 'key.keyboard.right', label: '→', width: 'w-16' },
  ],
];

// マウスボタン（ホイール、MB4、MB5のみ - 攻撃/使うは固定）
const MOUSE_BUTTONS = [
  { key: 'key.mouse.middle', label: 'ホイール', disabled: false },
  { key: 'key.mouse.4', label: 'MB4', disabled: false },
  { key: 'key.mouse.5', label: 'MB5', disabled: false },
];

// 指ごとの色定義（パステルカラー）
const getFingerColor = (finger: Finger): string => {
  const colorMap: Record<Finger, string> = {
    'left-pinky': 'bg-pink-200/70 border-pink-300 dark:bg-pink-300/40 dark:border-pink-400',
    'left-ring': 'bg-purple-200/70 border-purple-300 dark:bg-purple-300/40 dark:border-purple-400',
    'left-middle': 'bg-blue-200/70 border-blue-300 dark:bg-blue-300/40 dark:border-blue-400',
    'left-index': 'bg-green-200/70 border-green-300 dark:bg-green-300/40 dark:border-green-400',
    'left-thumb': 'bg-yellow-200/70 border-yellow-300 dark:bg-yellow-300/40 dark:border-yellow-400',
    'right-thumb': 'bg-orange-200/70 border-orange-300 dark:bg-orange-300/40 dark:border-orange-400',
    'right-index': 'bg-red-200/70 border-red-300 dark:bg-red-300/40 dark:border-red-400',
    'right-middle': 'bg-rose-200/70 border-rose-300 dark:bg-rose-300/40 dark:border-rose-400',
    'right-ring': 'bg-indigo-200/70 border-indigo-300 dark:bg-indigo-300/40 dark:border-indigo-400',
    'right-pinky': 'bg-cyan-200/70 border-cyan-300 dark:bg-cyan-300/40 dark:border-cyan-400',
  };
  return colorMap[finger];
};

export function VirtualKeyboard({
  bindings,
  onKeyClick,
  mode = 'display',
  selectedAction,
  onSelectAction,
  remappings = {},
  externalTools = {},
  fingerAssignments = {},
  onUpdateConfig,
  keyboardLayout = 'JIS',
  showFingerColors = false,
}: VirtualKeyboardProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // キーボードレイアウトを選択
  const KEYBOARD_LAYOUT = keyboardLayout === 'JIS' ? KEYBOARD_LAYOUT_JIS : KEYBOARD_LAYOUT_US;

  // キーに割り当てられたアクションを取得
  const getActionsForKey = (keyCode: string): string[] => {
    return Object.entries(bindings)
      .filter(([_, key]) => key === keyCode)
      .map(([action, _]) => {
        // アクション名を日本語に変換
        const actionNames: { [key: string]: string } = {
          forward: '前進',
          back: '後退',
          left: '左',
          right: '右',
          jump: 'ジャンプ',
          sneak: 'スニーク',
          sprint: 'ダッシュ',
          attack: '攻撃',
          use: '使う',
          pickBlock: 'ブロック選択',
          drop: 'ドロップ',
          inventory: 'ｲﾝﾍﾞﾝﾄﾘ',
          swapHands: 'オフハンド',
          hotbar1: 'HB1',
          hotbar2: 'HB2',
          hotbar3: 'HB3',
          hotbar4: 'HB4',
          hotbar5: 'HB5',
          hotbar6: 'HB6',
          hotbar7: 'HB7',
          hotbar8: 'HB8',
          hotbar9: 'HB9',
        };
        return actionNames[action] || action;
      });
  };

  // モーダルを開く処理
  const handleOpenModal = (keyCode: string) => {
    setSelectedKey(keyCode);
    setModalOpen(true);
  };

  // モーダルから保存された設定を処理
  const handleModalSave = (config: {
    action?: string;
    remap?: string;
    externalTool?: { tool: string; action: string; description?: string };
  }) => {
    console.log('VirtualKeyboard handleModalSave called:', { selectedKey, config, onUpdateConfig: !!onUpdateConfig });
    if (!selectedKey) {
      console.log('VirtualKeyboard: selectedKey is null, returning');
      return;
    }
    if (onUpdateConfig) {
      onUpdateConfig(selectedKey, config);
    } else {
      console.log('VirtualKeyboard: onUpdateConfig is not defined!');
    }
  };

  // キーラベルをフォーマット（リマップ表示用）
  const formatKeyLabel = (keyCode: string): string => {
    if (keyCode.startsWith('key.mouse.')) {
      const button = keyCode.replace('key.mouse.', '');
      const buttonMap: { [key: string]: string } = {
        'left': '左クリック',
        'right': '右クリック',
        'middle': 'ホイール',
        '4': 'MB4',
        '5': 'MB5',
      };
      return buttonMap[button] || button;
    }

    if (keyCode.startsWith('key.keyboard.')) {
      const key = keyCode.replace('key.keyboard.', '');
      const specialKeys: { [key: string]: string } = {
        'left.shift': 'LShift',
        'right.shift': 'RShift',
        'left.control': 'LCtrl',
        'right.control': 'RCtrl',
        'left.alt': 'LAlt',
        'right.alt': 'RAlt',
        'space': 'Space',
        'caps.lock': 'Caps',
        'enter': 'Enter',
        'tab': 'Tab',
        'escape': 'Esc',
        'backspace': 'BS',
        'nonconvert': '無変換',
        'convert': '変換',
        'kana': 'かな',
        'world.1': 'World1',
        'world.2': 'World2',
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
      return key.toUpperCase();
    }

    return keyCode;
  };

  const renderKey = (keyDef: any) => {
    if (keyDef.key === 'spacer') {
      return <div key={Math.random()} className={keyDef.width} />;
    }

    const actions = getActionsForKey(keyDef.key);
    const hasBinding = actions.length > 0;
    const isHovered = hoveredKey === keyDef.key;
    const hasRemap = !!remappings[keyDef.key];
    const hasExternalTool = !!externalTools[keyDef.key];
    const remapTarget = remappings[keyDef.key];
    const externalTool = externalTools[keyDef.key];
    const assignedFinger = fingerAssignments[keyDef.key];

    const handleClick = () => {
      if (mode !== 'edit') return;

      // 編集モードの場合はモーダルを開く
      handleOpenModal(keyDef.key);
    };

    // 背景色のロジック：
    // 1. 指の割り当てがある場合 → 指の色
    // 2. 指の割り当てがないが、何らかのマッピングがある場合 → Primaryカラー
    // 3. 何もない場合 → デフォルト色
    const hasAnyMapping = hasBinding || hasRemap || hasExternalTool;
    const fingerColorClass = showFingerColors && assignedFinger ? getFingerColor(assignedFinger) : '';
    const primaryColorClass = 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300';
    const defaultColorClass = 'bg-[rgb(var(--card))] border-[rgb(var(--border))]';

    let backgroundClass = defaultColorClass;
    if (assignedFinger && showFingerColors) {
      backgroundClass = fingerColorClass;
    } else if (hasAnyMapping) {
      backgroundClass = primaryColorClass;
    }

    // Tooltip用の詳細情報
    const tooltipContent = () => {
      const parts = [];
      if (hasRemap && remapTarget) {
        parts.push(`リマップ: ${formatKeyLabel(keyDef.key)} → ${formatKeyLabel(remapTarget)}`);
      }
      if (actions.length > 0) {
        parts.push(`操作: ${actions.join(', ')}`);
      }
      if (hasExternalTool && externalTool) {
        parts.push(`外部ツール: ${externalTool.tool}${externalTool.description ? ` - ${externalTool.description}` : ''}`);
      }
      if (assignedFinger) {
        const fingerLabels: Record<string, string> = {
          'left-pinky': '左手小指',
          'left-ring': '左手薬指',
          'left-middle': '左手中指',
          'left-index': '左手人差し指',
          'left-thumb': '左手親指',
          'right-thumb': '右手親指',
          'right-index': '右手人差し指',
          'right-middle': '右手中指',
          'right-ring': '右手薬指',
          'right-pinky': '右手小指',
        };
        parts.push(`指: ${fingerLabels[assignedFinger] || assignedFinger}`);
      }
      return parts.join('\n');
    };

    return (
      <button
        key={keyDef.key}
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHoveredKey(keyDef.key)}
        onMouseLeave={() => setHoveredKey(null)}
        disabled={mode === 'display'}
        title={mode === 'display' && (hasAnyMapping || assignedFinger) ? tooltipContent() : undefined}
        className={`${keyDef.width} h-16 rounded border text-sm font-medium transition-all relative ${backgroundClass} ${mode === 'edit' ? 'hover:border-blue-500 cursor-pointer' : 'cursor-default'} ${isHovered && (hasAnyMapping || assignedFinger) ? 'ring-2 ring-blue-500' : ''}`}
      >
        {/* リマップ表示：左上にもともとのキー名（低コントラスト）とリマップ後のキー名（大きく） */}
        {hasRemap && remapTarget ? (
          <div className="absolute top-1 left-1.5 text-xs flex items-baseline gap-1">
            <span className="text-[10px] opacity-40">{keyDef.label}</span>
            <span className="text-sm font-bold">{formatKeyLabel(remapTarget)}</span>
          </div>
        ) : (
          <div className="absolute top-1 left-1.5 text-xs">{keyDef.label}</div>
        )}

        <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
          {/* マイクラのアクション */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-0.5 justify-end">
              {actions.slice(0, 3).map((action, idx) => (
                <span key={idx} className="px-1 py-0 text-[8px] font-medium bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis">
                  {action}
                </span>
              ))}
            </div>
          )}
          {/* 外部ツール表示 */}
          {hasExternalTool && externalTool && (
            <div className="flex justify-end">
              <span className="px-1 py-0 text-[8px] font-medium bg-purple-300 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-sm whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis border border-purple-500 dark:border-purple-600" title={externalTool.description || externalTool.action || externalTool.tool}>
                {externalTool.tool}: {externalTool.description || (externalTool.action ? externalTool.action.split('\n')[0].substring(0, 10) : '')}
              </span>
            </div>
          )}
        </div>
      </button>
    );
  };

  // マウスボタンをレンダリング（簡潔な表示）
  const renderMouseButton = (btn: typeof MOUSE_BUTTONS[0]) => {
    const actions = getActionsForKey(btn.key);
    const hasBinding = actions.length > 0;
    const hasRemap = !!remappings[btn.key];
    const hasExternalTool = !!externalTools[btn.key];
    const remapTarget = remappings[btn.key];
    const externalTool = externalTools[btn.key];
    const assignedFinger = fingerAssignments[btn.key];

    // 背景色のロジック：renderKeyと同じ
    const hasAnyMapping = hasBinding || hasRemap || hasExternalTool;
    const fingerColorClass = showFingerColors && assignedFinger ? getFingerColor(assignedFinger) : '';
    const primaryColorClass = 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300';
    const defaultColorClass = 'bg-[rgb(var(--card))] border-[rgb(var(--border))]';

    let backgroundClass = defaultColorClass;
    if (assignedFinger && showFingerColors) {
      backgroundClass = fingerColorClass;
    } else if (hasAnyMapping) {
      backgroundClass = primaryColorClass;
    }

    // Tooltip用の詳細情報
    const tooltipContent = () => {
      const parts = [];
      if (hasRemap && remapTarget) {
        parts.push(`リマップ: ${formatKeyLabel(btn.key)} → ${formatKeyLabel(remapTarget)}`);
      }
      if (actions.length > 0) {
        parts.push(`操作: ${actions.join(', ')}`);
      }
      if (hasExternalTool && externalTool) {
        parts.push(`外部ツール: ${externalTool.tool}${externalTool.description ? ` - ${externalTool.description}` : ''}`);
      }
      if (assignedFinger) {
        const fingerLabels: Record<string, string> = {
          'left-pinky': '左手小指',
          'left-ring': '左手薬指',
          'left-middle': '左手中指',
          'left-index': '左手人差し指',
          'left-thumb': '左手親指',
          'right-thumb': '右手親指',
          'right-index': '右手人差し指',
          'right-middle': '右手中指',
          'right-ring': '右手薬指',
          'right-pinky': '右手小指',
        };
        parts.push(`指: ${fingerLabels[assignedFinger] || assignedFinger}`);
      }
      return parts.join('\n');
    };

    return (
      <button
        key={btn.key}
        type="button"
        onClick={() => {
          if (mode !== 'edit' || btn.disabled) return;
          handleOpenModal(btn.key);
        }}
        disabled={mode === 'display' || btn.disabled}
        title={mode === 'display' && (hasAnyMapping || assignedFinger) ? tooltipContent() : undefined}
        className={`w-28 h-16 rounded border text-sm font-medium transition-all relative ${backgroundClass} ${mode === 'edit' && !btn.disabled ? 'hover:border-blue-500 cursor-pointer' : 'cursor-default'}`}
      >
        {/* リマップ表示：左上にもともとのキー名（低コントラスト）とリマップ後のキー名（大きく） */}
        {hasRemap && remapTarget ? (
          <div className="absolute top-1 left-1.5 text-xs flex items-baseline gap-1">
            <span className="text-[10px] opacity-40">{btn.label}</span>
            <span className="text-sm font-bold">{formatKeyLabel(remapTarget)}</span>
          </div>
        ) : (
          <div className="absolute top-1 left-1.5 text-xs">{btn.label}</div>
        )}

        <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
          {/* マイクラのアクション */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-0.5 justify-center">
              {actions.slice(0, 2).map((action, idx) => (
                <span key={idx} className="px-1 py-0 text-[8px] font-medium bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis">
                  {action}
                </span>
              ))}
            </div>
          )}
          {/* 外部ツール表示 */}
          {hasExternalTool && externalTool && (
            <div className="flex justify-center">
              <span className="px-1 py-0 text-[8px] font-medium bg-purple-300 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-sm whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis border border-purple-500 dark:border-purple-600" title={externalTool.description || externalTool.action || externalTool.tool}>
                {externalTool.tool}: {externalTool.description || (externalTool.action ? externalTool.action.split('\n')[0].substring(0, 10) : '')}
              </span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* キーボード + マウスボタン */}
      <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
        <h3 className="text-sm font-semibold mb-3">キーボード / マウス ({keyboardLayout})</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {/* キーボード */}
            <div className="flex-1 space-y-1">
              {KEYBOARD_LAYOUT.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map(renderKey)}
                </div>
              ))}
            </div>

            {/* マウスボタン（右側に配置） */}
            <div className="flex flex-col gap-2 justify-center">
              <div className="text-xs font-semibold text-center mb-1">マウス</div>
              {MOUSE_BUTTONS.map(renderMouseButton)}
              <div className="text-xs text-[rgb(var(--muted-foreground))] text-center mt-2">
                <div className="text-[10px]">攻撃/使うは</div>
                <div className="text-[10px]">変更不可</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="text-xs text-[rgb(var(--muted-foreground))] space-y-1">
        <p>青色のキー: 割り当てあり</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0 text-[8px] font-medium bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded">
              例
            </span>
            <span>マイクラ操作</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 py-0 text-[8px] font-medium bg-orange-300 dark:bg-orange-800 text-orange-900 dark:text-orange-100 rounded">
              例
            </span>
            <span>リマップ</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 py-0 text-[8px] font-medium bg-purple-300 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-sm border border-purple-500 dark:border-purple-600">
              例
            </span>
            <span>外部ツール</span>
          </div>
        </div>
        {mode === 'edit' && (
          <p>キーをクリックして設定を編集</p>
        )}
      </div>

      {/* モーダル */}
      {selectedKey && (
        <KeybindingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedKey={selectedKey}
          currentAction={
            Object.entries(bindings).find(([_, key]) => key === selectedKey)?.[0] || null
          }
          currentRemap={remappings[selectedKey]}
          currentExternalTool={externalTools[selectedKey]}
          currentFinger={fingerAssignments[selectedKey]}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
