'use client';

import { useState } from 'react';
import { PieChartModal } from './PieChartModal';

interface MouseStatsDisplayProps {
  stats: {
    dpi: Array<{ label: string; value: number; users: Array<{ mcid: string; uuid: string }> }>;
    sensitivity: Array<{ label: string; value: number; users: Array<{ mcid: string; uuid: string }> }>;
    cm180: Array<{ label: string; value: number; users: Array<{ mcid: string; uuid: string }> }>;
    cm180Log: Array<{ label: string; value: number; users: Array<{ mcid: string; uuid: string }> }>;
    cursorSpeed: Array<{ label: string; value: number; users: Array<{ mcid: string; uuid: string }> }>;
  };
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

export function MouseStatsDisplay({ stats }: MouseStatsDisplayProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [cm180LogScale, setCm180LogScale] = useState(false);

  // Transform data for pie charts (already ordered from server)
  const transformData = (data: Array<{ label: string; value: number; users: Array<{ mcid: string; uuid: string }> }>) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map((item, index) => ({
      label: item.label,
      value: item.value,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
      color: COLORS[index % COLORS.length],
      users: item.users,
    }));
  };

  const handleCategoryClick = (title: string, data: Array<{ label: string; value: number; users: Array<{ mcid: string; uuid: string }> }>, totalLabel: string, isCm180: boolean = false) => {
    const chartData = transformData(data);
    setModalData({ title, data: chartData, totalLabel, isCm180 });
    setModalOpen(true);
  };

  const handleLogScaleToggle = (enabled: boolean) => {
    setCm180LogScale(enabled);
    if (modalData?.isCm180) {
      const newData = enabled ? stats.cm180Log : stats.cm180;
      const chartData = transformData(newData);
      setModalData({ ...modalData, data: chartData });
    }
  };

  const categories = [
    { title: 'DPI 分布', data: stats.dpi, totalLabel: 'データ数', key: 'dpi', isCm180: false },
    { title: 'ゲーム内感度 分布', data: stats.sensitivity, totalLabel: 'データ数', key: 'sensitivity', isCm180: false },
    { title: '振り向き (cm/180°) 分布', data: cm180LogScale ? stats.cm180Log : stats.cm180, totalLabel: 'データ数', key: 'cm180', isCm180: true },
    { title: 'カーソル速度 分布', data: stats.cursorSpeed, totalLabel: 'データ数', key: 'cursorSpeed', isCm180: false },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category.title, category.data, category.totalLabel, category.isCm180)}
            className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))] hover:border-blue-500 transition-colors text-left group"
          >
            <h2 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">
              {category.title}
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              クリックして詳細を表示
            </p>
          </button>
        ))}
      </div>

      {modalData && (
        <PieChartModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalData.title}
          data={modalData.data}
          totalLabel={modalData.totalLabel}
          showLogScaleToggle={modalData.isCm180}
          isLogScale={cm180LogScale}
          onLogScaleToggle={handleLogScaleToggle}
        />
      )}
    </>
  );
}
