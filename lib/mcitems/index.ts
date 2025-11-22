// Re-export MinecraftItemIcon component
export { MinecraftItemIcon } from './MinecraftItemIcon';
export type { MinecraftItemIconProps } from './MinecraftItemIcon';

// Re-export item data
export { MINECRAFT_ITEMS, getAllItems, getItemsByCategory, ITEM_CATEGORIES } from './items';

// Re-export potion effects
export { POTION_EFFECTS, getPotionEffectInfo, formatPotionName, formatPotionEffect } from './potionEffects';
export type { PotionEffectInfo } from './potionEffects';

// NOTE: textureMap is not exported to avoid type issues in consuming packages
// It can be used internally by MinecraftItemIcon component

// Re-export types
export type { ItemCategory } from './types';

// Additional utilities for item searching and formatting
import { getAllItems } from './items';
import { getItemNameJa } from './translations';

export function searchItems(query: string): string[] {
  if (!query) return getAllItems();
  const lowerQuery = query.toLowerCase();

  return getAllItems().filter((item: string) => {
    // Search by item ID (with and without minecraft: prefix)
    if (item.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search by item ID without prefix (e.g., "diamond_sword")
    const itemName = item.replace(/^minecraft:/, '');
    if (itemName.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    return false;
  });
}

export function formatItemName(itemId: string): string {
  // Try Japanese translation first
  const jaName = getItemNameJa(itemId);
  if (jaName) {
    return jaName;
  }

  // Fallback to English formatted name
  return itemId
    .replace('minecraft:', '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
