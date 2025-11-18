import jaJp from './assets/ja_jp.json';

/**
 * Get Japanese translation for a Minecraft item ID
 * @param itemId - The item ID (e.g., "minecraft:diamond_sword")
 * @returns Japanese name if available, undefined otherwise
 */
export function getItemNameJa(itemId: string): string | undefined {
  // Debug: Log the first time this is called
  if (typeof window !== 'undefined' && !(window as any).__jaJpDebugLogged) {
    console.log('[Translation Debug] ja_jp.json loaded:', Object.keys(jaJp).length, 'keys');
    console.log('[Translation Debug] Sample keys:', Object.keys(jaJp).slice(0, 5));
    console.log('[Translation Debug] jaJp type:', typeof jaJp);
    console.log('[Translation Debug] jaJp is:', jaJp);
    (window as any).__jaJpDebugLogged = true;
  }

  // Try item translation
  const itemKey = `item.${itemId}`;
  if (itemKey in jaJp) {
    const translation = jaJp[itemKey as keyof typeof jaJp];
    console.log(`[Translation] ${itemId} → ${itemKey} → ${translation}`);
    return translation;
  }

  // Try block translation
  const blockKey = `block.${itemId}`;
  if (blockKey in jaJp) {
    const translation = jaJp[blockKey as keyof typeof jaJp];
    console.log(`[Translation] ${itemId} → ${blockKey} → ${translation}`);
    return translation;
  }

  console.log(`[Translation] No translation found for ${itemId}`);
  return undefined;
}
