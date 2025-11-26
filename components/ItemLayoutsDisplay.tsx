'use client';

import { HotbarRow } from './HotbarSlot';
import { getSegmentInfo, SPEEDRUN_SEGMENTS } from '@/lib/segments';
import type { CustomKeyInfo } from '@/lib/utils';
import type { PresetSegment } from '@/types/itemLayout';

interface ItemLayout {
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
}

interface Keybinds {
  hotbar1?: string | string[];
  hotbar2?: string | string[];
  hotbar3?: string | string[];
  hotbar4?: string | string[];
  hotbar5?: string | string[];
  hotbar6?: string | string[];
  hotbar7?: string | string[];
  hotbar8?: string | string[];
  hotbar9?: string | string[];
  swapHands?: string | string[];
}

interface ItemLayoutsDisplayProps {
  itemLayouts: ItemLayout[];
  keybinds?: Keybinds;
  customKeys?: CustomKeyInfo[];
}

export function ItemLayoutsDisplay({ itemLayouts, keybinds, customKeys }: ItemLayoutsDisplayProps) {
  if (!itemLayouts || itemLayouts.length === 0) {
    return null;
  }

  // セグメント名から基本名を取得（付け足された文字列を除く）
  const getBaseSegmentName = (segment: string): string => {
    // 括弧やスペースなどの付加情報を削除
    // 例: "Common (日本語)" → "Common"
    const match = segment.match(/^([A-Za-z]+)/);
    return match ? match[1] : segment;
  };

  // セグメントを定義順に並び替え
  const sortedLayouts = [...itemLayouts].sort((a, b) => {
    const baseA = getBaseSegmentName(a.segment);
    const baseB = getBaseSegmentName(b.segment);

    // プリセットセグメントのキー一覧
    const presetKeys = Object.keys(SPEEDRUN_SEGMENTS) as PresetSegment[];

    const indexA = presetKeys.findIndex(key => key === baseA);
    const indexB = presetKeys.findIndex(key => key === baseB);

    // 両方ともプリセットの場合、定義順で並べる
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // Aがプリセット、Bがカスタム → Aを先に
    if (indexA !== -1 && indexB === -1) {
      return -1;
    }

    // Aがカスタム、Bがプリセット → Bを先に
    if (indexA === -1 && indexB !== -1) {
      return 1;
    }

    // 両方ともカスタムの場合、元の順序を維持（安定ソート）
    return 0;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">アイテム配置</h2>
      <div className="space-y-4">
        {sortedLayouts.map((layout) => {
          const segmentInfo = getSegmentInfo(layout.segment);
          const slots = [
            { items: layout.slot1, num: 1 },
            { items: layout.slot2, num: 2 },
            { items: layout.slot3, num: 3 },
            { items: layout.slot4, num: 4 },
            { items: layout.slot5, num: 5 },
            { items: layout.slot6, num: 6 },
            { items: layout.slot7, num: 7 },
            { items: layout.slot8, num: 8 },
            { items: layout.slot9, num: 9 },
          ];
          return (
            <div key={layout.segment} className="bg-stone-200/80 dark:bg-muted/50 p-4 rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {segmentInfo?.label || layout.segment}
              </h3>
              {layout.notes && (
                <p className="text-sm text-muted-foreground mb-3">{layout.notes}</p>
              )}
              <HotbarRow slots={slots} offhand={layout.offhand} keybinds={keybinds} customKeys={customKeys} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
