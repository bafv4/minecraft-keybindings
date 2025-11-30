'use client';

import { MinecraftItemIcon } from '@bafv4/mcitems/1.16/react';

interface SpeedrunItemIconProps {
  itemId: string;
  size?: number;
}

// アイテムIDから表示名を取得
const ITEM_NAMES: Record<string, string> = {
  'minecraft:iron_axe': '斧',
  'minecraft:iron_pickaxe': 'ピッケル',
  'minecraft:iron_shovel': 'シャベル',
  'minecraft:iron_sword': '剣',
  'minecraft:golden_pickaxe': '金ピッケル',
  'minecraft:dirt': 'ブロック',
  'minecraft:gravel': '砂利',
  'minecraft:obsidian': '黒曜石',
  'minecraft:gold_block': '金ブロック',
  'minecraft:crafting_table': '作業台',
  'minecraft:iron_bars': '鉄格子',
  'minecraft:oak_door': 'ドア',
  'minecraft:stone_pressure_plate': '感圧板',
  'minecraft:cooked_porkchop': '食料',
  'minecraft:red_bed': 'ベッド',
  'minecraft:bow': '弓',
  'minecraft:crossbow': 'クロスボウ',
  'minecraft:shield': '盾',
  'minecraft:flint_and_steel': '火打石',
  'minecraft:fire_charge': 'ファイヤーチャージ',
  'minecraft:gold_ingot': '金インゴット',
  'minecraft:ender_pearl': 'エンダーパール',
  'minecraft:ender_eye': 'エンダーアイ',
  'minecraft:oak_boat': 'ボート',
  'any': 'なんでも',
};

/**
 * スピードラン用アイテムアイコン
 * - "any" は?マーク表示
 * - テクスチャがないアイテムはカスタムアイコンを表示
 */
export function SpeedrunItemIcon({ itemId, size = 48 }: SpeedrunItemIconProps) {
  if (itemId === 'any') {
    return (
      <div
        className="flex items-center justify-center bg-primary/30 rounded"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        <span className="text-white font-bold drop-shadow-md">?</span>
      </div>
    );
  }

  return (
    <MinecraftItemIcon
      itemId={itemId}
      size={size}
      fallback={
        <div
          className="flex items-center justify-center rounded bg-zinc-700"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.4,
          }}
          title={ITEM_NAMES[itemId] || itemId}
        >
          <span>📦</span>
        </div>
      }
    />
  );
}

/**
 * アイテムIDから表示名を取得
 */
export function getSpeedrunItemName(itemId: string): string {
  return ITEM_NAMES[itemId] || itemId.replace('minecraft:', '');
}
