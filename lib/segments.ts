/**
 * Speedrunセグメント定義
 */

import type { SegmentInfo, PresetSegment } from '@/types/itemLayout';

/**
 * プリセットセグメント一覧
 */
export const SPEEDRUN_SEGMENTS: Record<PresetSegment, SegmentInfo> = {
  Common: {
    id: 'Common',
    label: 'Common',
  },
  Overworld: {
    id: 'Overworld',
    label: 'Overworld',
  },
  EnterNether: {
    id: 'EnterNether',
    label: 'Enter Nether',
  },
  Bastion: {
    id: 'Bastion',
    label: 'Bastion',
  },
  BastionToFort: {
    id: 'BastionToFort',
    label: 'Bastion → Fort',
  },
  Fortress: {
    id: 'Fortress',
    label: 'Fortress',
  },
  Stronghold: {
    id: 'Stronghold',
    label: 'Blinded / Stronghold',
  },
  EnterEnd: {
    id: 'EnterEnd',
    label: 'Enter End',
  },
  EnterEndZero: {
    id: 'EnterEndZero',
    label: 'Enter End (Zero)',
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
  return SPEEDRUN_SEGMENTS[segmentId as PresetSegment];
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
