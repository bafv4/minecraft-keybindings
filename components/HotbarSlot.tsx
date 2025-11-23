'use client';

import { useState, useEffect } from 'react';
import { MinecraftItemIcon, formatItemName } from '@/lib/mcitems';
import { PlusIcon } from '@heroicons/react/24/outline';
import { formatKeyName, CustomKeyInfo } from '@/lib/utils';

interface HotbarSlotProps {
  items: string[];
  size?: number;
  onClick?: () => void;
  editable?: boolean;
  keybind?: string | string[];
  customKeys?: CustomKeyInfo[];
}

/**
 * ホットバースロット共通コンポーネント
 */
export function HotbarSlot({ items, size = 64, onClick, editable = false, keybind, customKeys }: HotbarSlotProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasItems = items.length > 0;

  // 編集モード: 複数アイテム時のローテーション表示
  useEffect(() => {
    if (!editable || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [editable, items.length]);

  // アイテム変更時にインデックスをリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  // キーバインド表示用テキスト
  const keybindText = keybind
    ? Array.isArray(keybind)
      ? keybind.map(k => formatKeyName(k, customKeys)).join('/')
      : formatKeyName(keybind, customKeys)
    : null;

  return (
    <div className="relative flex flex-col items-center">
      {/* スロット */}
      <div
        className={`flex items-center justify-center rounded-lg transition-colors ${
          hasItems
            ? 'bg-muted border-2 border-border'
            : 'bg-muted/50 border-2 border-border/50'
        } ${editable ? 'hover:border-primary/50 cursor-pointer' : ''}`}
        style={{ width: size, height: size }}
        onClick={onClick}
        title={!editable && hasItems ? items.map(id => formatItemName(id)).join(', ') : undefined}
      >
        {hasItems ? (
          editable ? (
            // 編集モード: ローテーション表示
            <div className="relative flex items-center justify-center w-full h-full">
              <MinecraftItemIcon itemId={items[currentIndex] ?? items[0]} size={size - 12} />
              {items.length > 1 && (
                <div className="absolute bottom-0.5 right-0.5 text-[9px] text-muted-foreground bg-background/70 px-1 rounded">
                  {Math.min(currentIndex + 1, items.length)}/{items.length}
                </div>
              )}
            </div>
          ) : (
            // 表示モード: グリッド表示
            <div className="flex items-center justify-center">
              {items.length === 1 ? (
                <MinecraftItemIcon itemId={items[0]} size={size - 12} />
              ) : (
                <div className="grid grid-cols-2 gap-0.5">
                  {items.slice(0, 4).map((itemId, i) => (
                    <MinecraftItemIcon key={i} itemId={itemId} size={(size - 16) / 2} />
                  ))}
                </div>
              )}
            </div>
          )
        ) : editable ? (
          <PlusIcon className="w-6 h-6 text-muted-foreground/50" />
        ) : (
          <div className="w-3/4 h-3/4 bg-muted-foreground/10 rounded-sm" />
        )}
      </div>

      {/* キーバインド表示 */}
      {keybindText && (
        <div className="mt-1 text-[10px] text-muted-foreground font-mono truncate max-w-[60px] text-center">
          {keybindText}
        </div>
      )}

    </div>
  );
}

interface HotbarRowProps {
  slots: { items: string[]; num: number }[];
  offhand?: string[];
  size?: number;
  onSlotClick?: (slotName: string) => void;
  editable?: boolean;
  keybinds?: {
    hotbar1?: string | string[];
    hotbar2?: string | string[];
    hotbar3?: string | string[];
    hotbar4?: string | string[];
    hotbar5?: string | string[];
    hotbar6?: string | string[];
    hotbar7?: string | string[];
    hotbar8?: string | string[];
    hotbar9?: string | string[];
    swapHands?: string | string[];
  };
  customKeys?: CustomKeyInfo[];
}

/**
 * ホットバー行コンポーネント（9スロット + オフハンド 横一列）
 */
export function HotbarRow({ slots, offhand = [], size = 64, onSlotClick, editable = false, keybinds, customKeys }: HotbarRowProps) {
  return (
    <div className="flex items-start gap-1 overflow-x-auto pb-2">
      {/* ホットバー 1-9 */}
      {slots.map((slot) => (
        <HotbarSlot
          key={slot.num}
          items={slot.items}
          size={size}
          editable={editable}
          onClick={onSlotClick ? () => onSlotClick(`slot${slot.num}`) : undefined}
          keybind={keybinds?.[`hotbar${slot.num}` as keyof typeof keybinds]}
          customKeys={customKeys}
        />
      ))}

      {/* セパレーター */}
      <div className="flex items-center px-1 self-stretch">
        <div className="w-px bg-border/50" style={{ height: size }} />
      </div>

      {/* オフハンド */}
      <HotbarSlot
        items={offhand}
        size={size}
        editable={editable}
        onClick={onSlotClick ? () => onSlotClick('offhand') : undefined}
        keybind={keybinds?.swapHands}
        customKeys={customKeys}
      />
    </div>
  );
}
