import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from './lib/utils';
import { getLocalTexture } from './textureMap';
import { getPotionTextureVariant } from './potionEffects';

export interface MinecraftItemIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  itemId: string;
  size?: number;
  fallback?: React.ReactNode;
  showFallbackOnError?: boolean;
  nbtData?: any; // NBT tag data for items that need it (e.g., potions)
}

import type { StaticImageData } from 'next/image';

/**
 * Get local texture URL for 1.16.1 items from the texture map
 * Returns undefined if texture is not available locally
 */
function getLocalTextureUrl(itemId: string, nbtData?: any): StaticImageData | undefined {
  // Handle special cases where itemId needs normalization
  let normalizedId = itemId;

  // Shulker box without color defaults to purple (the default in Minecraft)
  if (itemId === 'minecraft:shulker_box') {
    normalizedId = 'minecraft:purple_shulker_box';
  }

  // Handle potions with effect variants
  if (itemId === 'minecraft:potion' || itemId === 'minecraft:splash_potion' || itemId === 'minecraft:lingering_potion') {
    const potionEffect = nbtData?.Potion;
    const variant = getPotionTextureVariant(potionEffect);

    if (variant) {
      // Construct the texture key with variant number
      const itemName = itemId.replace('minecraft:', '');
      normalizedId = `minecraft:${itemName}_${variant}`;
    }
  }

  return getLocalTexture(normalizedId);
}

/**
 * Generate a unique color for an item based on its ID
 */
function getItemColor(itemId: string): string {
  const itemName = itemId.replace(/^minecraft:/, '');

  // Fire Resistance potion color (pink) for all potions in 1.16
  if (itemName.includes('potion')) {
    return 'hsl(330, 81%, 66%)'; // Fire Resistance pink (1.16)
  }

  // Hash the item name to get a consistent color
  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hue (0-360)
  const hue = Math.abs(hash % 360);

  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Get emoji icon based on item category
 */
function getItemEmoji(itemId: string): string {
  const itemName = itemId.replace(/^minecraft:/, '');

  // Tools
  if (itemName.includes('pickaxe')) return '⛏️';
  if (itemName.includes('axe')) return '🪓';
  if (itemName.includes('shovel')) return '🏗️';
  if (itemName.includes('hoe')) return '🌾';
  if (itemName.includes('sword')) return '⚔️';

  // Armor
  if (itemName.includes('helmet')) return '🪖';
  if (itemName.includes('chestplate')) return '🦺';
  if (itemName.includes('leggings')) return '👖';
  if (itemName.includes('boots')) return '👢';

  // Food
  if (itemName.includes('apple')) return '🍎';
  if (itemName.includes('bread')) return '🍞';
  if (itemName.includes('meat') || itemName.includes('beef') || itemName.includes('porkchop')) return '🍖';
  if (itemName.includes('fish') || itemName.includes('cod') || itemName.includes('salmon')) return '🐟';
  if (itemName.includes('carrot')) return '🥕';
  if (itemName.includes('potato')) return '🥔';

  // Blocks
  if (itemName.includes('stone') || itemName.includes('cobblestone')) return '🪨';
  if (itemName.includes('wood') || itemName.includes('log') || itemName.includes('planks')) return '🪵';
  if (itemName.includes('glass')) return '🔲';
  if (itemName.includes('dirt') || itemName.includes('grass')) return '🟫';
  if (itemName.includes('wool')) return '🧶';
  if (itemName.includes('iron_bars')) return '🔒';

  // Items
  if (itemName.includes('diamond')) return '💎';
  if (itemName.includes('emerald')) return '💚';
  if (itemName.includes('gold')) return '🟡';
  if (itemName.includes('iron')) return '⚙️';
  if (itemName.includes('book')) return '📖';
  if (itemName.includes('potion')) return '🧪';
  if (itemName.includes('bow')) return '🏹';
  if (itemName.includes('arrow')) return '➡️';
  if (itemName.includes('bed')) return '🛏️';
  if (itemName.includes('chest')) return '📦';
  if (itemName.includes('door')) return '🚪';
  if (itemName.includes('torch')) return '🔦';
  if (itemName.includes('bucket')) return '🪣';

  // Nether update items (1.16)
  if (itemName.includes('respawn_anchor')) return '⚓';
  if (itemName.includes('lodestone')) return '🧲';
  if (itemName.includes('campfire')) return '🔥';
  if (itemName.includes('lantern')) return '🏮';

  // Default
  return '📦';
}

export function MinecraftItemIcon({
  itemId,
  size = 48,
  fallback,
  showFallbackOnError = true,
  nbtData,
  className,
  ...props
}: MinecraftItemIconProps) {
  // Remove nbtData from props to avoid React warning about unknown DOM attribute
  const { nbtData: _unused, ...imgProps } = { nbtData, ...props } as any;
  const [imageUrl, setImageUrl] = useState<string | undefined>(() => {
    const texture = getLocalTextureUrl(itemId, nbtData);
    return texture?.src;
  });
  const [hasError, setHasError] = useState(false);

  // Reset state when itemId or nbtData changes
  useEffect(() => {
    const localUrl = getLocalTextureUrl(itemId, nbtData);
    setImageUrl(localUrl?.src);
    setHasError(!localUrl); // If no local texture, show fallback immediately
  }, [itemId, nbtData]);

  const handleError = () => {
    setHasError(true);
  };

  const handleLoad = () => {
    setHasError(false);
  };

  // Show fallback if no texture URL or error occurred
  if ((hasError || !imageUrl) && showFallbackOnError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback: show unique colored box with emoji
    const color = getItemColor(itemId);
    const emoji = getItemEmoji(itemId);

    return (
      <div
        className={cn('flex items-center justify-center rounded border-2 border-gray-300 dark:border-gray-600', className)}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          fontSize: size * 0.5,
        }}
        title={itemId}
        {...imgProps}
      >
        <span style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={itemId}
      className={cn('pixelated', className)}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        ...imgProps.style,
      }}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...imgProps}
    />
  );
}
