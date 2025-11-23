'use client';

import { DraggableModal } from '@/components/ui/DraggableModal';
import { MinecraftItemIcon, formatItemName } from '@/lib/mcitems';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  selectedSlot: string;
  currentItems: string[];
}

// スピードラン用アイテム定義
const SPEEDRUN_ITEMS = [
  // 道具
  { id: 'minecraft:iron_axe', name: '斧', category: 'tools' },
  { id: 'minecraft:iron_pickaxe', name: 'ピッケル', category: 'tools' },
  { id: 'minecraft:iron_shovel', name: 'シャベル', category: 'tools' },
  { id: 'minecraft:iron_sword', name: '剣', category: 'tools' },
  { id: 'minecraft:golden_pickaxe', name: '金ピッケル', category: 'tools' },
  { id: 'minecraft:bucket', name: 'バケツ', category: 'tools' },

  // ブロック
  { id: 'minecraft:dirt', name: 'ブロック（不動）', category: 'blocks' },
  { id: 'minecraft:gravel', name: 'ブロック（重力）', category: 'blocks' },
  { id: 'minecraft:obsidian', name: '黒曜石', category: 'blocks' },
  { id: 'minecraft:crying_obsidian', name: '泣く黒曜石', category: 'blocks' },
  { id: 'minecraft:gold_block', name: '金ブロック', category: 'blocks' },
  { id: 'minecraft:crafting_table', name: '作業台', category: 'blocks' },
  { id: 'minecraft:iron_bars', name: '鉄格子', category: 'blocks' },
  { id: 'minecraft:tnt', name: 'TNT', category: 'blocks' },
  { id: 'minecraft:glowstone', name: 'グロウストーン', category: 'blocks' },
  { id: 'minecraft:soul_sand', name: 'ソウルサンド', category: 'blocks' },
  { id: 'minecraft:respawn_anchor', name: 'リスポーンアンカー', category: 'blocks' },

  // レッドストーン系
  { id: 'minecraft:oak_door', name: 'ドア', category: 'redstone' },
  { id: 'minecraft:stone_pressure_plate', name: '感圧板', category: 'redstone' },

  // 食料・ベッド・ポーション
  { id: 'minecraft:cooked_porkchop', name: '食料', category: 'consumables' },
  { id: 'minecraft:white_bed', name: 'ベッド', category: 'consumables' },
  { id: 'minecraft:potion', name: '耐火のポーション', category: 'consumables' },
  { id: 'minecraft:splash_potion', name: '耐火のスプラッシュポーション', category: 'consumables' },

  // 武器・戦闘
  { id: 'minecraft:bow', name: '弓', category: 'combat' },
  { id: 'minecraft:crossbow', name: 'クロスボウ', category: 'combat' },
  { id: 'minecraft:shield', name: '盾', category: 'combat' },

  // その他アイテム
  { id: 'minecraft:flint_and_steel', name: '火打石と打ち金', category: 'misc' },
  { id: 'minecraft:fire_charge', name: 'ファイヤーチャージ', category: 'misc' },
  { id: 'minecraft:gold_ingot', name: '金インゴット', category: 'misc' },
  { id: 'minecraft:ender_pearl', name: 'エンダーパール', category: 'misc' },
  { id: 'minecraft:ender_eye', name: 'エンダーアイ', category: 'misc' },
  { id: 'minecraft:oak_boat', name: 'ボート', category: 'misc' },
  { id: 'minecraft:blaze_rod', name: 'ブレイズロッド', category: 'misc' },
  { id: 'minecraft:blaze_powder', name: 'ブレイズパウダー', category: 'misc' },
  { id: 'minecraft:string', name: '糸', category: 'misc' },
  { id: 'minecraft:glowstone_dust', name: 'グロウストーンダスト', category: 'misc' },

  // 特殊
  { id: 'any', name: 'なんでも', category: 'special' },
];

/**
 * アイテム選択モーダル（スピードラン用簡易版）
 */
export function ItemSelectorModal({
  isOpen,
  onClose,
  onSelect,
  onRemove,
  selectedSlot,
  currentItems
}: ItemSelectorModalProps) {
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
      maxWidth="2xl"
      panelClassName="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] select-none"
      headerClassName="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-4 border-b border-border flex-shrink-0"
      footerClassName="px-6 py-4 border-t border-border bg-muted/30 flex-shrink-0"
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
      <div className="p-4">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {SPEEDRUN_ITEMS.map((item) => {
            const isSelected = currentItems.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`relative p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors group ${
                  isSelected
                    ? 'bg-primary/30 border-primary'
                    : 'bg-[rgb(var(--muted))] border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--border))]/80'
                }`}
                title={item.name}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                )}
                <MinecraftItemIcon itemId={item.id} size={48} />
                <span className={`text-xs text-center leading-tight ${
                  isSelected ? 'text-white' : 'text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--foreground))]'
                }`}>
                  {formatItemName(item.id)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </DraggableModal>
  );
}
