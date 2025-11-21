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
 * プリセットセグメントの型
 */
export type PresetSegment =
  | 'Common'
  | 'Overworld'
  | 'EnterNether'
  | 'Bastion'
  | 'BastionToFort'
  | 'Fortress'
  | 'Stronghold'
  | 'EnterEnd'
  | 'EnterEndZero';

/**
 * セグメント情報（プリセット用）
 */
export interface SegmentInfo {
  id: PresetSegment;
  label: string;
  description?: string;
}

// 後方互換性のため
export type SpeedrunSegment = PresetSegment | string;
