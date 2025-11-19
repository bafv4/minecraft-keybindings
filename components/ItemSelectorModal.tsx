'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { MinecraftItemIcon, formatItemName, searchItems, getAllItems, getItemsByCategory, ITEM_CATEGORIES } from '@/lib/mcitems';
import type { ItemCategory } from '@/lib/mcitems';

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemId: string) => void;
  selectedSlot: string;
}

/**
 * アイテム選択専用モーダル
 */
export function ItemSelectorModal({ isOpen, onClose, onSelect, selectedSlot }: ItemSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');
  const [displayItems, setDisplayItems] = useState<string[]>([]);

  // カテゴリまたは検索クエリが変わったら表示アイテムを更新
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchItems(searchQuery);
      setDisplayItems(results);
    } else {
      const items = getItemsByCategory(selectedCategory);
      setDisplayItems(items);
    }
  }, [searchQuery, selectedCategory]);

  const handleSelect = (itemId: string) => {
    onSelect(itemId);
    setSearchQuery(''); // 検索クエリをクリア
  };

  // Get category index for TabGroup
  const selectedCategoryIndex = ITEM_CATEGORIES.findIndex(cat => cat.id === selectedCategory);

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
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        </TransitionChild>

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-[rgb(var(--card))] rounded-lg border-2 border-[rgb(var(--border))] max-w-4xl w-full max-h-[80vh] flex flex-col">
              {/* ヘッダー */}
              <div className="p-4 border-b border-[rgb(var(--border))]">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-xl font-bold">
                    アイテムを選択
                    <span className="ml-2 text-sm text-[rgb(var(--muted-foreground))]">
                      ({selectedSlot === 'offhand' ? 'オフハンド' : `スロット ${selectedSlot.replace('slot', '')}`})
                    </span>
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* 検索バー */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="アイテム名で検索..."
                  className="w-full px-4 py-2 border rounded-lg bg-[rgb(var(--input))] border-[rgb(var(--border))] text-[rgb(var(--foreground))]"
                  autoFocus
                />
              </div>

              {/* カテゴリタブ */}
              {!searchQuery && (
                <TabGroup selectedIndex={selectedCategoryIndex} onChange={(index) => setSelectedCategory(ITEM_CATEGORIES[index].id)}>
                  <div className="px-4 py-2 border-b border-[rgb(var(--border))] overflow-x-auto">
                    <TabList className="flex gap-2">
                      {ITEM_CATEGORIES.map((category) => (
                        <Tab
                          key={category.id}
                          className={({ selected }) =>
                            `px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              selected
                                ? 'bg-blue-600 text-white'
                                : 'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--accent))] text-[rgb(var(--foreground))]'
                            }`
                          }
                        >
                          {category.name}
                        </Tab>
                      ))}
                    </TabList>
                  </div>
                </TabGroup>
              )}

              {/* アイテムグリッド */}
              <div className="flex-1 overflow-y-auto p-4">
                {displayItems.length === 0 ? (
                  <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
                    アイテムが見つかりませんでした
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {displayItems.map((itemId) => (
                      <button
                        key={itemId}
                        onClick={() => handleSelect(itemId)}
                        className="p-3 hover:bg-[rgb(var(--accent))] rounded border border-[rgb(var(--border))] flex flex-col items-center gap-1 transition-colors group"
                        title={formatItemName(itemId)}
                      >
                        <MinecraftItemIcon itemId={itemId} size={48} />
                        <span className="text-xs text-center truncate w-full group-hover:text-[rgb(var(--foreground))] text-[rgb(var(--muted-foreground))]">
                          {formatItemName(itemId)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* フッター */}
              <div className="p-4 border-t border-[rgb(var(--border))] flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
                >
                  閉じる
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
