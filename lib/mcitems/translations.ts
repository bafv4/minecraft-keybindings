import jaJp from './assets/ja_jp.json';

/**
 * Get Japanese translation for a Minecraft item ID
 * @param itemId - The item ID (e.g., "minecraft:diamond_sword")
 * @returns Japanese name if available, undefined otherwise
 */
export function getItemNameJa(itemId: string): string | undefined {
  // Try item translation
  const itemKey = `item.${itemId}`;
  if (itemKey in jaJp) {
    return jaJp[itemKey as keyof typeof jaJp];
  }

  // Try block translation
  const blockKey = `block.${itemId}`;
  if (blockKey in jaJp) {
    return jaJp[blockKey as keyof typeof jaJp];
  }

  return undefined;
}
