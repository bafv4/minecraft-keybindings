'use client';

import { useState, useMemo } from 'react';
import { DraggableModal } from '@/components/ui/DraggableModal';
import { MinecraftItemIcon, getItemsByCategory, formatItemName as mcFormatItemName, ITEM_CATEGORIES } from '@bafv4/mcitems/1.16/react';
import type { ItemCategory } from '@bafv4/mcitems/1.16/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

/**
 * "any" アイテム用の？ブロックアイコン
 */
function AnyItemIcon({ size }: { size: number }) {
  return (
    <div
      className="flex items-center justify-center rounded"
      style={{
        width: size,
        height: size,
        backgroundColor: 'rgb(var(--primary) / 0.3)',
        border: '2px solid rgb(var(--primary) / 0.5)',
      }}
    >
      <QuestionMarkCircleIcon
        className="text-primary"
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </div>
  );
}

/**
 * アイテムアイコンを表示（"any"の場合は？ブロック）
 */
function ItemIcon({ itemId, size }: { itemId: string; size: number }) {
  if (itemId === 'any') {
    return <AnyItemIcon size={size} />;
  }
  return (
    <MinecraftItemIcon
      itemId={itemId}
      size={size}
      fallback={
        <div className="bg-zinc-700 rounded flex items-center justify-center text-xs" style={{ width: size, height: size }}>
          ?
        </div>
      }
    />
  );
}

/**
 * アイテム名をフォーマット（"any"の場合は「なんでも」）
 */
function formatItemName(itemId: string): string {
  if (itemId === 'any') {
    return 'なんでも';
  }
  return mcFormatItemName(itemId);
}

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  selectedSlot: string;
  currentItems: string[];
}

/**
 * アイテム選択モーダル（全アイテム対応版）
 */
export function ItemSelectorModal({
  isOpen,
  onClose,
  onSelect,
  onRemove,
  selectedSlot,
  currentItems
}: ItemSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');

  // カテゴリに基づいたアイテムリストを取得（"all"カテゴリの場合は先頭に"any"を追加）
  const categoryItems = useMemo(() => {
    const items = getItemsByCategory(selectedCategory);
    if (selectedCategory === 'all') {
      return ['any', ...items];
    }
    return items;
  }, [selectedCategory]);

  // 検索フィルタリング
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return categoryItems;

    const query = searchQuery.toLowerCase();
    return categoryItems.filter((itemId) => {
      const name = formatItemName(itemId).toLowerCase();
      const id = itemId.toLowerCase();
      return name.includes(query) || id.includes(query);
    });
  }, [categoryItems, searchQuery]);

  const handleToggle = (itemId: string) => {
    if (currentItems.includes(itemId)) {
      onRemove(itemId);
    } else {
      onSelect(itemId);
    }
  };

  const slotLabel = selectedSlot === 'offhand'
    ? 'オフハンド'
    : `スロット ${selectedSlot.replace('slot', '')}`;

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="アイテムを選択"
      subtitle={`${slotLabel} - 選択中: ${currentItems.length}個`}
      maxWidth="4xl"
      panelClassName="w-full max-w-5xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] select-none"
      headerClassName="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border flex-shrink-0"
      contentClassName="flex-1 overflow-y-auto"
      footerClassName="px-6 py-4 border-t border-border bg-muted/30 flex-shrink-0"
      noScroll
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
          >
            完了
          </button>
        </div>
      }
    >
      <div className="p-4 space-y-4">
        {/* 検索バー */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="アイテムを検索..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-2">
          {ITEM_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--accent))]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* アイテムグリッド */}
        <div className="h-[calc(85vh-340px)] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
              検索結果が見つかりませんでした
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {filteredItems.map((itemId) => {
                const isSelected = currentItems.includes(itemId);
                const itemName = formatItemName(itemId);

                return (
                  <button
                    key={itemId}
                    onClick={() => handleToggle(itemId)}
                    className={`relative p-2 rounded-lg border flex flex-col items-center gap-1 transition-colors group ${
                      isSelected
                        ? 'bg-primary/30 border-primary'
                        : 'bg-[rgb(var(--muted))] border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--border))]/80'
                    }`}
                    title={itemName}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-10">
                        <CheckIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <ItemIcon itemId={itemId} size={32} />
                    <span
                      className={`text-[10px] text-center leading-tight line-clamp-2 w-full ${
                        isSelected
                          ? 'text-white font-medium'
                          : 'text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--foreground))]'
                      }`}
                    >
                      {itemName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DraggableModal>
  );
}
