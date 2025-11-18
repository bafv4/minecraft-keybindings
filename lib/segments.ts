/**
 * Speedrunセグメント定義
 */

import type { SegmentInfo, SpeedrunSegment } from '@/types/itemLayout';

/**
 * プリセットセグメント一覧
 */
export const SPEEDRUN_SEGMENTS: Record<SpeedrunSegment, SegmentInfo> = {
  Overworld: {
    id: 'Overworld',
    label: 'オーバーワールド',
    description: 'スポーン〜ネザーポータル到達まで',
  },
  Nether: {
    id: 'Nether',
    label: 'ネザー',
    description: 'ネザー探索全般',
  },
  Bastion: {
    id: 'Bastion',
    label: '砦の遺跡',
    description: 'Bastionでのピグリン取引',
  },
  Fortress: {
    id: 'Fortress',
    label: 'ネザー要塞',
    description: 'ブレイズロッド収集',
  },
  Stronghold: {
    id: 'Stronghold',
    label: '要塞',
    description: 'エンドポータル到達まで',
  },
  End: {
    id: 'End',
    label: 'エンド',
    description: 'エンダードラゴン討伐',
  },
  Custom: {
    id: 'Custom',
    label: 'カスタム',
    description: 'ユーザー定義セグメント',
  },
};

/**
 * セグメント一覧を配列で取得
 */
export function getSegmentList(): SegmentInfo[] {
  return Object.values(SPEEDRUN_SEGMENTS);
}

/**
 * セグメントIDからセグメント情報を取得
 */
export function getSegmentInfo(segmentId: string): SegmentInfo | undefined {
  return SPEEDRUN_SEGMENTS[segmentId as SpeedrunSegment];
}

/**
 * デフォルトのアイテム配置（空のホットバー）
 */
export function getEmptyItemLayout(uuid: string, segment: string) {
  return {
    uuid,
    segment,
    slot1: [],
    slot2: [],
    slot3: [],
    slot4: [],
    slot5: [],
    slot6: [],
    slot7: [],
    slot8: [],
    slot9: [],
    offhand: [],
    notes: null,
  };
}
