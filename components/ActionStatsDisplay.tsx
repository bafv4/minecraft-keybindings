'use client';

import { useState } from 'react';
import { PieChartModal } from './PieChartModal';
import { ACTION_LABELS, formatKeyName } from '@/lib/utils';

interface ActionStatsDisplayProps {
  allSettings: Array<{
    user: { mcid: string; uuid: string };
    keybindings: Record<string, string>;
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

export function ActionStatsDisplay({ allSettings }: ActionStatsDisplayProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);

    // Calculate statistics for the selected action with user tracking (リマップやカスタムキーは無視)
    const keyUsersMap = new Map<string, Array<{ mcid: string; uuid: string }>>();

    allSettings.forEach((setting) => {
      const assignedKey = setting.keybindings[action];
      if (!assignedKey) return;

      // Skip custom keys (they start with 'custom.')
      if (assignedKey.startsWith('custom.')) {
        return;
      }

      // Track users for each key
      const userInfo = { mcid: setting.user.mcid, uuid: setting.user.uuid };
      const users = keyUsersMap.get(assignedKey) || [];
      users.push(userInfo);
      keyUsersMap.set(assignedKey, users);
    });

    // Convert to pie chart format with users
    const chartData = Array.from(keyUsersMap.entries()).map(([key, users], index) => ({
      label: formatKeyName(key),
      value: users.length,
      percentage: 0, // Will be calculated below
      color: COLORS[index % COLORS.length],
      users: users,
    }));

    // Calculate percentages
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });

    setModalData({
      title: `${ACTION_LABELS[action] || action} の割り当てキー`,
      data: chartData,
      totalLabel: 'この操作を設定しているユーザー',
    });
    setModalOpen(true);
  };

  // Group actions by category
  const actionCategories = {
    '移動': ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'sprint'],
    '操作': ['attack', 'use', 'pickBlock', 'swapHands', 'drop'],
    'UI': ['inventory', 'chat', 'command', 'toggleHud'],
    'ホットバー': ['hotbar1', 'hotbar2', 'hotbar3', 'hotbar4', 'hotbar5', 'hotbar6', 'hotbar7', 'hotbar8', 'hotbar9'],
    'その他': ['togglePerspective', 'fullscreen'],
  };

  return (
    <>
      <div className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">操作を選択してください</h2>

        {Object.entries(actionCategories).map(([category, actions]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">{category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {actions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleActionSelect(action)}
                  className={`p-3 rounded border text-left transition-all ${
                    selectedAction === action
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:border-primary'
                  }`}
                >
                  <div className="font-medium">{ACTION_LABELS[action]}</div>
                  <div className="text-xs opacity-70">{action}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
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
