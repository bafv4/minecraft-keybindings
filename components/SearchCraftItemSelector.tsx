'use client';

import { useState, useMemo } from 'react';
import { DraggableModal } from '@/components/ui/DraggableModal';
import { MinecraftItemIcon, getCraftableItemsByCategory, formatItemName, ITEM_CATEGORIES } from '@/lib/mcitems';
import { CheckIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { ItemCategory } from '@/lib/mcitems/types';

interface SearchCraftItemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  slotNumber: number;
  currentItems: string[];
}

export function SearchCraftItemSelector({
  isOpen,
  onClose,
  onSelect,
  onRemove,
  slotNumber,
  currentItems,
}: SearchCraftItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');

  // カテゴリに基づいたクラフト可能なアイテムリストを取得
  const categoryItems = useMemo(() => getCraftableItemsByCategory(selectedCategory), [selectedCategory]);

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

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="アイテムを選択"
      subtitle={`サーチクラフト ${slotNumber} - 選択中: ${currentItems.length}個（最大3個）`}
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
                const isDisabled = !isSelected && currentItems.length >= 3;
                const itemName = formatItemName(itemId);

                return (
                  <button
                    key={itemId}
                    onClick={() => !isDisabled && handleToggle(itemId)}
                    disabled={isDisabled}
                    className={`relative p-2 rounded-lg border flex flex-col items-center gap-1 transition-colors group ${
                      isSelected
                        ? 'bg-primary/30 border-primary'
                        : isDisabled
                        ? 'bg-[rgb(var(--muted))]/50 border-[rgb(var(--border))] opacity-50 cursor-not-allowed'
                        : 'bg-[rgb(var(--muted))] border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--border))]/80'
                    }`}
                    title={itemName}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-10">
                        <CheckIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <MinecraftItemIcon
                      itemId={itemId}
                      size={32}
                      fallback={
                        <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center text-xs">
                          ?
                        </div>
                      }
                    />
                    <span
                      className={`text-[10px] text-center leading-tight line-clamp-2 w-full ${
                        isSelected
                          ? 'text-white font-medium'
                          : isDisabled
                          ? 'text-[rgb(var(--muted-foreground))]'
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
