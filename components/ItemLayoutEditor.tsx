'use client';

import { useState, useEffect } from 'react';
import { MinecraftItemIcon, formatItemName } from '@/lib/mcitems';
import { getSegmentList } from '@/lib/segments';
import { ItemSelectorModal } from './ItemSelectorModal';
import { Button, Textarea } from '@/components/ui';
import type { ItemLayout, SpeedrunSegment } from '@/types/itemLayout';

interface ItemLayoutEditorProps {
  uuid: string;
  onSave?: () => void;
}

/**
 * アイテム配置エディタコンポーネント
 */
export function ItemLayoutEditor({ uuid, onSave }: ItemLayoutEditorProps) {
  const segments = getSegmentList();
  const [selectedSegment, setSelectedSegment] = useState<SpeedrunSegment>(segments[0].id);
  const [layouts, setLayouts] = useState<Record<string, Partial<ItemLayout>>>({});
  const [saving, setSaving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<keyof typeof currentLayout>('slot1');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 現在のセグメントのレイアウトを取得
  const currentLayout = layouts[selectedSegment] || {
    slot1: [],
    slot2: [],
    slot3: [],
    slot4: [],
    slot5: [],
    slot6: [],
    slot7: [],
    slot8: [],
    slot9: [],
    offhand: [],
    notes: '',
  };

  // 既存のレイアウトを読み込み
  useEffect(() => {
    async function fetchLayouts() {
      try {
        const response = await fetch(`/api/item-layouts?uuid=${uuid}`);
        if (response.ok) {
          const data = await response.json();
          const layoutMap: Record<string, Partial<ItemLayout>> = {};
          data.forEach((layout: ItemLayout) => {
            layoutMap[layout.segment] = layout;
          });
          setLayouts(layoutMap);
        }
      } catch (error) {
        console.error('Failed to fetch layouts:', error);
      }
    }
    fetchLayouts();
  }, [uuid]);

  // スロットにアイテムを追加
  const addItemToSlot = (slotName: keyof typeof currentLayout, itemId: string) => {
    const currentItems = (currentLayout[slotName] as string[]) || [];
    if (!currentItems.includes(itemId)) {
      setLayouts({
        ...layouts,
        [selectedSegment]: {
          ...currentLayout,
          [slotName]: [...currentItems, itemId],
        },
      });
    }
    setIsModalOpen(false); // モーダルを閉じる
  };

  // スロットからアイテムを削除
  const removeItemFromSlot = (slotName: keyof typeof currentLayout, itemId: string) => {
    const currentItems = (currentLayout[slotName] as string[]) || [];
    setLayouts({
      ...layouts,
      [selectedSegment]: {
        ...currentLayout,
        [slotName]: currentItems.filter((id) => id !== itemId),
      },
    });
  };

  // スロットをクリア
  const clearSlot = (slotName: keyof typeof currentLayout) => {
    setLayouts({
      ...layouts,
      [selectedSegment]: {
        ...currentLayout,
        [slotName]: [],
      },
    });
  };

  // 保存
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/item-layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid,
          segment: selectedSegment,
          ...currentLayout,
        }),
      });

      if (response.ok) {
        alert('保存しました');
        onSave?.();
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const slotNames: Array<keyof typeof currentLayout> = [
    'slot1', 'slot2', 'slot3', 'slot4', 'slot5',
    'slot6', 'slot7', 'slot8', 'slot9', 'offhand',
  ];

  return (
    <div className="space-y-6">
      {/* セグメント選択 */}
      <div>
        <label className="block text-sm font-medium mb-2">セグメント</label>
        <select
          value={selectedSegment}
          onChange={(e) => setSelectedSegment(e.target.value as SpeedrunSegment)}
          className="w-full px-3 py-2 border rounded-md bg-[rgb(var(--input))] border-[rgb(var(--border))] text-[rgb(var(--foreground))]"
        >
          {segments.map((seg) => (
            <option key={seg.id} value={seg.id}>
              {seg.label} {seg.description && `(${seg.description})`}
            </option>
          ))}
        </select>
      </div>

      {/* アイテム追加ボタン */}
      <div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="ghost"
          className="w-full py-3 px-4 border-2 border-dashed border-[rgb(var(--border))] rounded-lg hover:border-blue-500 hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-blue-500"
        >
          <span className="text-2xl">+</span>
          <span className="font-medium">
            アイテムを追加
            <span className="ml-2 text-sm">
              (選択中: {selectedSlot === 'offhand' ? 'オフハンド' : `スロット ${selectedSlot.replace('slot', '')}`})
            </span>
          </span>
        </Button>
      </div>

      {/* インベントリ風スロット編集（横一列） */}
      <div>
        <h3 className="font-medium mb-3">ホットバー + オフハンド</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* ホットバー 1-9 */}
          {slotNames.slice(0, 9).map((slotName, index) => {
            const slotNumber = index + 1;
            const items = (currentLayout[slotName] as string[]) || [];

            return (
              <SlotBox
                key={slotName}
                slotName={slotName}
                slotLabel={slotNumber.toString()}
                items={items}
                isSelected={selectedSlot === slotName}
                onSelect={() => setSelectedSlot(slotName)}
                onRemove={(itemId) => removeItemFromSlot(slotName, itemId)}
                onClear={() => clearSlot(slotName)}
              />
            );
          })}

          {/* セパレーター */}
          <div className="flex items-center px-2">
            <div className="h-16 w-px bg-[rgb(var(--border))]"></div>
          </div>

          {/* オフハンド */}
          {(() => {
            const slotName = 'offhand';
            const items = (currentLayout[slotName] as string[]) || [];

            return (
              <SlotBox
                key={slotName}
                slotName={slotName}
                slotLabel="オフハンド"
                items={items}
                isSelected={selectedSlot === slotName}
                onSelect={() => setSelectedSlot(slotName)}
                onRemove={(itemId) => removeItemFromSlot(slotName, itemId)}
                onClear={() => clearSlot(slotName)}
              />
            );
          })()}
        </div>
      </div>

      {/* メモ欄 */}
      <Textarea
        label="メモ"
        value={currentLayout.notes || ''}
        onChange={(e) =>
          setLayouts({
            ...layouts,
            [selectedSegment]: {
              ...currentLayout,
              notes: e.target.value,
            },
          })
        }
        rows={3}
        placeholder="このセグメントについてのメモ..."
      />

      {/* 保存ボタン */}
      <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
        {saving && (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {saving ? '保存中...' : '保存'}
      </Button>

      {/* アイテム選択モーダル */}
      <ItemSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(itemId) => addItemToSlot(selectedSlot, itemId)}
        selectedSlot={selectedSlot}
      />
    </div>
  );
}

/**
 * スロットボックスコンポーネント（ローテーション表示対応）
 */
interface SlotBoxProps {
  slotName: string;
  slotLabel: string;
  items: string[];
  isSelected: boolean;
  onSelect: () => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
}

function SlotBox({ slotName, slotLabel, items, isSelected, onSelect, onRemove, onClear }: SlotBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 複数アイテムがある場合、2秒ごとにローテーション
  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [items.length]);

  // アイテムが変更されたらインデックスをリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  return (
    <div className="flex-shrink-0">
      <div className="text-xs text-center mb-1 font-semibold text-[rgb(var(--muted-foreground))]">
        {slotLabel}
      </div>
      <button
        onClick={onSelect}
        className={`relative border-2 rounded w-20 h-20 flex items-center justify-center transition-colors ${
          isSelected
            ? 'bg-blue-900/50 border-blue-500'
            : 'bg-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-blue-400'
        }`}
      >
        {items.length === 0 ? (
          <span className="text-[rgb(var(--muted-foreground))] text-xs">空</span>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative group">
              <MinecraftItemIcon itemId={items[currentIndex]} size={56} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(items[currentIndex]);
                }}
                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="削除"
              >
                ✕
              </button>
            </div>
            {items.length > 1 && (
              <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                {currentIndex + 1}/{items.length}
              </div>
            )}
          </div>
        )}
        {items.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
            title="クリア"
          >
            ✕
          </button>
        )}
      </button>
    </div>
  );
}
