'use client';

import { HotbarSlot } from '@/components/HotbarSlot';
import { minecraftToWeb } from '@/lib/keyConversion';
import { createRemapMap, resolveSearchStrToKeys } from '@/lib/remapUtils';
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
  searchStr: string | null; // サーチ文字列（リマップ後）
  comment: string | null;
}

interface KeyRemapInfo {
  sourceKey: string;
  targetKey: string | null;
}

interface SearchCraftDisplayProps {
  searchCrafts: SearchCraft[];
  keyRemaps?: KeyRemapInfo[];
  fingerAssignments?: FingerAssignments;
}

// 指ごとの色定義
const getFingerColor = (finger: Finger): string => {
  const colorMap: Record<Finger, string> = {
    'left-pinky': 'bg-pink-400 border-pink-600 dark:bg-pink-400 dark:border-pink-500',
    'left-ring': 'bg-purple-400 border-purple-600 dark:bg-purple-400 dark:border-purple-500',
    'left-middle': 'bg-blue-400 border-blue-600 dark:bg-blue-400 dark:border-blue-500',
    'left-index': 'bg-green-400 border-green-600 dark:bg-green-400 dark:border-green-500',
    'left-thumb': 'bg-yellow-400 border-yellow-600 dark:bg-yellow-400 dark:border-yellow-500',
    'right-thumb': 'bg-orange-400 border-orange-600 dark:bg-orange-400 dark:border-orange-500',
    'right-index': 'bg-red-400 border-red-600 dark:bg-red-400 dark:border-red-500',
    'right-middle': 'bg-rose-400 border-rose-600 dark:bg-rose-400 dark:border-rose-500',
    'right-ring': 'bg-indigo-400 border-indigo-600 dark:bg-indigo-400 dark:border-indigo-500',
    'right-pinky': 'bg-cyan-400 border-cyan-600 dark:bg-cyan-400 dark:border-cyan-500',
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

  // Web形式の特殊キー
  const webSpecialKeys: { [key: string]: string } = {
    'ControlLeft': 'LCtrl',
    'ControlRight': 'RCtrl',
    'ShiftLeft': 'LShift',
    'ShiftRight': 'RShift',
    'AltLeft': 'LAlt',
    'AltRight': 'RAlt',
    'MetaLeft': 'LWin',
    'MetaRight': 'RWin',
    'Space': 'Space',
    'Enter': 'Enter',
    'Tab': 'Tab',
    'Backspace': 'Backspace',
    'Escape': 'Esc',
    'CapsLock': 'Caps',
    'Insert': 'Ins',
    'Delete': 'Del',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'PgUp',
    'PageDown': 'PgDn',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Minus': '-',
    'Equal': '=',
    'BracketLeft': '[',
    'BracketRight': ']',
    'Backslash': '\\',
    'Semicolon': ';',
    'Quote': "'",
    'Comma': ',',
    'Period': '.',
    'Slash': '/',
    'Backquote': '`',
    'MouseLeft': '左',
    'MouseRight': '右',
    'MouseMiddle': 'ホイール',
    'Mouse4': 'MB4',
    'Mouse5': 'MB5',
  };

  if (webSpecialKeys[keyCode]) return webSpecialKeys[keyCode];

  return keyCode;
};

export function SearchCraftDisplay({ searchCrafts, keyRemaps = [], fingerAssignments = {} }: SearchCraftDisplayProps) {
  if (!searchCrafts || searchCrafts.length === 0) {
    return null;
  }

  // リマップマップを作成（Web形式のキーコード）
  const remappings: Record<string, string> = {};
  keyRemaps.forEach(remap => {
    if (remap.targetKey) {
      const sourceWeb = minecraftToWeb(remap.sourceKey);
      const targetWeb = minecraftToWeb(remap.targetKey);
      remappings[sourceWeb] = targetWeb;
    }
  });
  const remapMap = createRemapMap(remappings);

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

    if (!remap) return null;

    // targetKey を Web 形式に正規化
    return {
      sourceKey: remap.sourceKey,
      targetKey: remap.targetKey ? minecraftToWeb(remap.targetKey) : null,
    };
  };

  // 指の情報を取得
  const getFingerInfo = (keyCode: string): Finger[] => {
    if (!keyCode) return [];

    const webKeyCode = minecraftToWeb(keyCode);
    return fingerAssignments[webKeyCode] || [];
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">サーチクラフト設定</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {searchCrafts.map((craft) => {
          const items = [craft.item1, craft.item2, craft.item3].filter(Boolean) as string[];

          // searchStr がある場合はそれを使用、ない場合は key1-key4 をフォールバック
          let keys: string[];
          if (craft.searchStr && craft.searchStr.trim() !== '') {
            // searchStr からリマップ前のキーを特定
            try {
              keys = resolveSearchStrToKeys(craft.searchStr, remapMap);
              // 空の結果の場合はフォールバックを使用
              if (keys.length === 0) {
                keys = [craft.key1, craft.key2, craft.key3, craft.key4].filter(Boolean) as string[];
              }
            } catch (error) {
              console.error('Failed to resolve searchStr:', error);
              // エラーの場合は key1-key4 をフォールバック
              keys = [craft.key1, craft.key2, craft.key3, craft.key4].filter(Boolean) as string[];
            }
          } else {
            // 後方互換性: key1-key4 を使用
            keys = [craft.key1, craft.key2, craft.key3, craft.key4].filter(Boolean) as string[];
          }

          return (
            <div
              key={craft.id}
              className="bg-stone-200/80 dark:bg-muted/50 rounded-xl border border-border p-4"
            >
              {/* クラフトテーブル風レイアウト */}
              <div className="flex items-stretch gap-3">
                {/* キーシーケンス（サーチ入力） */}
                <div className="flex-shrink-0 flex flex-col">
                  <div className="text-[10px] text-muted-foreground font-medium mb-1">サーチ</div>
                  <div className="flex gap-1 flex-1 items-center">
                    {keys.map((keyCode, idx) => {
                      const remapInfo = getRemapInfo(keyCode);
                      const fingers = getFingerInfo(keyCode);
                      const hasRemap = !!remapInfo;

                      return (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded border text-sm font-medium relative bg-gray-900/10 border-gray-900 dark:bg-gray-100/10 dark:border-gray-100 flex items-center justify-center"
                        >
                            {/* リマップ表示 */}
                            {hasRemap && remapInfo && remapInfo.targetKey ? (
                              <div className="flex flex-col items-center gap-0">
                                <span className="text-[9px] opacity-40 leading-tight">
                                  {formatKeyLabel(keyCode)}
                                </span>
                                <span className="text-base font-bold leading-tight">
                                  {formatKeyLabel(remapInfo.targetKey)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-base font-semibold">
                                {formatKeyLabel(keyCode)}
                              </span>
                            )}

                            {/* 指のチップ表示 */}
                            {fingers.length > 0 && (
                              <div className="absolute -top-1 -right-1 flex gap-0.5">
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

                {/* 矢印 */}
                <div className="flex-shrink-0 text-stone-500 dark:text-stone-400 flex flex-col justify-center pt-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* アイテムスロット（結果） */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="text-[10px] text-muted-foreground font-medium mb-1">アイテム</div>
                  <div className="flex gap-1 flex-1 items-center">
                    {items.map((itemId, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded border bg-gray-900/10 border-gray-900 dark:bg-gray-100/10 dark:border-gray-100 flex items-center justify-center"
                      >
                        <HotbarSlot
                          items={[itemId]}
                          size={44}
                          editable={false}
                          hideBackground
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* コメント（ある場合のみ表示） */}
              {craft.comment && (
                <p className="text-sm text-muted-foreground mt-3 pl-1">
                  {craft.comment}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
