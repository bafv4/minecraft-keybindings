'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@/components/ui/Combobox';
import type { Finger } from '@/types/player';

interface KeybindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: string;
  currentAction: string | string[] | null;
  onSave: (config: {
    actions?: string[]; // 複数のアクションを配列で受け取る
    remap?: string;
    externalTool?: string; // アクション名（例: "Jingle:ThinBT" or カスタム文字列）
    finger?: Finger[];
  }) => void;
  // 既存の設定を渡す
  currentRemap?: string;
  currentExternalTool?: string; // アクション名
  currentFinger?: Finger[];
  // カスタムキー関連
  isCustomKey?: boolean;
  customKeyLabel?: string;
  onUpdateCustomKey?: (label: string) => void;
  onDeleteCustomKey?: () => void;
}

type TabType = 'action' | 'remap' | 'external' | 'finger' | 'custom';

// 外部ツールアクションのプリセット定義
const EXTERNAL_TOOL_ACTIONS = [
  { value: 'ThinBT', label: 'ThinBT' },
  { value: 'Wide', label: 'Wide' },
  { value: 'Zoom', label: 'Zoom' },
  { value: 'マウス感度切替', label: 'マウス感度切替' },
  { value: 'Ninb: リセット', label: 'Ninb: リセット' },
  { value: 'Ninb: Undo', label: 'Ninb: Undo' },
  { value: 'Ninb: Redo', label: 'Ninb: Redo' },
  { value: 'Ninb: ロック', label: 'Ninb: ロック' },
  { value: 'Ninb: +0.01', label: 'Ninb: +0.01' },
  { value: 'Ninb: -0.01', label: 'Ninb: -0.01' },
  { value: 'Ninb: 表示切替', label: 'Ninb: 表示切替' },
  { value: 'Ninb: Blue Boat', label: 'Ninb: Blue Boat' },
  { value: 'SeedQueue: Reset All', label: 'SeedQueue: Reset All' },
  { value: 'SeedQueue: Play Instance', label: 'SeedQueue: Play Instance' },
  { value: 'SeedQueue: Lock Instance', label: 'SeedQueue: Lock Instance' },
  { value: 'SeedQueue: Play Next Lock', label: 'SeedQueue: Play Next Lock' },
];

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
  '編集キー': [
    { value: 'key.keyboard.insert', label: 'Insert' },
    { value: 'key.keyboard.delete', label: 'Delete' },
    { value: 'key.keyboard.home', label: 'Home' },
    { value: 'key.keyboard.end', label: 'End' },
    { value: 'key.keyboard.page.up', label: 'Page Up' },
    { value: 'key.keyboard.page.down', label: 'Page Down' },
  ],
  'テンキー': [
    { value: 'key.keyboard.keypad.0', label: 'テンキー 0' },
    { value: 'key.keyboard.keypad.1', label: 'テンキー 1' },
    { value: 'key.keyboard.keypad.2', label: 'テンキー 2' },
    { value: 'key.keyboard.keypad.3', label: 'テンキー 3' },
    { value: 'key.keyboard.keypad.4', label: 'テンキー 4' },
    { value: 'key.keyboard.keypad.5', label: 'テンキー 5' },
    { value: 'key.keyboard.keypad.6', label: 'テンキー 6' },
    { value: 'key.keyboard.keypad.7', label: 'テンキー 7' },
    { value: 'key.keyboard.keypad.8', label: 'テンキー 8' },
    { value: 'key.keyboard.keypad.9', label: 'テンキー 9' },
    { value: 'key.keyboard.keypad.add', label: 'テンキー +' },
    { value: 'key.keyboard.keypad.subtract', label: 'テンキー -' },
    { value: 'key.keyboard.keypad.multiply', label: 'テンキー *' },
    { value: 'key.keyboard.keypad.divide', label: 'テンキー /' },
    { value: 'key.keyboard.keypad.decimal', label: 'テンキー .' },
    { value: 'key.keyboard.keypad.enter', label: 'テンキー Enter' },
    { value: 'key.keyboard.keypad.equal', label: 'テンキー =' },
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

// REMAPPABLE_KEYSをCombobox用のフラット配列に変換
const REMAPPABLE_KEYS_OPTIONS = Object.entries(REMAPPABLE_KEYS).flatMap(([category, keys]) =>
  keys.map(key => ({ value: key.value, label: key.label, category }))
);

export function KeybindingModal({
  isOpen,
  onClose,
  selectedKey,
  currentAction,
  onSave,
  currentRemap,
  currentExternalTool,
  currentFinger,
  isCustomKey = false,
  customKeyLabel = '',
  onUpdateCustomKey,
  onDeleteCustomKey,
}: KeybindingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('action');
  const [editedLabel, setEditedLabel] = useState(customKeyLabel);
  // 複数のアクションを選択できるように配列で管理
  const [selectedActions, setSelectedActions] = useState<string[]>(() => {
    if (!currentAction) return [];
    return Array.isArray(currentAction) ? currentAction : [currentAction];
  });
  const [remapInput, setRemapInput] = useState<string>(currentRemap || ''); // キーコード（Minecraft形式）
  const [externalToolAction, setExternalToolAction] = useState<string>(currentExternalTool || '');
  const [selectedFingers, setSelectedFingers] = useState<Finger[]>(currentFinger || []);

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

  // モーダルが開くたびに現在の設定で状態をリセット
  useEffect(() => {
    if (isOpen) {
      setSelectedActions(() => {
        if (!currentAction) return [];
        return Array.isArray(currentAction) ? currentAction : [currentAction];
      });
      setRemapInput(currentRemap || '');
      setExternalToolAction(currentExternalTool || '');
      setSelectedFingers(currentFinger || []);
      setActiveTab('action');
    }
  }, [isOpen, currentAction, currentRemap, currentExternalTool, currentFinger]);

  if (!isOpen) return null;

  const handleSave = () => {
    // カスタムキーのラベル更新
    if (isCustomKey && onUpdateCustomKey && editedLabel !== customKeyLabel) {
      onUpdateCustomKey(editedLabel);
    }

    const config = {
      actions: selectedActions.length > 0 ? selectedActions : undefined,
      remap: remapInput.trim() || undefined,
      // 外部ツールアクション（空文字列でない場合のみ保存）
      externalTool: externalToolAction.trim() || undefined,
      finger: selectedFingers.length > 0 ? selectedFingers : undefined,
    };
    console.log('KeybindingModal saving:', { selectedKey, config });
    onSave(config);
    onClose();
  };

  // アクションの選択/解除を切り替える
  const toggleAction = (actionId: string) => {
    setSelectedActions(prev => {
      if (prev.includes(actionId)) {
        // 既に選択されている場合は削除
        return prev.filter(id => id !== actionId);
      } else {
        // 選択されていない場合は追加
        return [...prev, actionId];
      }
    });
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
        // 編集キー
        'insert': 'Insert',
        'delete': 'Delete',
        'home': 'Home',
        'end': 'End',
        'page.up': 'Page Up',
        'page.down': 'Page Down',
        // テンキー
        'keypad.0': 'テンキー 0',
        'keypad.1': 'テンキー 1',
        'keypad.2': 'テンキー 2',
        'keypad.3': 'テンキー 3',
        'keypad.4': 'テンキー 4',
        'keypad.5': 'テンキー 5',
        'keypad.6': 'テンキー 6',
        'keypad.7': 'テンキー 7',
        'keypad.8': 'テンキー 8',
        'keypad.9': 'テンキー 9',
        'keypad.add': 'テンキー +',
        'keypad.subtract': 'テンキー -',
        'keypad.multiply': 'テンキー *',
        'keypad.divide': 'テンキー /',
        'keypad.decimal': 'テンキー .',
        'keypad.enter': 'テンキー Enter',
        'keypad.equal': 'テンキー =',
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

  // Map activeTab to tab index
  const tabMapping: TabType[] = ['action', 'finger', 'remap', 'external'];
  if (isCustomKey) tabMapping.push('custom');
  const currentTabIndex = tabMapping.indexOf(activeTab);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </TransitionChild>

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="glass-card border border-[rgb(var(--border))]/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* ヘッダー */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))] flex-shrink-0">
                <DialogTitle className="text-xl font-semibold">
                  キー設定: {formatKeyLabel(selectedKey)}
                </DialogTitle>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* タブ */}
              <TabGroup selectedIndex={currentTabIndex} onChange={(index) => setActiveTab(tabMapping[index])}>
                <TabList className="flex border-b border-[rgb(var(--border))] flex-shrink-0">
                  <Tab
                    className={({ selected }) =>
                      `flex-1 px-4 py-3 font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                        selected
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                      }`
                    }
                  >
                    操作割り当て
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `flex-1 px-4 py-3 font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                        selected
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                      }`
                    }
                  >
                    指の割り当て
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `flex-1 px-4 py-3 font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                        selected
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                      }`
                    }
                  >
                    リマップ
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `flex-1 px-4 py-3 font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                        selected
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                      }`
                    }
                  >
                    外部ツール・Mod
                  </Tab>
                  {isCustomKey && (
                    <Tab
                      className={({ selected }) =>
                        `flex-1 px-4 py-3 font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                          selected
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                        }`
                      }
                    >
                      カスタムキー
                    </Tab>
                  )}
                </TabList>

        {/* コンテンツ */}
        <div className="px-6 py-4 min-h-[300px] overflow-y-auto flex-1">
          {activeTab === 'action' && (
            <div className="space-y-3">
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                このキーに割り当てる操作を選択してください（複数選択可、重複なし）
              </p>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => {
                  const isSelected = selectedActions.includes(action.id);
                  return (
                    <button
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      className={`px-4 py-2 rounded-lg border transition-colors text-left flex items-center gap-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 font-semibold'
                          : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                      }`}
                    >
                      {isSelected && (
                        <CheckIcon className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span className={isSelected ? '' : 'ml-7'}>{action.label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedActions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm">
                    <strong>選択中:</strong> {selectedActions.length}個のアクション
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'finger' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                このキーをどの指で押すかを選択してください。複数の指を選択できます。指による色分け表示が有効になります。
              </p>
              <div className="space-y-6">
                {/* 左手 - 小指から親指の順 */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-center">左手</h3>
                  <div className="flex justify-center gap-1">
                    {FINGER_OPTIONS.filter(f => f.hand === 'left').map((finger) => {
                      const isSelected = selectedFingers.includes(finger.value);
                      return (
                        <button
                          key={finger.value}
                          onClick={() => {
                            // トグル動作: 選択されていれば解除、されていなければ追加
                            setSelectedFingers(prev =>
                              isSelected
                                ? prev.filter(f => f !== finger.value)
                                : [...prev, finger.value]
                            );
                          }}
                          className={`px-2 py-8 rounded-lg border transition-colors text-center text-xs w-16 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 text-blue-600 font-bold'
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
                      );
                    })}
                  </div>
                </div>
                {/* 右手 - 正順で配置（親指から小指） */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-center">右手</h3>
                  <div className="flex justify-center gap-1">
                    {FINGER_OPTIONS.filter(f => f.hand === 'right').map((finger) => {
                      const isSelected = selectedFingers.includes(finger.value);
                      return (
                        <button
                          key={finger.value}
                          onClick={() => {
                            // トグル動作: 選択されていれば解除、されていなければ追加
                            setSelectedFingers(prev =>
                              isSelected
                                ? prev.filter(f => f !== finger.value)
                                : [...prev, finger.value]
                            );
                          }}
                          className={`px-2 py-8 rounded-lg border transition-colors text-center text-xs w-16 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 text-blue-600 font-bold'
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
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'remap' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                このキーを別のキーに置き換えます。ハードウェアレベルでの変更をシミュレートします。
              </p>

              <Combobox
                label="リマップ先のキー"
                value={remapInput}
                onChange={setRemapInput}
                options={REMAPPABLE_KEYS_OPTIONS}
                placeholder="例: F13, 無変換, A"
                allowCustomValue={true}
                helpText="候補から選択するか、直接キー名を入力してください"
              />

              {/* プレビュー */}
              {remapInput.trim() && (
                <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatKeyLabel(selectedKey)}</span>
                    {' → '}
                    <span className="font-medium text-primary">
                      {getKeyLabel(remapInput)}
                    </span>
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    キーコード: <code className="px-1 py-0.5 bg-[rgb(var(--background))] rounded text-xs">{remapInput}</code>
                  </p>
                </div>
              )}

              {/* ヘルプテキスト */}
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  <strong>使用例:</strong><br />
                  • Caps Lock → Ctrlに変更（修飾キー化）<br />
                  • 無変換 → F13に変更（ファンクションキー化）<br />
                  • マウスサイドボタン → Ctrlに変更<br />
                  • 無効化: 特殊 > 無効化を選択
                </p>
              </div>
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                外部ツールやModで実行するアクションを設定します。
                ドロップダウンから選択するか、直接入力してください。
              </p>

              {/* アクション選択・入力 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  アクション
                </label>
                <input
                  type="text"
                  list="external-tool-actions"
                  value={externalToolAction}
                  onChange={(e) => setExternalToolAction(e.target.value)}
                  placeholder="ドロップダウンから選択、または直接入力"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
                <datalist id="external-tool-actions">
                  {EXTERNAL_TOOL_ACTIONS.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </datalist>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  プリセットから選択するか、カスタムアクション名を入力してください
                </p>
              </div>
            </div>
          )}

          {activeTab === 'custom' && isCustomKey && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                カスタムキーの名前を変更、または削除できます
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">
                  キー名
                </label>
                <input
                  type="text"
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  placeholder="キー名（例: F13, MB4）"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  キーボード上に表示される名前です（最大6文字）
                </p>
              </div>
              <div className="pt-4 border-t border-[rgb(var(--border))]">
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
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2 text-center">
                  削除すると、このキーに割り当てられた設定もすべて失われます
                </p>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgb(var(--border))] flex-shrink-0">
          {/* 左側: 各タブのクリアボタン */}
          <div>
            {activeTab === 'action' && selectedActions.length > 0 && (
              <button
                onClick={() => setSelectedActions([])}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                割り当てをクリア
              </button>
            )}
            {activeTab === 'finger' && selectedFingers.length > 0 && (
              <button
                onClick={() => setSelectedFingers([])}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                割り当てをクリア
              </button>
            )}
            {activeTab === 'remap' && remapInput.trim() && (
              <button
                onClick={() => setRemapInput('')}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                リマップをクリア
              </button>
            )}
            {activeTab === 'external' && externalToolAction && (
              <button
                onClick={() => setExternalToolAction('')}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                割り当てをクリア
              </button>
            )}
          </div>

          {/* 右側: 保存・キャンセルボタン */}
          <div className="flex items-center gap-3">
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
              </TabGroup>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
