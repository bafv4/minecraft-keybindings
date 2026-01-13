'use client';

import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { MinecraftItemIcon, formatItemName } from '@bafv4/mcitems/1.16/react';
import { SearchCraftItemSelector } from './SearchCraftItemSelector';
import { stringToKeyCodes } from '@/lib/searchCraft';

interface SearchCraftEntry {
  sequence: number;
  item1?: string;
  item2?: string;
  item3?: string;
  inputString: string;
  keys: string[];
  originalKeys: string[];
  comment?: string;
  error?: string;
}

interface WorkspaceSearchCraftEditorProps {
  remappings: Record<string, string>;
  searchCrafts: SearchCraftEntry[];
  onSearchCraftsChange: (crafts: SearchCraftEntry[]) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function WorkspaceSearchCraftEditor({
  remappings,
  searchCrafts,
  onSearchCraftsChange,
  enabled,
  onEnabledChange,
}: WorkspaceSearchCraftEditorProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // リマップをオブジェクトから配列に変換
  const keyRemaps = Object.entries(remappings).map(([sourceKey, targetKey]) => ({
    sourceKey,
    targetKey,
  }));

  // リマップを適用する関数（順方向：sourceKey → targetKey）
  const applyKeyRemaps = useCallback((keys: string[]): string[] => {
    if (keyRemaps.length === 0) return keys;

    return keys.map((key) => {
      const remap = keyRemaps.find((r) => r.sourceKey === key);
      if (remap && remap.targetKey) {
        let normalizedTargetKey: string;

        if (remap.targetKey.length === 1) {
          if (/^[a-zA-Z]$/.test(remap.targetKey)) {
            normalizedTargetKey = `Key${remap.targetKey.toUpperCase()}`;
          } else if (/^[0-9]$/.test(remap.targetKey)) {
            normalizedTargetKey = `Digit${remap.targetKey}`;
          } else {
            normalizedTargetKey = `Char_${remap.targetKey}`;
          }
        } else {
          normalizedTargetKey = remap.targetKey;
        }

        return normalizedTargetKey;
      }
      return key;
    });
  }, [keyRemaps]);

  // 逆リマップを適用する関数（逆方向：targetKey → sourceKey）
  const applyReverseRemaps = useCallback((keys: string[]): string[] => {
    if (keyRemaps.length === 0) return keys;

    return keys.map((key) => {
      const reverseRemap = keyRemaps.find((r) => {
        if (!r.targetKey) return false;

        let normalizedTargetKey: string;

        if (r.targetKey.length === 1) {
          if (/^[a-zA-Z]$/.test(r.targetKey)) {
            normalizedTargetKey = `Key${r.targetKey.toUpperCase()}`;
          } else if (/^[0-9]$/.test(r.targetKey)) {
            normalizedTargetKey = `Digit${r.targetKey}`;
          } else {
            normalizedTargetKey = `Char_${r.targetKey}`;
          }
        } else {
          normalizedTargetKey = r.targetKey;
        }

        return normalizedTargetKey === key;
      });

      if (reverseRemap) {
        return reverseRemap.sourceKey;
      }
      return key;
    });
  }, [keyRemaps]);

  const createNewEntry = (sequence: number): SearchCraftEntry => ({
    sequence,
    item1: undefined,
    item2: undefined,
    item3: undefined,
    inputString: '',
    keys: [],
    originalKeys: [],
    comment: undefined,
    error: undefined,
  });

  const addCraft = () => {
    const nextSequence = Math.max(0, ...searchCrafts.map(c => c.sequence)) + 1;
    onSearchCraftsChange([...searchCrafts, createNewEntry(nextSequence)]);
  };

  const removeCraft = (sequence: number) => {
    onSearchCraftsChange(searchCrafts.filter(c => c.sequence !== sequence));
  };

  const updateCraft = (sequence: number, updates: Partial<SearchCraftEntry>) => {
    onSearchCraftsChange(
      searchCrafts.map((c) => {
        if (c.sequence === sequence) {
          const updated = { ...c, ...updates };

          if (updates.inputString !== undefined) {
            try {
              const keysFromString = stringToKeyCodes(updates.inputString);

              if (updates.inputString === '') {
                updated.originalKeys = [];
                updated.keys = [];
                updated.error = undefined;
                return updated;
              }

              const physicalKeysToPress = applyReverseRemaps(keysFromString);

              const unmappedChars: string[] = [];
              keysFromString.forEach((key, idx) => {
                if (!key || key === '') {
                  const char = updates.inputString![idx];
                  if (char) unmappedChars.push(char);
                }
              });

              if (unmappedChars.length > 0) {
                updated.error = `入力できない文字が含まれています: ${unmappedChars.join(', ')}`;
                updated.originalKeys = keysFromString;
                updated.keys = physicalKeysToPress;
              } else {
                updated.originalKeys = keysFromString;
                updated.keys = physicalKeysToPress;
                updated.error = undefined;
              }
            } catch (error) {
              console.error('Invalid input string:', error);
              updated.originalKeys = [];
              updated.keys = [];
              updated.error = '入力文字列の変換に失敗しました';
            }
          }

          return updated;
        }
        return c;
      })
    );
  };

  const getSlotItems = (sequence: number): string[] => {
    const craft = searchCrafts.find((c) => c.sequence === sequence);
    return [craft?.item1, craft?.item2, craft?.item3].filter(Boolean) as string[];
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedSlot === null) return;

    const craft = searchCrafts.find((c) => c.sequence === selectedSlot);
    if (!craft) return;

    if (!craft.item1) {
      updateCraft(selectedSlot, { item1: itemId });
    } else if (!craft.item2) {
      updateCraft(selectedSlot, { item2: itemId });
    } else if (!craft.item3) {
      updateCraft(selectedSlot, { item3: itemId });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (selectedSlot === null) return;

    const craft = searchCrafts.find((c) => c.sequence === selectedSlot);
    if (!craft) return;

    if (craft.item1 === itemId) {
      updateCraft(selectedSlot, { item1: craft.item2, item2: craft.item3, item3: undefined });
    } else if (craft.item2 === itemId) {
      updateCraft(selectedSlot, { item2: craft.item3, item3: undefined });
    } else if (craft.item3 === itemId) {
      updateCraft(selectedSlot, { item3: undefined });
    }
  };

  // 初期エントリがない場合は1つ作成
  useEffect(() => {
    if (searchCrafts.length === 0) {
      onSearchCraftsChange([createNewEntry(1)]);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">サーチクラフト設定</h3>
          <div className="flex items-center gap-2">
            <Switch
              checked={enabled}
              onChange={onEnabledChange}
              className={`${
                enabled ? 'bg-primary' : 'bg-[rgb(var(--muted))]'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className="text-sm text-muted-foreground">
              {enabled ? '有効' : '無効'}
            </span>
          </div>
        </div>

        {enabled && (
          <Button onClick={addCraft} variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            追加
          </Button>
        )}
      </div>

      {enabled && (
        <div className="space-y-3">
          {searchCrafts.map((craft) => {
            const slotItems = getSlotItems(craft.sequence);

            return (
              <div
                key={craft.sequence}
                className="border border-border rounded-lg p-3 bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  {/* 連番 */}
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary/20 rounded-full text-sm font-bold">
                    {craft.sequence}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* アイテム選択エリア */}
                    <div>
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">
                        クラフトアイテム（最大3個）
                      </label>
                      <button
                        onClick={() => {
                          setSelectedSlot(craft.sequence);
                          setIsModalOpen(true);
                        }}
                        className="w-full min-h-[48px] border border-dashed border-border rounded-lg p-2 hover:border-primary hover:bg-primary/5 transition flex items-center gap-2"
                      >
                        {slotItems.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            クリックしてアイテムを選択
                          </span>
                        ) : (
                          <div className="flex gap-1 flex-wrap">
                            {slotItems.map((itemId) => (
                              <div
                                key={itemId}
                                className="flex items-center gap-1 px-1.5 py-0.5 bg-background rounded text-xs"
                              >
                                <MinecraftItemIcon itemId={itemId} size={20} />
                                <span>{formatItemName(itemId)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                    </div>

                    {/* 文字列入力 */}
                    <div>
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">
                        入力文字列（最大4文字）
                      </label>
                      <input
                        type="text"
                        value={craft.inputString}
                        onChange={(e) =>
                          updateCraft(craft.sequence, { inputString: e.target.value })
                        }
                        maxLength={4}
                        placeholder="例: abcd"
                        className={`w-full px-2 py-1.5 border rounded text-sm bg-background font-mono ${
                          craft.error ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      {craft.error && (
                        <p className="mt-1 text-xs text-red-500">{craft.error}</p>
                      )}
                    </div>

                    {/* コメント入力 */}
                    <div>
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">
                        コメント（任意）
                      </label>
                      <input
                        type="text"
                        value={craft.comment || ''}
                        onChange={(e) =>
                          updateCraft(craft.sequence, { comment: e.target.value })
                        }
                        placeholder="メモ..."
                        className="w-full px-2 py-1.5 border border-border rounded text-sm bg-background"
                      />
                    </div>
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => removeCraft(craft.sequence)}
                    className="flex-shrink-0 p-1.5 text-red-500 hover:bg-red-500/10 rounded transition"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* アイテム選択モーダル */}
      {selectedSlot !== null && (
        <SearchCraftItemSelector
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectItem}
          onRemove={handleRemoveItem}
          slotNumber={selectedSlot}
          currentItems={getSlotItems(selectedSlot)}
        />
      )}
    </div>
  );
}
