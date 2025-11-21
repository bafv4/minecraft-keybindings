'use client';

import { useState, useMemo, useCallback } from 'react';
import { VirtualKeyboard } from './VirtualKeyboard';
import { PieChartModal } from './PieChartModal';
import { ACTION_LABELS, formatKeyName } from '@/lib/utils';

interface KeyStatsDisplayProps {
  allSettings: Array<{
    user: { mcid: string; uuid: string };
    keybindings: Record<string, string | string[]>;
  }>;
}

// Color palette for pie charts - パステルカラー
const COLORS = [
  '#A7C7E7', // pastel blue
  '#B4E7CE', // pastel green
  '#FFE5B4', // pastel orange
  '#FFB3BA', // pastel red
  '#E0BBE4', // pastel purple
  '#FFC8DD', // pastel pink
  '#B5E2D8', // pastel teal
  '#FFDAB9', // pastel peach
  '#C5B9E8', // pastel indigo
  '#B0E0E6', // pastel cyan
];

export function KeyStatsDisplay({ allSettings }: KeyStatsDisplayProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  // キーごとの操作割り当てを事前計算（O(n*m)を一度だけ実行）
  const keyToActionsMap = useMemo(() => {
    const map = new Map<string, Map<string, Array<{ mcid: string; uuid: string }>>>();

    allSettings.forEach((setting) => {
      const userInfo = { mcid: setting.user.mcid, uuid: setting.user.uuid };

      Object.entries(setting.keybindings).forEach(([action, assignedKey]) => {
        const keys = Array.isArray(assignedKey) ? assignedKey : [assignedKey];
        keys.forEach((key) => {
          if (!map.has(key)) {
            map.set(key, new Map());
          }
          const actionMap = map.get(key)!;
          if (!actionMap.has(action)) {
            actionMap.set(action, []);
          }
          actionMap.get(action)!.push(userInfo);
        });
      });
    });

    return map;
  }, [allSettings]);

  const handleKeySelect = useCallback((key: string) => {
    const actionUsersMap = keyToActionsMap.get(key) || new Map();

    // Convert to pie chart format with users
    const chartData = Array.from(actionUsersMap.entries()).map(([action, users], index) => ({
      label: ACTION_LABELS[action] || action,
      value: users.length,
      percentage: 0,
      color: COLORS[index % COLORS.length],
      users: users,
    }));

    // Calculate percentages
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });

    setModalData({
      title: `${formatKeyName(key)} の割り当て操作`,
      data: chartData,
      totalLabel: 'このキーを使用しているユーザー',
    });
    setModalOpen(true);
  }, [keyToActionsMap]);

  return (
    <>
      <div className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">キーを選択してください</h2>
        <VirtualKeyboard
          bindings={{}}
          mode="display"
          onKeyClick={handleKeySelect}
          stats
        />
      </div>

      {modalData && (
        <PieChartModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalData.title}
          data={modalData.data}
          totalLabel={modalData.totalLabel}
        />
      )}
    </>
  );
}
