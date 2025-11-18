'use client';

import { MinecraftItemIcon, formatItemName } from '@/lib/mcitems';

interface HotbarSlot {
  items: string[];
  slotNumber: number;
}

interface HotbarDisplayProps {
  slot1?: string[];
  slot2?: string[];
  slot3?: string[];
  slot4?: string[];
  slot5?: string[];
  slot6?: string[];
  slot7?: string[];
  slot8?: string[];
  slot9?: string[];
  offhand?: string[];
  size?: number;
}

/**
 * Minecraftのホットバーを模したアイテム配置表示コンポーネント
 */
export function HotbarDisplay({
  slot1 = [],
  slot2 = [],
  slot3 = [],
  slot4 = [],
  slot5 = [],
  slot6 = [],
  slot7 = [],
  slot8 = [],
  slot9 = [],
  offhand = [],
  size = 64,
}: HotbarDisplayProps) {
  const hotbarSlots: HotbarSlot[] = [
    { items: slot1, slotNumber: 1 },
    { items: slot2, slotNumber: 2 },
    { items: slot3, slotNumber: 3 },
    { items: slot4, slotNumber: 4 },
    { items: slot5, slotNumber: 5 },
    { items: slot6, slotNumber: 6 },
    { items: slot7, slotNumber: 7 },
    { items: slot8, slotNumber: 8 },
    { items: slot9, slotNumber: 9 },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ホットバー（1-9） */}
      <div className="flex gap-1 bg-gray-800/90 p-2 rounded-lg border-2 border-gray-700">
        {hotbarSlots.map((slot) => (
          <HotbarSlotDisplay
            key={slot.slotNumber}
            slotNumber={slot.slotNumber}
            items={slot.items}
            size={size}
          />
        ))}
      </div>

      {/* オフハンド */}
      {offhand.length > 0 && (
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-gray-300">オフハンド:</span>
          <HotbarSlotDisplay slotNumber="オフハンド" items={offhand} size={size} />
        </div>
      )}
    </div>
  );
}

interface HotbarSlotDisplayProps {
  slotNumber: number | string;
  items: string[];
  size: number;
}

/**
 * 個別のホットバースロット表示
 */
function HotbarSlotDisplay({ slotNumber, items, size }: HotbarSlotDisplayProps) {
  const hasItems = items.length > 0;

  return (
    <div className="relative">
      {/* スロット番号 */}
      <div className="absolute -top-1 -left-1 z-10 bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded border border-gray-600">
        {slotNumber}
      </div>

      {/* スロット枠 */}
      <div
        className={`relative flex items-center justify-center border-2 rounded ${
          hasItems
            ? 'bg-gray-700 border-gray-500'
            : 'bg-gray-900/50 border-gray-700'
        }`}
        style={{
          width: size + 8,
          height: size + 8,
        }}
      >
        {hasItems ? (
          <div className="flex flex-col gap-0.5">
            {items.map((itemId, index) => (
              <div key={index} className="group relative">
                <MinecraftItemIcon
                  itemId={itemId}
                  size={items.length > 1 ? size / 2 : size}
                  className="pixelated"
                />
                {/* ホバー時のアイテム名表示 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-gray-600">
                    {formatItemName(itemId)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-600 text-xs">空</span>
        )}
      </div>
    </div>
  );
}
