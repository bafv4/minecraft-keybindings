'use client';

import { useState, useEffect, memo } from 'react';
import { KeybindingModal } from './KeybindingModal';
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Finger, FingerAssignments, CustomKey } from '@/types/player';
import { minecraftToWeb } from '@/lib/keyConversion';

interface VirtualKeyboardProps {
  bindings: {
    [action: string]: string | string[];
  };
  onKeyClick?: (key: string) => void;
  mode?: 'display' | 'edit';
  selectedAction?: string | null;
  onSelectAction?: (action: string) => void;
  // リマップと外部ツールの設定
  remappings?: { [key: string]: string };
  externalTools?: { [key: string]: string }; // keyCode -> action名
  fingerAssignments?: FingerAssignments;
  onUpdateConfig?: (key: string, config: {
    actions?: string[];
    remap?: string;
    externalTool?: string; // アクション名
    finger?: Finger[];
  }) => void;
  keyboardLayout?: 'JIS' | 'JIS-TKL' | 'US' | 'US-TKL';
  showFingerColors?: boolean;
  customKeys?: CustomKey[];
  onAddCustomKey?: (section: 'keyboard' | 'edit' | 'numpad' | 'mouse', label: string) => void;
  onUpdateCustomKey?: (keyCode: string, label: string) => void;
  onDeleteCustomKey?: (keyCode: string) => void;
  stats?: boolean;
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
  // ZXCV列
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
  ],
  // 最下段
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
  // ZXCV列
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
  ],
  // 最下段
  [
    { key: 'key.keyboard.left.control', label: 'Ctrl', width: 'w-20' },
    { key: 'key.keyboard.left.win', label: 'Win', width: 'w-16' },
    { key: 'key.keyboard.left.alt', label: 'Alt', width: 'w-16' },
    { key: 'key.keyboard.space', label: 'Space', width: 'w-64' },
    { key: 'key.keyboard.right.alt', label: 'Alt', width: 'w-16' },
    { key: 'key.keyboard.right.win', label: 'Win', width: 'w-16' },
    { key: 'key.keyboard.menu', label: 'Fn', width: 'w-16' },
    { key: 'key.keyboard.right.control', label: 'Ctrl', width: 'w-20' },
  ],
];

// 編集キー + 矢印キー
const EDIT_KEYS = [
  [
    { key: 'key.keyboard.insert', label: 'Ins', width: 'w-16' },
    { key: 'key.keyboard.home', label: 'Home', width: 'w-16' },
    { key: 'key.keyboard.page.up', label: 'PgUp', width: 'w-16' },
  ],
  [
    { key: 'key.keyboard.delete', label: 'Del', width: 'w-16' },
    { key: 'key.keyboard.end', label: 'End', width: 'w-16' },
    { key: 'key.keyboard.page.down', label: 'PgDn', width: 'w-16' },
  ],
  [
    { key: 'spacer', width: 'w-16' },
    { key: 'key.keyboard.up', label: '↑', width: 'w-16' },
    { key: 'spacer', width: 'w-16' },
  ],
  [
    { key: 'key.keyboard.left', label: '←', width: 'w-16' },
    { key: 'key.keyboard.down', label: '↓', width: 'w-16' },
    { key: 'key.keyboard.right', label: '→', width: 'w-16' },
  ],
];

// テンキー
const NUMPAD_KEYS = [
  [
    { key: 'key.keyboard.num.lock', label: 'NumLock', width: 'w-16' },
    { key: 'key.keyboard.keypad.divide', label: '/', width: 'w-16' },
    { key: 'key.keyboard.keypad.multiply', label: '*', width: 'w-16' },
    { key: 'key.keyboard.keypad.subtract', label: '-', width: 'w-16' },
  ],
  [
    { key: 'key.keyboard.keypad.7', label: '7', width: 'w-16' },
    { key: 'key.keyboard.keypad.8', label: '8', width: 'w-16' },
    { key: 'key.keyboard.keypad.9', label: '9', width: 'w-16' },
    { key: 'key.keyboard.keypad.add', label: '+', width: 'w-16', rowspan: 2 },
  ],
  [
    { key: 'key.keyboard.keypad.4', label: '4', width: 'w-16' },
    { key: 'key.keyboard.keypad.5', label: '5', width: 'w-16' },
    { key: 'key.keyboard.keypad.6', label: '6', width: 'w-16' },
  ],
  [
    { key: 'key.keyboard.keypad.1', label: '1', width: 'w-16' },
    { key: 'key.keyboard.keypad.2', label: '2', width: 'w-16' },
    { key: 'key.keyboard.keypad.3', label: '3', width: 'w-16' },
    { key: 'key.keyboard.keypad.enter', label: 'Enter', width: 'w-16', rowspan: 2 },
  ],
  [
    { key: 'key.keyboard.keypad.0', label: '0', width: 'w-[132px]' },
    { key: 'key.keyboard.keypad.decimal', label: '.', width: 'w-16' },
  ],
];

// マウスボタン（左・右クリックは表示のみ、他は編集可能）
const MOUSE_BUTTONS = [
  { key: 'key.mouse.left', label: '左クリック', disabled: true },
  { key: 'key.mouse.right', label: '右クリック', disabled: true },
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

const VirtualKeyboardComponent = ({
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
  customKeys = [],
  onAddCustomKey,
  onUpdateCustomKey,
  onDeleteCustomKey,
  stats,
}: VirtualKeyboardProps) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedCustomKey, setSelectedCustomKey] = useState<CustomKey | null>(null);
  const [colorCycleIndex, setColorCycleIndex] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [addingKeySection, setAddingKeySection] = useState<'keyboard' | 'edit' | 'numpad' | 'mouse' | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');

  // デバッグ: 受け取ったpropsを確認（表示モードのみ）
  useEffect(() => {
    if (mode === 'display') {
      console.log('[VirtualKeyboard] Props received:', {
        remappingsCount: Object.keys(remappings).length,
        externalToolsCount: Object.keys(externalTools).length,
        fingerAssignmentsCount: Object.keys(fingerAssignments).length,
        showFingerColors,
        remappingsSample: Object.entries(remappings).slice(0, 3),
        externalToolsSample: Object.entries(externalTools).slice(0, 3),
        fingerAssignmentsSample: Object.entries(fingerAssignments).slice(0, 3),
      });
    }
  }, [mode, remappings, externalTools, fingerAssignments, showFingerColors]);

  // 複数の指が割り当てられたキーの色を1.5秒ごとに切り替える
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const startInterval = () => {
      interval = setInterval(() => {
        setColorCycleIndex(prev => prev + 1);
      }, 1500);
    };

    const stopInterval = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    // ページが表示されているときのみインターバルを実行
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    };

    // 初期実行
    startInterval();

    // Page Visibility APIでタブの状態を監視
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // カスタムキーを各カード内のキーリストに分類
  const getCustomKeysForSection = (section: 'keyboard' | 'edit' | 'numpad' | 'mouse') => {
    // keyCodeのプレフィックスでセクションを判定
    return (customKeys || []).filter(key => {
      if (key.keyCode.includes(`custom.${section}`)) return true;
      // 古い形式との互換性のため、プレフィックスがない場合はkeyboardに表示
      if (section === 'keyboard' && !key.keyCode.includes('custom.edit') &&
          !key.keyCode.includes('custom.numpad') && !key.keyCode.includes('custom.mouse')) {
        return true;
      }
      return false;
    });
  };

  // カスタムキー追加ハンドラー
  const handleAddCustomKey = (section: 'keyboard' | 'edit' | 'numpad' | 'mouse') => {
    setAddingKeySection(section);
    setNewKeyLabel('');
    setOpenMenuId(null);
  };

  // カスタムキー作成の確定
  const handleConfirmAddCustomKey = () => {
    if (!addingKeySection || !newKeyLabel.trim()) return;
    if (onAddCustomKey) {
      onAddCustomKey(addingKeySection, newKeyLabel.trim());
    }
    setAddingKeySection(null);
    setNewKeyLabel('');
  };

  // カスタムキー作成のキャンセル
  const handleCancelAddCustomKey = () => {
    setAddingKeySection(null);
    setNewKeyLabel('');
  };

  // キーボードレイアウトを選択（TKLも含む）
  const KEYBOARD_LAYOUT = (keyboardLayout === 'JIS' || keyboardLayout === 'JIS-TKL')
    ? KEYBOARD_LAYOUT_JIS
    : KEYBOARD_LAYOUT_US;
  const isTenkeyless = keyboardLayout === 'JIS-TKL' || keyboardLayout === 'US-TKL';

  // キーに割り当てられたアクションを取得
  const getActionsForKey = (keyCode: string): string[] => {
    // keyCodeがMinecraft形式の場合、Web標準形式に変換してから比較
    const webKeyCode = minecraftToWeb(keyCode);

    return Object.entries(bindings)
      .filter(([_, key]) => {
        // 空文字列や空配列をスキップ
        if (!key || (Array.isArray(key) && key.length === 0)) {
          return false;
        }
        // bindingsの値が配列の場合と文字列の場合の両方に対応
        if (Array.isArray(key)) {
          return key.some(k => k && minecraftToWeb(k) === webKeyCode);
        }
        // bindingsの値をWeb標準形式に変換して比較
        const bindingWebKey = minecraftToWeb(key);
        return bindingWebKey === webKeyCode;
      })
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
          chat: 'チャット',
          command: 'コマンド',
          togglePerspective: '視点変更',
          fullscreen: 'フルスクリーン',
          toggleHud: 'HUD非表示',
          playerList: 'プレイヤーリスト',
          reset: 'リセット',
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

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedKey(null);
  };

  // モーダルから保存された設定を処理
  const handleModalSave = (config: {
    actions?: string[];
    remap?: string;
    externalTool?: string;
    finger?: Finger[];
  }) => {
    if (!selectedKey) {
      return;
    }
    if (onUpdateConfig) {
      onUpdateConfig(selectedKey, config);
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
        'left.win': 'LWin',
        'right.win': 'RWin',
        'space': 'Space',
        'caps.lock': 'Caps',
        'enter': 'Enter',
        'tab': 'Tab',
        'escape': 'Esc',
        'backspace': 'BS',
        'nonconvert': '無変換',
        'convert': '変換',
        'kana': 'かな',
        'menu': 'Menu',
        'world.1': 'World1',
        'world.2': 'World2',
        'section': '§',
        // テンキー
        'num.lock': 'NumLock',
        'keypad.0': '0',
        'keypad.1': '1',
        'keypad.2': '2',
        'keypad.3': '3',
        'keypad.4': '4',
        'keypad.5': '5',
        'keypad.6': '6',
        'keypad.7': '7',
        'keypad.8': '8',
        'keypad.9': '9',
        'keypad.add': '+',
        'keypad.subtract': '-',
        'keypad.multiply': '*',
        'keypad.divide': '/',
        'keypad.decimal': '.',
        'keypad.enter': 'Enter',
        // 編集キー
        'insert': 'Ins',
        'delete': 'Del',
        'home': 'Home',
        'end': 'End',
        'page.up': 'PgUp',
        'page.down': 'PgDn',
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→',
        // 記号
        'grave.accent': '`',
        'minus': '-',
        'equal': '=',
        'left.bracket': '[',
        'right.bracket': ']',
        'backslash': '\\',
        'semicolon': ';',
        'apostrophe': "'",
        'comma': ',',
        'period': '.',
        'slash': '/',
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
        'disabled': '✕',
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

    // keyDef.keyはMinecraft形式なので、Web標準形式に変換してから各マップにアクセス
    const webKeyCode = minecraftToWeb(keyDef.key);

    const actions = getActionsForKey(keyDef.key);
    const hasBinding = actions.length > 0;
    const isHovered = hoveredKey === keyDef.key;
    const hasRemap = !!remappings[webKeyCode];
    const hasExternalTool = !!externalTools[webKeyCode];
    const remapTarget = remappings[webKeyCode];
    const externalTool = externalTools[webKeyCode];
    const assignedFingers = fingerAssignments[webKeyCode] || [];

    // デバッグ: 外部ツール・リマップ・指が設定されているキーをログ出力
    if (mode === 'display' && (hasRemap || hasExternalTool || assignedFingers.length > 0)) {
      console.log(`[VirtualKeyboard] Key ${keyDef.key} (web: ${webKeyCode}):`, {
        hasRemap,
        hasExternalTool,
        assignedFingers,
        remapTarget,
        externalTool,
      });
    }

    const handleClick = () => {
      if (mode === 'edit') {
        // 編集モードの場合はモーダルを開く
        handleOpenModal(keyDef.key);
      } else if (mode === 'display' && onKeyClick) {
        // 表示モードでonKeyClickが指定されている場合は呼び出す
        onKeyClick(keyDef.key);
      }
    };

    // 背景色のロジック：
    // 1. 何らかのマッピングがある場合 → Primaryカラー（黒系/白系）
    // 2. 何もない場合 → デフォルト色
    // 注: 指の色はチップで表示するため、背景色には反映しない
    const isDisabled = remapTarget === 'key.keyboard.disabled';
    const hasAnyMapping = hasBinding || hasRemap || hasExternalTool;
    const primaryColorClass = 'bg-gray-900/10 border-gray-900 dark:bg-gray-100/10 dark:border-gray-100';
    const defaultColorClass = 'bg-[rgb(var(--card))] border-[rgb(var(--border))]';

    let backgroundClass = defaultColorClass;
    if (hasAnyMapping) {
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
        parts.push(`外部ツール・Mod: ${externalTool}`);
      }
      if (assignedFingers.length > 0) {
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
        const fingerNames = assignedFingers.map(f => fingerLabels[f] || f).join(', ');
        parts.push(`指: ${fingerNames}`);
      }
      return parts.join('\n');
    };

    // rowspan サポート: 2行分の場合は高さを2倍 + gap分（4px）
    // h-16 = 64px, gap-1 = 4px, so 2 rows = 64*2 + 4 = 132px
    // ただし、keyDef.heightが指定されている場合はそれを優先（Grid用のh-fullなど）
    const heightClass = keyDef.height || (keyDef.rowspan === 2 ? 'h-[132px]' : 'h-16');

    return (
      <button
        key={keyDef.key}
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHoveredKey(keyDef.key)}
        onMouseLeave={() => setHoveredKey(null)}
        disabled={mode === 'display' && !onKeyClick}
        title={mode === 'display' && (hasAnyMapping || assignedFingers.length > 0) ? tooltipContent() : undefined}
        className={`${keyDef.width} ${heightClass} rounded border text-sm font-medium transition-all relative ${backgroundClass} ${(mode === 'edit' || (mode === 'display' && onKeyClick)) ? 'hover:border-blue-500 cursor-pointer' : 'cursor-default'} ${isHovered && (hasAnyMapping || assignedFingers.length > 0) ? 'ring-2 ring-blue-500' : ''} ${isDisabled ? 'opacity-30' : ''}`}
      >
        {/* リマップ表示：左上にもともとのキー名（低コントラスト）とリマップ後のキー名（大きく） */}
        {hasRemap && remapTarget ? (
          <div className="absolute top-0.5 left-1 text-xs flex flex-col gap-0 items-start">
            <span className="text-[8px] opacity-40 leading-tight">{keyDef.label}</span>
            <span className="text-[14px] font-bold leading-tight">{formatKeyLabel(remapTarget)}</span>
          </div>
        ) : (
            <div className="absolute top-1 left-1.5 text-[14px]">{keyDef.label}</div>
        )}

        {/* 指のチップ表示 - 右上 */}
        {showFingerColors && assignedFingers.length > 0 && (
          <div className="absolute top-1 right-1 flex gap-0.5">
            {assignedFingers.map((finger, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full border ${getFingerColor(finger)}`}
                title={(() => {
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
                  return fingerLabels[finger] || finger;
                })()}
              />
            ))}
          </div>
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
              <span className="px-1 py-0 text-[8px] font-medium bg-gray-400/30 dark:bg-gray-600/30 text-gray-800 dark:text-gray-200 rounded-sm whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis border border-gray-500/40 dark:border-gray-500/40" title={externalTool}>
                {externalTool.includes(':') ? externalTool.split(':')[1].trim() : externalTool}
              </span>
            </div>
          )}
        </div>
      </button>
    );
  };

  // マウスボタンをレンダリング（簡潔な表示）
  const renderMouseButton = (btn: typeof MOUSE_BUTTONS[0], customSize?: { width: string; height: string }) => {
    // btn.keyはMinecraft形式なので、Web標準形式に変換してから各マップにアクセス
    const webKeyCode = minecraftToWeb(btn.key);

    const actions = getActionsForKey(btn.key);
    const hasBinding = actions.length > 0;
    const hasRemap = !!remappings[webKeyCode];
    const hasExternalTool = !!externalTools[webKeyCode];
    const remapTarget = remappings[webKeyCode];
    const externalTool = externalTools[webKeyCode];
    const assignedFingers = fingerAssignments[webKeyCode] || [];

    // 背景色のロジック：renderKeyと同じ
    // 注: 指の色はチップで表示するため、背景色には反映しない
    const isDisabled = remapTarget === 'key.keyboard.disabled';
    const hasAnyMapping = hasBinding || hasRemap || hasExternalTool;
    const primaryColorClass = 'bg-gray-900/10 border-gray-900 dark:bg-gray-100/10 dark:border-gray-100';
    const defaultColorClass = 'bg-[rgb(var(--card))] border-[rgb(var(--border))]';

    let backgroundClass = defaultColorClass;
    if (hasAnyMapping) {
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
        parts.push(`外部ツール・Mod割り当て: ${externalTool}`);
      }
      if (assignedFingers.length > 0) {
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
        const fingerNames = assignedFingers.map(f => fingerLabels[f] || f).join(', ');
        parts.push(`指: ${fingerNames}`);
      }
      return parts.join('\n');
    };

    const sizeClass = customSize ? `${customSize.width} ${customSize.height}` : 'w-28 h-16';

    return (
      <button
        key={btn.key}
        type="button"
        onClick={() => {
          if (btn.disabled) return;
          if (mode === 'edit') {
            handleOpenModal(btn.key);
          } else if (mode === 'display' && onKeyClick) {
            onKeyClick(btn.key);
          }
        }}
        disabled={(mode === 'display' && !onKeyClick) || btn.disabled}
        title={mode === 'display' && (hasAnyMapping || assignedFingers.length > 0) ? tooltipContent() : undefined}
        className={`${sizeClass} rounded border text-sm font-medium transition-all relative ${backgroundClass} ${((mode === 'edit' || (mode === 'display' && onKeyClick)) && !btn.disabled) ? 'hover:border-blue-500 cursor-pointer' : 'cursor-default'} ${isDisabled ? 'opacity-30' : ''}`}
      >
        {/* リマップ表示：左上にもともとのキー名（低コントラスト）とリマップ後のキー名（大きく） */}
        {hasRemap && remapTarget ? (
          <div className="absolute top-0.5 left-1 text-xs flex flex-col gap-0 items-start">
            <span className="text-[8px] opacity-40 leading-tight">{btn.label}</span>
            <span className="text-[11px] font-bold leading-tight">{formatKeyLabel(remapTarget)}</span>
          </div>
        ) : (
          <div className="absolute top-1 left-1.5 text-xs">{btn.label}</div>
        )}

        {/* 指のチップ表示 - 右上 */}
        {showFingerColors && assignedFingers.length > 0 && (
          <div className="absolute top-1 right-1 flex gap-0.5">
            {assignedFingers.map((finger, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full border ${getFingerColor(finger)}`}
                title={(() => {
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
                  return fingerLabels[finger] || finger;
                })()}
              />
            ))}
          </div>
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
              <span className="px-1 py-0 text-[8px] font-medium bg-gray-400/30 dark:bg-gray-600/30 text-gray-800 dark:text-gray-200 rounded-sm whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis border border-gray-500/40 dark:border-gray-500/40" title={externalTool}>
                {externalTool.includes(':') ? externalTool.split(':')[1].trim() : externalTool}
              </span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* キーボード本体 */}
      <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">キーボード ({keyboardLayout})</h3>
          {mode === 'edit' && (
            <div className="relative" data-menu>
              <button
                type="button"
                onClick={() => setOpenMenuId(openMenuId === 'keyboard' ? null : 'keyboard')}
                className="p-1 hover:bg-[rgb(var(--muted))] rounded transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
              {openMenuId === 'keyboard' && (
                <div className="absolute right-0 top-8 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-2 z-20 min-w-[150px]">
                  <button
                    type="button"
                    onClick={() => handleAddCustomKey('keyboard')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[rgb(var(--muted))] rounded transition-colors whitespace-nowrap"
                  >
                    <PlusIcon className="w-4 h-4 flex-shrink-0" />
                    <span>キーを追加</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="space-y-1 min-w-max">
            {KEYBOARD_LAYOUT.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map(renderKey)}
              </div>
            ))}
          </div>
        </div>
        {/* カスタムキー表示 */}
        {(getCustomKeysForSection('keyboard').length > 0 || addingKeySection === 'keyboard') && (
          <div className="mt-3 pt-3 border-t border-[rgb(var(--border))]">
            <div className="text-xs font-semibold mb-2 text-[rgb(var(--muted-foreground))]">カスタムキー</div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {getCustomKeysForSection('keyboard').map((customKey) => {
                const keyDef = { key: customKey.keyCode, label: customKey.label, width: 'w-full' };
                return (
                  <div key={customKey.id}>
                    {renderKey(keyDef)}
                  </div>
                );
              })}
              {addingKeySection === 'keyboard' && (
                <div className="w-full">
                  <div className="h-16 rounded border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-950 flex flex-col items-center justify-center gap-1 p-1">
                    <input
                      type="text"
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmAddCustomKey();
                        if (e.key === 'Escape') handleCancelAddCustomKey();
                      }}
                      placeholder="名前"
                      autoFocus
                      maxLength={6}
                      className="w-full px-1 py-0.5 text-xs text-center border border-blue-300 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleConfirmAddCustomKey}
                        className="px-2 py-0.5 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddCustomKey}
                        className="px-2 py-0.5 text-[10px] bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 編集キー・テンキー・マウス（3段組み） */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 編集キー */}
        <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">編集キー</h3>
            {mode === 'edit' && (
              <div className="relative" data-menu>
                <button
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === 'edit' ? null : 'edit')}
                  className="p-1 hover:bg-[rgb(var(--muted))] rounded transition-colors"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                {openMenuId === 'edit' && (
                  <div className="absolute right-0 top-8 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-2 z-20 min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => handleAddCustomKey('edit')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[rgb(var(--muted))] rounded transition-colors whitespace-nowrap"
                    >
                      <PlusIcon className="w-4 h-4 flex-shrink-0" />
                      <span>キーを追加</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-1">
            {EDIT_KEYS.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map(renderKey)}
              </div>
            ))}
          </div>
          {/* カスタムキー表示 */}
          {(getCustomKeysForSection('edit').length > 0 || addingKeySection === 'edit') && (
            <div className="mt-3 pt-3 border-t border-[rgb(var(--border))]">
              <div className="text-xs font-semibold mb-2 text-[rgb(var(--muted-foreground))]">カスタムキー</div>
              <div className="grid grid-cols-3 gap-2">
                {getCustomKeysForSection('edit').map((customKey) => {
                  const keyDef = { key: customKey.keyCode, label: customKey.label, width: 'w-full' };
                  return (
                    <div key={customKey.id}>
                      {renderKey(keyDef)}
                    </div>
                  );
                })}
                {addingKeySection === 'edit' && (
                  <div className="w-full">
                    <div className="h-16 rounded border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-950 flex flex-col items-center justify-center gap-1 p-1">
                      <input
                        type="text"
                        value={newKeyLabel}
                        onChange={(e) => setNewKeyLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmAddCustomKey();
                          if (e.key === 'Escape') handleCancelAddCustomKey();
                        }}
                        placeholder="名前"
                        autoFocus
                        maxLength={6}
                        className="w-full px-1 py-0.5 text-xs text-center border border-blue-300 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleConfirmAddCustomKey}
                          className="px-2 py-0.5 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAddCustomKey}
                          className="px-2 py-0.5 text-[10px] bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* テンキー（TKLでない場合のみ表示） */}
        {!isTenkeyless && (
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">テンキー</h3>
              {mode === 'edit' && (
                <div className="relative" data-menu>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === 'numpad' ? null : 'numpad')}
                    className="p-1 hover:bg-[rgb(var(--muted))] rounded transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                  {openMenuId === 'numpad' && (
                    <div className="absolute right-0 top-8 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-2 z-20 min-w-[150px]">
                      <button
                        type="button"
                        onClick={() => handleAddCustomKey('numpad')}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[rgb(var(--muted))] rounded transition-colors whitespace-nowrap"
                      >
                        <PlusIcon className="w-4 h-4 flex-shrink-0" />
                        <span>キーを追加</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-[repeat(4,64px)] gap-1 auto-rows-[64px]">
              {/* Row 0: NumLock, /, *, - */}
              {renderKey({ ...NUMPAD_KEYS[0][0], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[0][1], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[0][2], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[0][3], width: 'w-full', height: 'h-full' })}

              {/* Row 1: 7, 8, 9, + (rowspan 2) */}
              {renderKey({ ...NUMPAD_KEYS[1][0], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[1][1], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[1][2], width: 'w-full', height: 'h-full' })}
              <div className="row-span-2">
                {renderKey({ ...NUMPAD_KEYS[1][3], width: 'w-full', height: 'h-full', rowspan: 2 })}
              </div>

              {/* Row 2: 4, 5, 6 */}
              {renderKey({ ...NUMPAD_KEYS[2][0], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[2][1], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[2][2], width: 'w-full', height: 'h-full' })}

              {/* Row 3: 1, 2, 3, Enter (rowspan 2) */}
              {renderKey({ ...NUMPAD_KEYS[3][0], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[3][1], width: 'w-full', height: 'h-full' })}
              {renderKey({ ...NUMPAD_KEYS[3][2], width: 'w-full', height: 'h-full' })}
              <div className="row-span-2">
                {renderKey({ ...NUMPAD_KEYS[3][3], width: 'w-full', height: 'h-full', rowspan: 2 })}
              </div>

              {/* Row 4: 0 (colspan 2), . */}
              <div className="col-span-2">
                {renderKey({ ...NUMPAD_KEYS[4][0], width: 'w-full', height: 'h-full' })}
              </div>
              {renderKey({ ...NUMPAD_KEYS[4][1], width: 'w-full', height: 'h-full' })}
            </div>
            {/* カスタムキー表示 */}
            {(getCustomKeysForSection('numpad').length > 0 || addingKeySection === 'numpad') && (
              <div className="mt-3 pt-3 border-t border-[rgb(var(--border))]">
                <div className="text-xs font-semibold mb-2 text-[rgb(var(--muted-foreground))]">カスタムキー</div>
                <div className="grid grid-cols-4 gap-2">
                  {getCustomKeysForSection('numpad').map((customKey) => {
                    const keyDef = { key: customKey.keyCode, label: customKey.label, width: 'w-full' };
                    return (
                      <div key={customKey.id}>
                        {renderKey(keyDef)}
                      </div>
                    );
                  })}
                  {addingKeySection === 'numpad' && (
                    <div className="w-full">
                      <div className="h-16 rounded border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-950 flex flex-col items-center justify-center gap-1 p-1">
                        <input
                          type="text"
                          value={newKeyLabel}
                          onChange={(e) => setNewKeyLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmAddCustomKey();
                            if (e.key === 'Escape') handleCancelAddCustomKey();
                          }}
                          placeholder="名前"
                          autoFocus
                          maxLength={6}
                          className="w-full px-1 py-0.5 text-xs text-center border border-blue-300 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={handleConfirmAddCustomKey}
                            className="px-2 py-0.5 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelAddCustomKey}
                            className="px-2 py-0.5 text-[10px] bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* マウス */}
        <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">マウス</h3>
            {mode === 'edit' && (
              <div className="relative" data-menu>
                <button
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === 'mouse' ? null : 'mouse')}
                  className="p-1 hover:bg-[rgb(var(--muted))] rounded transition-colors"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                {openMenuId === 'mouse' && (
                  <div className="absolute right-0 top-8 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-2 z-20 min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => handleAddCustomKey('mouse')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[rgb(var(--muted))] rounded transition-colors whitespace-nowrap"
                    >
                      <PlusIcon className="w-4 h-4 flex-shrink-0" />
                      <span>キーを追加</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 max-w-[200px] mx-auto">
            {/* 上部：左クリック、ホイール、右クリック */}
            <div className="flex gap-1">
              {/* 左クリック */}
              <button
                type="button"
                disabled={true}
                className="w-16 h-20 rounded-tl-2xl rounded-bl-lg border bg-[rgb(var(--card))] border-[rgb(var(--border))] cursor-default relative"
              >
                <div className="absolute top-1 left-1.5 text-[10px]">左</div>
                <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                  <span className="px-1 py-0 text-[8px] font-medium bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded whitespace-nowrap">
                    {getActionsForKey('key.mouse.left').slice(0, 1)[0] || '攻撃'}
                  </span>
                </div>
              </button>

              {/* ホイール（中央） */}
              {renderMouseButton(MOUSE_BUTTONS[2], { width: 'w-16', height: 'h-20' })} {/* ホイール */}

              {/* 右クリック */}
              <button
                type="button"
                disabled={true}
                className="w-16 h-20 rounded-tr-2xl rounded-br-lg border bg-[rgb(var(--card))] border-[rgb(var(--border))] cursor-default relative"
              >
                <div className="absolute top-1 right-1.5 text-[10px]">右</div>
                <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                  <span className="px-1 py-0 text-[8px] font-medium bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded whitespace-nowrap">
                    {getActionsForKey('key.mouse.right').slice(0, 1)[0] || '使う'}
                  </span>
                </div>
              </button>
            </div>

            {/* 下部：MB4, MB5（サイドボタン） */}
            <div className="flex gap-1">
              {renderMouseButton(MOUSE_BUTTONS[3], { width: 'w-16', height: 'h-16' })} {/* MB4 */}
              {renderMouseButton(MOUSE_BUTTONS[4], { width: 'w-16', height: 'h-16' })} {/* MB5 */}
            </div>
          </div>
          <div className="text-xs text-[rgb(var(--muted-foreground))] text-center mt-3">
            <div className="text-[10px]">左・右クリックは</div>
            <div className="text-[10px]">変更不可</div>
          </div>
          {/* カスタムキー表示 */}
          {(getCustomKeysForSection('mouse').length > 0 || addingKeySection === 'mouse') && (
            <div className="mt-3 pt-3 border-t border-[rgb(var(--border))]">
              <div className="text-xs font-semibold mb-2 text-[rgb(var(--muted-foreground))]">カスタムキー</div>
              <div className="grid grid-cols-2 gap-2">
                {getCustomKeysForSection('mouse').map((customKey) => {
                  const keyDef = { key: customKey.keyCode, label: customKey.label, width: 'w-full' };
                  return (
                    <div key={customKey.id}>
                      {renderKey(keyDef)}
                    </div>
                  );
                })}
                {addingKeySection === 'mouse' && (
                  <div className="w-full">
                    <div className="h-16 rounded border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-950 flex flex-col items-center justify-center gap-1 p-1">
                      <input
                        type="text"
                        value={newKeyLabel}
                        onChange={(e) => setNewKeyLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmAddCustomKey();
                          if (e.key === 'Escape') handleCancelAddCustomKey();
                        }}
                        placeholder="名前"
                        autoFocus
                        maxLength={6}
                        className="w-full px-1 py-0.5 text-xs text-center border border-blue-300 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleConfirmAddCustomKey}
                          className="px-2 py-0.5 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAddCustomKey}
                          className="px-2 py-0.5 text-[10px] bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* 凡例 */}
      { !stats && (
        <div className="text-xs text-[rgb(var(--muted-foreground))] space-y-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="px-1 py-0 text-[8px] font-medium bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded">
                例
              </span>
              <span>マイクラ操作</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1 py-0 text-[8px] font-medium bg-gray-400/30 dark:bg-gray-600/30 text-gray-800 dark:text-gray-200 rounded-sm border border-gray-500/40 dark:border-gray-500/40">
                例
              </span>
              <span>外部ツール・Mod</span>
            </div>
          </div>

          {/* 指の色分け凡例 */}
          {showFingerColors && (
            <div className="border-t border-[rgb(var(--border))] pt-2">
              <div className="font-semibold mb-2 text-[rgb(var(--foreground))]">指の色分け</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-pink-200/70 border-pink-300 dark:bg-pink-300/40 dark:border-pink-400"></div>
                  <span>左手小指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-purple-200/70 border-purple-300 dark:bg-purple-300/40 dark:border-purple-400"></div>
                  <span>左手薬指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-blue-200/70 border-blue-300 dark:bg-blue-300/40 dark:border-blue-400"></div>
                  <span>左手中指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-green-200/70 border-green-300 dark:bg-green-300/40 dark:border-green-400"></div>
                  <span>左手人差し指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-yellow-200/70 border-yellow-300 dark:bg-yellow-300/40 dark:border-yellow-400"></div>
                  <span>左手親指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-orange-200/70 border-orange-300 dark:bg-orange-300/40 dark:border-orange-400"></div>
                  <span>右手親指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-red-200/70 border-red-300 dark:bg-red-300/40 dark:border-red-400"></div>
                  <span>右手人差し指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-rose-200/70 border-rose-300 dark:bg-rose-300/40 dark:border-rose-400"></div>
                  <span>右手中指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-indigo-200/70 border-indigo-300 dark:bg-indigo-300/40 dark:border-indigo-400"></div>
                  <span>右手薬指</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border bg-cyan-200/70 border-cyan-300 dark:bg-cyan-300/40 dark:border-cyan-400"></div>
                  <span>右手小指</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <p>キーをクリックして設定を編集</p>
          )}
        </div>
      )}

      {/* モーダル */}
      {selectedKey && (() => {
        // selectedKeyをWeb標準形式に変換してから各マップにアクセス
        const webSelectedKey = minecraftToWeb(selectedKey);
        const customKey = customKeys?.find(k => k.keyCode === webSelectedKey);
        const isCustom = !!customKey;

        return (
          <KeybindingModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            selectedKey={selectedKey}
            currentAction={(() => {
              // Find all actions bound to this key
              const boundActions = Object.entries(bindings)
                .filter(([_, keyBinding]) => {
                  // 空文字列や空配列をスキップ
                  if (!keyBinding || (Array.isArray(keyBinding) && keyBinding.length === 0)) {
                    return false;
                  }
                  if (Array.isArray(keyBinding)) {
                    return keyBinding.some(k => k && k === selectedKey);
                  }
                  return keyBinding === selectedKey;
                })
                .map(([action]) => action);

              // Return array if multiple, single string if one, null if none
              if (boundActions.length === 0) return null;
              if (boundActions.length === 1) return boundActions[0];
              return boundActions;
            })()}
            currentRemap={remappings[webSelectedKey]}
            currentExternalTool={externalTools[webSelectedKey]}
            currentFinger={fingerAssignments[webSelectedKey]}
            onSave={handleModalSave}
            isCustomKey={isCustom}
            customKeyLabel={customKey?.label || ''}
            onUpdateCustomKey={isCustom && onUpdateCustomKey ? (label) => {
              onUpdateCustomKey(selectedKey, label);
            } : undefined}
            onDeleteCustomKey={isCustom && onDeleteCustomKey ? () => {
              onDeleteCustomKey(selectedKey);
              handleCloseModal();
            } : undefined}
          />
        );
      })()}
    </div>
  );
};

export const VirtualKeyboard = memo(VirtualKeyboardComponent);
