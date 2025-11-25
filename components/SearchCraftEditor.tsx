'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { MinecraftItemIcon, formatItemName } from '@/lib/mcitems';
import { SearchCraftItemSelector } from './SearchCraftItemSelector';
import { stringToKeyCodes, keyCodesToString } from '@/lib/searchCraft';

interface SearchCraftEntry {
  sequence: number;
  item1?: string;
  item2?: string;
  item3?: string;
  inputString: string;
  keys: string[]; // 実際に押すキー（逆リマップ適用済み）
  originalKeys: string[]; // ユーザーが入力したい文字（逆リマップ適用前）
  comment?: string; // コメント（任意）
  error?: string; // エラーメッセージ
}

interface KeyRemapEntry {
  sourceKey: string;
  targetKey: string | null;
}

interface SearchCraftEditorProps {
  uuid: string;
  onSave?: () => void;
  hideSaveButton?: boolean;
}

export interface SearchCraftEditorRef {
  save: () => Promise<boolean>;
}

export const SearchCraftEditor = forwardRef<SearchCraftEditorRef, SearchCraftEditorProps>(
  function SearchCraftEditor({ uuid, onSave, hideSaveButton = false }, ref) {
    const [enabled, setEnabled] = useState(false);
    const [crafts, setCrafts] = useState<SearchCraftEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [keyRemaps, setKeyRemaps] = useState<KeyRemapEntry[]>([]);

    // リマップを適用する関数（順方向：sourceKey → targetKey）
    // targetKeyをWeb形式に正規化して返す
    const applyKeyRemaps = (keys: string[]): string[] => {
      if (keyRemaps.length === 0) return keys;

      return keys.map((key) => {
        const remap = keyRemaps.find((r) => r.sourceKey === key);
        if (remap && remap.targetKey) {
          // targetKeyをWeb形式に正規化
          let normalizedTargetKey: string;

          if (remap.targetKey.length === 1) {
            // 1文字の場合
            if (/^[a-zA-Z]$/.test(remap.targetKey)) {
              // アルファベット a-z, A-Z → KeyA-Z
              normalizedTargetKey = `Key${remap.targetKey.toUpperCase()}`;
            } else if (/^[0-9]$/.test(remap.targetKey)) {
              // 数字 0-9 → Digit0-9
              normalizedTargetKey = `Digit${remap.targetKey}`;
            } else {
              // 特殊文字 → Char_<文字>
              normalizedTargetKey = `Char_${remap.targetKey}`;
            }
          } else {
            // 複数文字の場合はそのまま使用（既にWeb形式やMinecraft形式）
            normalizedTargetKey = remap.targetKey;
          }

          return normalizedTargetKey;
        }
        return key;
      });
    };

    // 逆リマップを適用する関数（逆方向：targetKey → sourceKey）
    // 例：Q→åのリマップがある場合、「å」を入力すると「Q」を返す
    const applyReverseRemaps = (keys: string[]): string[] => {
      if (keyRemaps.length === 0) return keys;

      return keys.map((key) => {
        // このキーがリマップのターゲットになっているか確認
        // targetKeyは様々な形式で保存されている可能性があるため、正規化して比較
        const reverseRemap = keyRemaps.find((r) => {
          if (!r.targetKey) return false;

          // targetKeyを正規化してWeb形式に変換
          let normalizedTargetKey: string;

          if (r.targetKey.length === 1) {
            // 1文字の場合
            if (/^[a-zA-Z]$/.test(r.targetKey)) {
              // アルファベット a-z, A-Z → KeyA-Z
              normalizedTargetKey = `Key${r.targetKey.toUpperCase()}`;
            } else if (/^[0-9]$/.test(r.targetKey)) {
              // 数字 0-9 → Digit0-9
              normalizedTargetKey = `Digit${r.targetKey}`;
            } else {
              // 特殊文字 → Char_<文字>
              normalizedTargetKey = `Char_${r.targetKey}`;
            }
          } else {
            // 複数文字の場合はそのまま比較（Web形式やMinecraft形式など）
            normalizedTargetKey = r.targetKey;
          }

          return normalizedTargetKey === key;
        });

        if (reverseRemap) {
          return reverseRemap.sourceKey; // ソースキーを返す
        }
        return key;
      });
    };

    // キーリマップ設定を取得
    useEffect(() => {
      const fetchKeyRemaps = async () => {
        try {
          const response = await fetch('/api/keybindings');
          if (response.ok) {
            const data = await response.json();
            setKeyRemaps(data.keyRemaps || []);
          }
        } catch (error) {
          console.error('Failed to fetch key remaps:', error);
        }
      };

      fetchKeyRemaps();
    }, []);

    // リマップが変更されたときに既存のcraftsを再計算
    useEffect(() => {
      if (crafts.length === 0 || keyRemaps.length === 0) return;

      setCrafts((prevCrafts) =>
        prevCrafts.map((craft) => {
          if (craft.keys.length > 0) {
            // keysからoriginalKeysとinputStringを再計算
            const originalKeys = applyKeyRemaps(craft.keys);
            const inputString = keyCodesToString(originalKeys);

            return {
              ...craft,
              originalKeys,
              inputString,
            };
          }
          return craft;
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyRemaps]);

    // データを読み込み
    useEffect(() => {
      const fetchCrafts = async () => {
        try {
          const response = await fetch(`/api/search-craft?uuid=${uuid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const entries: SearchCraftEntry[] = data.map((craft: any) => {
                // DBには実際に押す物理キーが保存されている
                const keys = [craft.key1, craft.key2, craft.key3, craft.key4].filter(Boolean) as string[];

                // searchStr がある場合はそれを使用（優先）、ない場合は後方互換性のため keys から生成
                let inputString: string;
                let originalKeys: string[];
                let physicalKeys: string[];

                if (craft.searchStr) {
                  // searchStr から直接 inputString を取得
                  inputString = craft.searchStr;
                  // inputString から originalKeys を生成
                  try {
                    originalKeys = stringToKeyCodes(inputString);
                    // originalKeys から逆リマップを適用して実際に押すキーを計算
                    physicalKeys = applyReverseRemaps(originalKeys);
                  } catch (error) {
                    console.error('Failed to parse searchStr:', error);
                    originalKeys = [];
                    physicalKeys = keys; // フォールバック
                  }
                } else {
                  // 後方互換性: keys からリマップ適用して inputString を生成
                  physicalKeys = keys;
                  originalKeys = applyKeyRemaps(keys);
                  inputString = keyCodesToString(originalKeys);
                }

                return {
                  sequence: craft.sequence,
                  item1: craft.item1,
                  item2: craft.item2,
                  item3: craft.item3,
                  inputString,
                  keys: physicalKeys, // 実際に押すキー
                  originalKeys, // ユーザーが入力したい文字
                  comment: craft.comment,
                };
              });
              setCrafts(entries);
              setEnabled(true); // データがある場合は有効化
            } else {
              // データがない場合は1つだけ初期化
              setCrafts([createNewEntry(1)]);
              setEnabled(false);
            }
          } else {
            setCrafts([createNewEntry(1)]);
            setEnabled(false);
          }
        } catch (error) {
          console.error('Failed to fetch search crafts:', error);
          setCrafts([createNewEntry(1)]);
          setEnabled(false);
        } finally {
          setLoading(false);
        }
      };

      fetchCrafts();
    }, [uuid]);

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
      const nextSequence = Math.max(0, ...crafts.map(c => c.sequence)) + 1;
      setCrafts([...crafts, createNewEntry(nextSequence)]);
    };

    const removeCraft = (sequence: number) => {
      setCrafts(crafts.filter(c => c.sequence !== sequence));
    };

    const updateCraft = (sequence: number, updates: Partial<SearchCraftEntry>) => {
      setCrafts(
        crafts.map((c) => {
          if (c.sequence === sequence) {
            const updated = { ...c, ...updates };

            // inputStringが変更された場合、originalKeysとkeysを更新
            if (updates.inputString !== undefined) {
              try {
                // 1. 文字列からキーコードに変換（ユーザーが入力したい文字）
                const keysFromString = stringToKeyCodes(updates.inputString);

                // 空文字の場合はエラーをクリア
                if (updates.inputString === '') {
                  updated.originalKeys = [];
                  updated.keys = [];
                  updated.error = undefined;
                  return updated;
                }

                // 2. 逆リマップを適用して実際に押すべきキーを取得
                //    例：Q→åリマップがある場合、「å」→「Q」
                const physicalKeysToPress = applyReverseRemaps(keysFromString);

                // リマップできなかった文字をチェック
                const unmappedChars: string[] = [];
                keysFromString.forEach((key, idx) => {
                  const physicalKey = physicalKeysToPress[idx];
                  // キーコードが変換できていない、または逆リマップが適用できなかった場合
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
                  // originalKeys = ユーザーが入力したい文字（å）
                  // keys = 実際に押すキー（Q）
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

    // スロットのアイテムリストを取得
    const getSlotItems = (sequence: number): string[] => {
      const craft = crafts.find((c) => c.sequence === sequence);
      return [craft?.item1, craft?.item2, craft?.item3].filter(Boolean) as string[];
    };

    // アイテムを追加
    const handleSelectItem = (itemId: string) => {
      if (selectedSlot === null) return;

      const craft = crafts.find((c) => c.sequence === selectedSlot);
      if (!craft) return;

      if (!craft.item1) {
        updateCraft(selectedSlot, { item1: itemId });
      } else if (!craft.item2) {
        updateCraft(selectedSlot, { item2: itemId });
      } else if (!craft.item3) {
        updateCraft(selectedSlot, { item3: itemId });
      }
    };

    // アイテムを削除
    const handleRemoveItem = (itemId: string) => {
      if (selectedSlot === null) return;

      const craft = crafts.find((c) => c.sequence === selectedSlot);
      if (!craft) return;

      if (craft.item1 === itemId) {
        updateCraft(selectedSlot, { item1: craft.item2, item2: craft.item3, item3: undefined });
      } else if (craft.item2 === itemId) {
        updateCraft(selectedSlot, { item2: craft.item3, item3: undefined });
      } else if (craft.item3 === itemId) {
        updateCraft(selectedSlot, { item3: undefined });
      }
    };

    const handleSave = async (): Promise<boolean> => {
      setSaving(true);
      try {
        if (!enabled) {
          // 無効化されている場合は全削除
          const response = await fetch(`/api/search-craft?uuid=${uuid}`, {
            method: 'DELETE',
          });
          return response.ok;
        }

        // エラーがあるcraftをチェック
        const craftsWithErrors = crafts.filter(c => c.error);
        if (craftsWithErrors.length > 0) {
          if (!hideSaveButton) {
            alert(`入力エラーがあります。エラーを修正してから保存してください。\n\nエラーがある設定: ${craftsWithErrors.map(c => `#${c.sequence}`).join(', ')}`);
          }
          return false;
        }

        const response = await fetch('/api/search-craft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uuid,
            crafts: crafts.map((c) => ({
              sequence: c.sequence,
              item1: c.item1,
              item2: c.item2,
              item3: c.item3,
              keys: c.keys, // 実際に押す物理キーを保存（逆リマップ適用済み、後方互換性）
              searchStr: c.inputString, // ユーザーが入力した文字列をそのまま保存
              comment: c.comment,
            })),
          }),
        });

        if (response.ok) {
          if (!hideSaveButton) {
            alert('サーチクラフト設定を保存しました');
          }
          onSave?.();
          return true;
        } else {
          if (!hideSaveButton) {
            alert('保存に失敗しました');
          }
          return false;
        }
      } catch (error) {
        console.error('Failed to save:', error);
        if (!hideSaveButton) {
          alert('保存中にエラーが発生しました');
        }
        return false;
      } finally {
        setSaving(false);
      }
    };

    // Refを公開
    useImperativeHandle(ref, () => ({
      save: handleSave,
    }));

    if (loading) {
      return <div className="text-center py-8">読み込み中...</div>;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">サーチクラフト設定</h2>
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                onChange={setEnabled}
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
              <span className="text-sm text-[rgb(var(--muted-foreground))]">
                {enabled ? '有効' : '無効'}
              </span>
            </div>
          </div>

          {enabled && (
            <div className="flex gap-2">
              <Button onClick={addCraft} variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                追加
              </Button>
              {!hideSaveButton && (
                <Button onClick={handleSave} variant="primary" size="lg" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              )}
            </div>
          )}
        </div>

        {enabled && (
          <div className="space-y-4">
            {crafts.map((craft) => {
              const slotItems = getSlotItems(craft.sequence);

              return (
                <div
                  key={craft.sequence}
                  className="border border-border rounded-lg p-4 bg-card"
                >
                  <div className="flex items-start gap-4">
                    {/* 連番 */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full font-bold">
                      {craft.sequence}
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* アイテム選択エリア */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          クラフトアイテム（最大3個）
                        </label>
                        <button
                          onClick={() => {
                            setSelectedSlot(craft.sequence);
                            setIsModalOpen(true);
                          }}
                          className="w-full min-h-[60px] border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-3 hover:border-primary hover:bg-primary/5 transition flex items-center gap-2"
                        >
                          {slotItems.length === 0 ? (
                            <span className="text-sm text-[rgb(var(--muted-foreground))]">
                              クリックしてアイテムを選択
                            </span>
                          ) : (
                            <div className="flex gap-2 flex-wrap">
                              {slotItems.map((itemId) => (
                                <div
                                  key={itemId}
                                  className="flex items-center gap-1 px-2 py-1 bg-muted rounded"
                                >
                                  <MinecraftItemIcon itemId={itemId} size={24} />
                                  <span className="text-xs">{formatItemName(itemId)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      </div>

                      {/* 文字列入力 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          入力文字列（a-z、A-Z、0-9、特殊文字対応、最大4文字）
                        </label>
                        <input
                          type="text"
                          value={craft.inputString}
                          onChange={(e) =>
                            updateCraft(craft.sequence, { inputString: e.target.value })
                          }
                          maxLength={4}
                          placeholder="例: abcd / ABCD / ab12 / åäö"
                          className={`w-full px-3 py-2 border rounded-lg bg-background font-mono ${
                            craft.error ? 'border-red-500' : 'border-border'
                          }`}
                        />
                        {craft.error && (
                          <p className="mt-2 text-sm text-red-500">{craft.error}</p>
                        )}
                      </div>

                      {/* コメント入力 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          コメント（任意）
                        </label>
                        <textarea
                          value={craft.comment || ''}
                          onChange={(e) =>
                            updateCraft(craft.sequence, { comment: e.target.value })
                          }
                          placeholder="このクラフトについてのメモを入力..."
                          rows={2}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
                        />
                      </div>
                    </div>

                    {/* 削除ボタン */}
                    <button
                      onClick={() => removeCraft(craft.sequence)}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-500/10 rounded transition"
                    >
                      <TrashIcon className="h-5 w-5" />
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
);

SearchCraftEditor.displayName = 'SearchCraftEditor';
