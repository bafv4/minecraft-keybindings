# lib/mcitems モジュール仕様書

Minecraft 1.16.x のアイテムデータ、テクスチャ、翻訳を提供するライブラリモジュール。

## ディレクトリ構造

```
lib/mcitems/
├── index.ts              # エントリーポイント（すべてのエクスポート）
├── items.ts              # アイテムデータ定義
├── types.ts              # 型定義
├── translations.ts       # 日本語翻訳ユーティリティ
├── potionEffects.ts      # ポーション効果データ
├── textureMap.ts         # テクスチャマッピング（自動生成）
├── MinecraftItemIcon.tsx # アイテムアイコンコンポーネント
├── assets.d.ts           # アセット型定義
└── assets/
    ├── ja_jp.json        # Minecraft日本語翻訳データ
    └── textures/
        └── 1.16.1/
            ├── items/    # アイテムテクスチャ（PNG）
            └── blocks/   # ブロックテクスチャ（PNG）
```

## エクスポート一覧

### コンポーネント

#### `MinecraftItemIcon`

Minecraftアイテムのアイコンを表示するReactコンポーネント。

```tsx
import { MinecraftItemIcon } from '@/lib/mcitems';

<MinecraftItemIcon
  itemId="minecraft:diamond_sword"
  size={48}
  nbtData={{ Potion: 'minecraft:fire_resistance' }}
/>
```

**Props:**

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `itemId` | `string` | 必須 | アイテムID（例: `minecraft:diamond_sword`） |
| `size` | `number` | `48` | アイコンサイズ（ピクセル） |
| `fallback` | `ReactNode` | - | テクスチャがない場合のフォールバック要素 |
| `showFallbackOnError` | `boolean` | `true` | エラー時にフォールバックを表示 |
| `nbtData` | `any` | - | NBTデータ（ポーションの効果指定など） |

**フォールバック動作:**
- テクスチャが見つからない場合、アイテムIDに基づいた色とアイテム種別に応じた絵文字を表示

### アイテムデータ

#### `MINECRAFT_ITEMS`

カテゴリ別のMinecraft 1.16.xアイテムリスト。

```typescript
const MINECRAFT_ITEMS: Record<Exclude<ItemCategory, 'all'>, string[]>
```

#### `ITEM_CATEGORIES`

UIで使用するカテゴリ定義。

```typescript
const ITEM_CATEGORIES: { id: ItemCategory; name: string }[] = [
  { id: 'all', name: 'すべて' },
  { id: 'building_blocks', name: '建築ブロック' },
  { id: 'decorations', name: '装飾ブロック' },
  { id: 'redstone', name: 'レッドストーン' },
  { id: 'transportation', name: '交通' },
  { id: 'miscellaneous', name: '雑貨' },
  { id: 'foodstuffs', name: '食料' },
  { id: 'tools', name: '道具' },
  { id: 'combat', name: '戦闘' },
  { id: 'brewing', name: '醸造' },
];
```

#### `getAllItems(): string[]`

すべてのアイテムIDを取得。

```typescript
const items = getAllItems();
// ['minecraft:dirt', 'minecraft:cobblestone', ...]
```

#### `getItemsByCategory(category: ItemCategory): string[]`

指定カテゴリのアイテムを取得。

```typescript
const tools = getItemsByCategory('tools');
// ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', ...]
```

#### `getCraftableItems(): string[]`

クラフト可能なアイテムのみを取得（SearchCraft機能用）。
ポーション、自然生成アイテム、モブドロップ、製錬アイテムを除外。

#### `getCraftableItemsByCategory(category: ItemCategory): string[]`

指定カテゴリのクラフト可能アイテムを取得。

### 検索・フォーマット

#### `searchItems(query: string): string[]`

アイテムIDで検索。

```typescript
const results = searchItems('diamond');
// ['minecraft:diamond', 'minecraft:diamond_sword', ...]
```

#### `formatItemName(itemId: string): string`

アイテムIDを表示名に変換（日本語優先）。

```typescript
formatItemName('minecraft:diamond_sword');
// 'ダイヤモンドの剣'

formatItemName('minecraft:unknown_item');
// 'Unknown Item' (フォールバック: 英語形式)
```

### ポーション効果

#### `POTION_EFFECTS`

すべてのポーション効果データ。

```typescript
interface PotionEffectInfo {
  id: string;        // 'minecraft:fire_resistance'
  name: string;      // '火炎耐性'
  variant: number;   // テクスチャバリアント番号
  duration?: string; // '3:00' または '8:00'
}
```

#### `getPotionEffectInfo(potionEffect: string): PotionEffectInfo | undefined`

ポーション効果の情報を取得。

```typescript
const info = getPotionEffectInfo('minecraft:fire_resistance');
// { id: 'minecraft:fire_resistance', name: '火炎耐性', variant: 12, duration: '3:00' }
```

#### `formatPotionName(itemId: string, potionEffect: string): string`

ポーションの表示名を生成。

```typescript
formatPotionName('minecraft:splash_potion', 'minecraft:fire_resistance');
// '火炎耐性のスプラッシュポーション'
```

#### `formatPotionEffect(potionEffect: string): string`

効果名と持続時間をフォーマット。

```typescript
formatPotionEffect('minecraft:long_fire_resistance');
// '火炎耐性 (8:00)'
```

### 型定義

#### `ItemCategory`

```typescript
type ItemCategory =
  | 'all'
  | 'building_blocks'
  | 'decorations'
  | 'redstone'
  | 'transportation'
  | 'miscellaneous'
  | 'foodstuffs'
  | 'tools'
  | 'combat'
  | 'brewing';
```

#### `MinecraftItem`

```typescript
interface MinecraftItem {
  id: string;              // "minecraft:wooden_pickaxe"
  name: string;            // 表示名
  category: ItemCategory;
  stackSize?: number;      // スタックサイズ（デフォルト: 64）
}
```

#### `NBTItem`

```typescript
interface NBTItem {
  id: string;
  Count: number;
  Slot?: number;
  tag?: {
    Enchantments?: Enchantment[];
    Damage?: number;
    Potion?: string;
    display?: { Name?: string };
  };
}
```

## アイテムID形式

すべてのアイテムIDは `minecraft:` プレフィックス付きの形式を使用。

```
minecraft:diamond_sword
minecraft:oak_planks
minecraft:potion
```

## ポーションのテクスチャバリアント

ポーションは効果ごとに異なるテクスチャを使用。NBTデータの `Potion` フィールドで効果を指定。

```typescript
// 火炎耐性ポーションのアイコン表示
<MinecraftItemIcon
  itemId="minecraft:potion"
  nbtData={{ Potion: 'minecraft:fire_resistance' }}
/>
```

対応するポーション効果（41種類）:
- 基本: `water`, `mundane`, `thick`, `awkward`
- 効果付き: `night_vision`, `invisibility`, `leaping`, `fire_resistance`, `swiftness`, `slowness`, `turtle_master`, `water_breathing`, `healing`, `harming`, `poison`, `regeneration`, `strength`, `weakness`, `slow_falling`
- 延長版: `long_*` プレフィックス（8分間）
- 強化版: `strong_*` プレフィックス

## 使用例

### アイテム選択UI

```tsx
import {
  ITEM_CATEGORIES,
  getItemsByCategory,
  formatItemName,
  MinecraftItemIcon
} from '@/lib/mcitems';

function ItemSelector() {
  const [category, setCategory] = useState<ItemCategory>('all');
  const items = getItemsByCategory(category);

  return (
    <div>
      <select onChange={e => setCategory(e.target.value as ItemCategory)}>
        {ITEM_CATEGORIES.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <div className="grid grid-cols-8 gap-2">
        {items.map(itemId => (
          <div key={itemId} title={formatItemName(itemId)}>
            <MinecraftItemIcon itemId={itemId} size={32} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### SearchCraft用アイテムフィルタ

```tsx
import { getCraftableItems, searchItems } from '@/lib/mcitems';

// クラフト可能なアイテムのみ表示
const craftableItems = getCraftableItems();

// 検索機能
const results = searchItems('pickaxe');
```
