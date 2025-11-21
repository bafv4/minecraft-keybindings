'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { XMarkIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import type { Finger } from '@/types/player';
import { formatKeyName } from '@/lib/utils';

interface KeybindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: string;
  currentAction: string | string[] | null;
  onSave: (config: {
    actions?: string[];
    remap?: string;
    externalTool?: string;
    finger?: Finger[];
  }) => void;
  currentRemap?: string;
  currentExternalTool?: string;
  currentFinger?: Finger[];
  isCustomKey?: boolean;
  customKeyLabel?: string;
  onUpdateCustomKey?: (label: string) => void;
  onDeleteCustomKey?: () => void;
}

// アクション定義
const ACTIONS = [
  { id: 'forward', label: '前進', category: '移動' },
  { id: 'back', label: '後退', category: '移動' },
  { id: 'left', label: '左移動', category: '移動' },
  { id: 'right', label: '右移動', category: '移動' },
  { id: 'jump', label: 'ジャンプ', category: '移動' },
  { id: 'sneak', label: 'スニーク', category: '移動' },
  { id: 'sprint', label: 'ダッシュ', category: '移動' },
  { id: 'attack', label: '攻撃', category: '操作' },
  { id: 'use', label: '使用', category: '操作' },
  { id: 'pickBlock', label: 'ブロック選択', category: '操作' },
  { id: 'drop', label: 'ドロップ', category: '操作' },
  { id: 'swapHands', label: 'オフハンド持ち替え', category: '操作' },
  { id: 'inventory', label: 'インベントリ', category: 'UI' },
  { id: 'chat', label: 'チャット', category: 'UI' },
  { id: 'command', label: 'コマンド', category: 'UI' },
  { id: 'playerList', label: 'プレイヤーリスト', category: 'UI' },
  { id: 'togglePerspective', label: '視点変更', category: 'UI' },
  { id: 'fullscreen', label: 'フルスクリーン', category: 'UI' },
  { id: 'toggleHud', label: 'HUD非表示', category: 'UI' },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `hotbar${i + 1}`,
    label: `ホットバー${i + 1}`,
    category: 'ホットバー',
  })),
  { id: 'reset', label: 'リセット', category: 'その他' },
];

// 指の選択肢
const FINGER_OPTIONS: { value: Finger; label: string; color: string }[] = [
  { value: 'left-pinky', label: '左小指', color: 'bg-pink-500' },
  { value: 'left-ring', label: '左薬指', color: 'bg-purple-500' },
  { value: 'left-middle', label: '左中指', color: 'bg-blue-500' },
  { value: 'left-index', label: '左人差', color: 'bg-green-500' },
  { value: 'left-thumb', label: '左親指', color: 'bg-yellow-500' },
  { value: 'right-thumb', label: '右親指', color: 'bg-yellow-500' },
  { value: 'right-index', label: '右人差', color: 'bg-green-500' },
  { value: 'right-middle', label: '右中指', color: 'bg-blue-500' },
  { value: 'right-ring', label: '右薬指', color: 'bg-purple-500' },
  { value: 'right-pinky', label: '右小指', color: 'bg-pink-500' },
];

// リマップ可能なキー（簡略版）
const REMAP_KEYS = [
  { value: '', label: 'リマップなし' },
  { value: 'key.keyboard.disabled', label: '無効化' },
  { value: 'key.keyboard.left.shift', label: '左Shift' },
  { value: 'key.keyboard.left.control', label: '左Ctrl' },
  { value: 'key.keyboard.left.alt', label: '左Alt' },
  { value: 'key.keyboard.caps.lock', label: 'Caps Lock' },
  { value: 'key.keyboard.space', label: 'Space' },
  { value: 'key.keyboard.tab', label: 'Tab' },
];

// 外部ツールプリセット
const EXTERNAL_TOOLS = [
  'リセット',
  'Ninb: リセット',
  'SeedQueue: Reset All',
  'マウス感度切替',
  'Zoom',
  'Wide',
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
  isCustomKey = false,
  customKeyLabel = '',
  onUpdateCustomKey,
  onDeleteCustomKey,
}: KeybindingModalProps) {
  // 状態管理
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedFingers, setSelectedFingers] = useState<Finger[]>([]);
  const [remapValue, setRemapValue] = useState('');
  const [remapQuery, setRemapQuery] = useState('');
  const [externalTool, setExternalTool] = useState('');
  const [externalToolQuery, setExternalToolQuery] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // モーダルが開いたら初期化
  useEffect(() => {
    if (isOpen) {
      setSelectedActions(currentAction ? (Array.isArray(currentAction) ? currentAction : [currentAction]) : []);
      setSelectedFingers(currentFinger || []);
      setRemapValue(currentRemap || '');
      setExternalTool(currentExternalTool || '');
      setCustomLabel(customKeyLabel);
    }
  }, [isOpen, currentAction, currentFinger, currentRemap, currentExternalTool, customKeyLabel]);

  // アクションのトグル
  const toggleAction = (actionId: string) => {
    setSelectedActions(prev =>
      prev.includes(actionId) ? prev.filter(a => a !== actionId) : [...prev, actionId]
    );
  };

  // 指のトグル
  const toggleFinger = (finger: Finger) => {
    setSelectedFingers(prev =>
      prev.includes(finger) ? prev.filter(f => f !== finger) : [...prev, finger]
    );
  };

  // 保存処理
  const handleSave = () => {
    // カスタムキーラベルの更新
    if (isCustomKey && onUpdateCustomKey && customLabel !== customKeyLabel) {
      onUpdateCustomKey(customLabel);
    }

    // 設定を保存
    onSave({
      actions: selectedActions.length > 0 ? selectedActions : undefined,
      finger: selectedFingers.length > 0 ? selectedFingers : undefined,
      remap: remapValue || undefined,
      externalTool: externalTool || undefined,
    });

    onClose();
  };

  // タブ定義
  const tabs = [
    { id: 'action', label: '操作割り当て' },
    { id: 'finger', label: '指の割り当て' },
    { id: 'remap', label: 'リマップ' },
    { id: 'external', label: '外部ツール' },
    ...(isCustomKey ? [{ id: 'custom', label: 'カスタムキー' }] : []),
  ];

  // カテゴリ別にアクションをグループ化
  const groupedActions = ACTIONS.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, typeof ACTIONS>);

  // リマップキーのフィルタリング
  const filteredRemapKeys = remapQuery === ''
    ? REMAP_KEYS
    : REMAP_KEYS.filter((key) =>
        key.label.toLowerCase().includes(remapQuery.toLowerCase())
      );

  // 外部ツールのフィルタリング
  const filteredExternalTools = externalToolQuery === ''
    ? EXTERNAL_TOOLS
    : EXTERNAL_TOOLS.filter((tool) =>
        tool.toLowerCase().includes(externalToolQuery.toLowerCase())
      );

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* 背景オーバーレイ */}
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        {/* モーダル本体 */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* ヘッダー */}
              <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                      キー設定
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      <kbd className="bg-muted border border-border rounded px-2 py-0.5 text-xs font-mono">
                        {formatKeyName(selectedKey)}
                      </kbd>
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* タブナビゲーション & コンテンツ */}
              <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
                {/* モバイル用ドロップダウン */}
                <div className="md:hidden p-2 bg-muted/30">
                  <select
                    value={selectedTabIndex}
                    onChange={(e) => setSelectedTabIndex(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  >
                    {tabs.map((tab, index) => (
                      <option key={tab.id} value={index}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* デスクトップ用タブ */}
                <TabList className="hidden md:flex gap-2 p-2 bg-muted/30">
                  {tabs.map((tab, index) => (
                    <Tab
                      key={tab.id}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none ${
                        selectedTabIndex === index
                          ? 'bg-accent text-foreground shadow'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels className="p-6 max-h-[60vh] overflow-y-auto">
                  {/* 操作割り当てタブ */}
                  <TabPanel className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      このキーに割り当てる操作を選択してください（複数選択可）
                    </p>
                    {Object.entries(groupedActions).map(([category, actions]) => (
                      <div key={category}>
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{category}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {actions.map(action => {
                            const isSelected = selectedActions.includes(action.id);
                            return (
                              <button
                                key={action.id}
                                onClick={() => toggleAction(action.id)}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                  isSelected
                                    ? 'border-foreground/20 bg-accent text-foreground font-medium'
                                    : 'border-border hover:bg-accent/50 hover:border-foreground/10'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isSelected && <CheckIcon className="w-4 h-4 flex-shrink-0" />}
                                  <span className="truncate">{action.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </TabPanel>

                  {/* 指の割り当てタブ */}
                  <TabPanel className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      このキーを押す指を選択してください（複数選択可）
                    </p>
                    <div className="grid grid-cols-5 gap-3">
                      {FINGER_OPTIONS.map(finger => {
                        const isSelected = selectedFingers.includes(finger.value);
                        return (
                          <button
                            key={finger.value}
                            onClick={() => toggleFinger(finger.value)}
                            className={`p-4 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-foreground/20 bg-accent'
                                : 'border-border hover:bg-accent/50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full ${finger.color} mx-auto mb-2`} />
                            <div className="text-xs font-medium text-center">{finger.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </TabPanel>

                  {/* リマップタブ */}
                  <TabPanel className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      物理的なキーを別のキーにリマップします（例: Caps Lock → Ctrl）
                    </p>
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
                          <ComboboxOptions className="absolute z-[60] mt-1 w-full max-h-60 overflow-auto rounded-lg bg-popover border border-border shadow-lg focus:outline-none">
                            {filteredRemapKeys.length === 0 && remapQuery !== '' ? (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                カスタム値: "{remapQuery}"
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
                  </TabPanel>

                  {/* 外部ツールタブ */}
                  <TabPanel className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      外部ツールやModの機能を割り当てます
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2">外部ツールを選択</label>
                      <Combobox
                        value={externalTool}
                        onChange={(value) => setExternalTool(value || '')}
                        immediate
                      >
                        <div className="relative">
                          <ComboboxInput
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                            onChange={(event) => {
                              setExternalToolQuery(event.target.value);
                              setExternalTool(event.target.value);
                            }}
                            placeholder="外部ツールを選択または入力"
                          />
                          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                          </ComboboxButton>
                          <ComboboxOptions className="absolute z-[60] mt-1 w-full max-h-60 overflow-auto rounded-lg bg-popover border border-border shadow-lg focus:outline-none">
                            {filteredExternalTools.length === 0 && externalToolQuery !== '' ? (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                カスタム値: "{externalToolQuery}"
                              </div>
                            ) : (
                              filteredExternalTools.map((tool) => (
                                <ComboboxOption
                                  key={tool}
                                  value={tool}
                                  className="px-4 py-2 text-sm cursor-pointer ui-active:bg-accent ui-selected:bg-accent ui-selected:font-medium"
                                >
                                  {tool}
                                </ComboboxOption>
                              ))
                            )}
                          </ComboboxOptions>
                        </div>
                      </Combobox>
                    </div>
                  </TabPanel>

                  {/* カスタムキータブ */}
                  {isCustomKey && (
                    <TabPanel className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        カスタムキーの表示名を編集します
                      </p>
                      <div>
                        <label className="block text-sm font-medium mb-2">表示名</label>
                        <input
                          type="text"
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                          placeholder="例: G1ボタン、サイドボタン上"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        />
                      </div>
                      {onDeleteCustomKey && (
                        <button
                          onClick={() => {
                            if (confirm('このカスタムキーを削除しますか？')) {
                              onDeleteCustomKey();
                              onClose();
                            }
                          }}
                          className="w-full px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition"
                        >
                          カスタムキーを削除
                        </button>
                      )}
                    </TabPanel>
                  )}
                </TabPanels>
              </TabGroup>

              {/* フッター */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedActions.length > 0 && `${selectedActions.length}個の操作`}
                  {selectedActions.length > 0 && selectedFingers.length > 0 && ' · '}
                  {selectedFingers.length > 0 && `${selectedFingers.length}本の指`}
                </div>
                <div className="flex gap-3">
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
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
