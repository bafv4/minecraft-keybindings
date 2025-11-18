/**
 * アイテム配置の型定義
 */

export interface ItemLayout {
  uuid: string;
  segment: string;
  slot1: string[];
  slot2: string[];
  slot3: string[];
  slot4: string[];
  slot5: string[];
  slot6: string[];
  slot7: string[];
  slot8: string[];
  slot9: string[];
  offhand: string[];
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * アイテム配置作成用の型（IDやタイムスタンプを除外）
 */
export type ItemLayoutCreate = Omit<ItemLayout, 'createdAt' | 'updatedAt'>;

/**
 * アイテム配置更新用の型（UUIDとセグメント以外は任意）
 */
export type ItemLayoutUpdate = Partial<Omit<ItemLayout, 'uuid' | 'segment' | 'createdAt' | 'updatedAt'>>;

/**
 * Speedrunセグメントの型
 */
export type SpeedrunSegment =
  | 'Overworld'
  | 'Nether'
  | 'Bastion'
  | 'Fortress'
  | 'End'
  | 'Stronghold'
  | 'Custom';

/**
 * セグメント情報
 */
export interface SegmentInfo {
  id: SpeedrunSegment;
  label: string;
  description?: string;
}
