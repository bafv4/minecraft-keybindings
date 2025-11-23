'use client';

import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { HotbarSlot } from '@/components/HotbarSlot';
import { minecraftToWeb } from '@/lib/keyConversion';
import type { Finger, FingerAssignments } from '@/types/player';

interface SearchCraft {
  id: string;
  sequence: number;
  item1: string | null;
  item2: string | null;
  item3: string | null;
  key1: string | null;
  key2: string | null;
  key3: string | null;
  key4: string | null;
  comment: string | null;
}

interface KeyRemapInfo {
  sourceKey: string;
  targetKey: string;
}

interface SearchCraftDisplayProps {
  searchCrafts: SearchCraft[];
  keyRemaps?: KeyRemapInfo[];
  fingerAssignments?: FingerAssignments;
}

// 指ごとの色定義
const getFingerColor = (finger: Finger): string => {
  const colorMap: Record<Finger, string> = {
    'left-pinky': 'bg-pink-400 border-pink-600 dark:bg-pink-300/40 dark:border-pink-400',
    'left-ring': 'bg-purple-400 border-purple-600 dark:bg-purple-300/40 dark:border-purple-400',
    'left-middle': 'bg-blue-400 border-blue-600 dark:bg-blue-300/40 dark:border-blue-400',
    'left-index': 'bg-green-400 border-green-600 dark:bg-green-300/40 dark:border-green-400',
    'left-thumb': 'bg-yellow-400 border-yellow-600 dark:bg-yellow-300/40 dark:border-yellow-400',
    'right-thumb': 'bg-orange-400 border-orange-600 dark:bg-orange-300/40 dark:border-orange-400',
    'right-index': 'bg-red-400 border-red-600 dark:bg-red-300/40 dark:border-red-400',
    'right-middle': 'bg-rose-400 border-rose-600 dark:bg-rose-300/40 dark:border-rose-400',
    'right-ring': 'bg-indigo-400 border-indigo-600 dark:bg-indigo-300/40 dark:border-indigo-400',
    'right-pinky': 'bg-cyan-400 border-cyan-600 dark:bg-cyan-300/40 dark:border-cyan-400',
  };
  return colorMap[finger];
};

// キーラベルをフォーマット（VirtualKeyboardと同じロジック）
const formatKeyLabel = (keyCode: string): string => {
  if (keyCode.startsWith('key.mouse.')) {
    const button = keyCode.replace('key.mouse.', '');
    const buttonMap: { [key: string]: string } = {
      'left': '左',
      'right': '右',
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
    };

    if (specialKeys[key]) return specialKeys[key];
    return key.toUpperCase();
  }

  // Web形式の場合（KeyA, Digit1, Char_åなど）
  if (keyCode.startsWith('Key') && keyCode.length === 4) {
    return keyCode.charAt(3);
  }
  if (keyCode.startsWith('Digit') && keyCode.length === 6) {
    return keyCode.charAt(5);
  }
  if (keyCode.startsWith('Char_')) {
    return keyCode.substring(5);
  }

  return keyCode;
};

export function SearchCraftDisplay({ searchCrafts, keyRemaps = [], fingerAssignments = {} }: SearchCraftDisplayProps) {
  if (!searchCrafts || searchCrafts.length === 0) {
    return null;
  }

  // キーのリマップ情報を取得
  const getRemapInfo = (keyCode: string) => {
    if (!keyCode) return null;

    // keyCodeをWeb形式に変換
    const webKeyCode = minecraftToWeb(keyCode);

    // リマップ情報を検索（sourceKeyで検索）
    const remap = keyRemaps.find(r => {
      const remapSourceWeb = minecraftToWeb(r.sourceKey);
      return remapSourceWeb === webKeyCode;
    });

    return remap;
  };

  // 指の情報を取得
  const getFingerInfo = (keyCode: string): Finger[] => {
    if (!keyCode) return [];

    const webKeyCode = minecraftToWeb(keyCode);
    return fingerAssignments[webKeyCode] || [];
  };

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <section className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm">
          <Disclosure.Button className="flex w-full items-center justify-between p-6 text-left hover:bg-[rgb(var(--muted))]/30 transition-colors">
            <div>
              <h2 className="text-xl font-bold">サーチクラフト設定</h2>
              <p className="text-sm text-muted-foreground mt-1">
                クラフトアイテムと入力キー設定
              </p>
            </div>
            <ChevronDownIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } h-6 w-6 text-muted-foreground transition-transform duration-200`}
            />
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="px-6 pb-6">
              <div className="space-y-3">
                {searchCrafts.map((craft) => {
                  const items = [craft.item1, craft.item2, craft.item3].filter(Boolean) as string[];
                  const keys = [craft.key1, craft.key2, craft.key3, craft.key4].filter(Boolean) as string[];

                  return (
                    <div key={craft.id} className="bg-background/50 rounded-lg border border-border/50 p-3 space-y-3">
                      <div className="grid items-center gap-4" style={{ gridTemplateColumns: '208px 1fr' }}>
                        {/* アイテム画像 */}
                        <div className="flex gap-2">
                          {items.map((itemId, idx) => (
                            <HotbarSlot
                              key={idx}
                              items={[itemId]}
                              size={64}
                              editable={false}
                            />
                          ))}
                        </div>

                        {/* 押すキー */}
                        <div className="flex gap-2 flex-wrap border-l border-border pl-4">
                          {keys.map((keyCode, idx) => {
                            const remapInfo = getRemapInfo(keyCode);
                            const fingers = getFingerInfo(keyCode);
                            const hasRemap = !!remapInfo;

                            return (
                              <div
                                key={idx}
                                className="w-16 h-16 rounded border text-sm font-medium relative bg-gray-900/10 border-gray-900 dark:bg-gray-100/10 dark:border-gray-100"
                              >
                                {/* リマップ表示 */}
                                {hasRemap && remapInfo ? (
                                  <div className="absolute top-1 left-1.5 text-xs flex flex-col gap-0 items-start">
                                    <span className="text-[10px] opacity-40 leading-tight">
                                      {formatKeyLabel(keyCode)}
                                    </span>
                                    <span className="text-lg font-bold leading-tight">
                                      {formatKeyLabel(remapInfo.targetKey)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="absolute top-1.5 left-2 text-lg">
                                    {formatKeyLabel(keyCode)}
                                  </div>
                                )}

                                {/* 指のチップ表示 */}
                                {fingers.length > 0 && (
                                  <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                                    {fingers.map((finger, fingerIdx) => (
                                      <div
                                        key={fingerIdx}
                                        className={`w-2.5 h-2.5 rounded-full border ${getFingerColor(finger)}`}
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
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* コメント（ある場合のみ表示） */}
                      {craft.comment && (
                        <p className="text-sm">
                          {craft.comment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Disclosure.Panel>
          </Transition>
        </section>
      )}
    </Disclosure>
  );
}
