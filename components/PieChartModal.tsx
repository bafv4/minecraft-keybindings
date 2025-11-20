'use client';

import { useState, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Switch } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserListModal } from './UserListModal';

interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
  users?: Array<{ mcid: string; uuid: string }>;
}

interface PieChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: PieChartData[];
  totalLabel: string;
  showLogScaleToggle?: boolean;
  isLogScale?: boolean;
  onLogScaleToggle?: (enabled: boolean) => void;
}

export function PieChartModal({
  isOpen,
  onClose,
  title,
  data,
  totalLabel,
  showLogScaleToggle = false,
  isLogScale = false,
  onLogScaleToggle
}: PieChartModalProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [userListOpen, setUserListOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Array<{ mcid: string; uuid: string }>>([]);
  const [userListTitle, setUserListTitle] = useState('');

  // データの順序を保持（渡された順序を尊重）
  // トップ10と残りを分ける
  const top10 = data.slice(0, 10);
  const others = data.slice(10);
  const displayData = others.length > 0
    ? [
        ...top10,
        {
          label: 'その他',
          value: others.reduce((sum, item) => sum + item.value, 0),
          percentage: others.reduce((sum, item) => sum + item.percentage, 0),
          color: '#D3D3D3', // pastel gray
          users: others.flatMap(item => item.users || []),
        },
      ]
    : top10;

  const handleLegendClick = (item: typeof displayData[0]) => {
    if (item.users && item.users.length > 0) {
      setSelectedUsers(item.users);
      setUserListTitle(`${item.label}`);
      setUserListOpen(true);
    }
  };

  const totalCount = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate SVG paths for pie chart
  // If only one item with 100%, show a full circle
  const isSingleItem = displayData.length === 1 && displayData[0].percentage === 100;

  let currentAngle = -90; // Start from top
  const paths = displayData.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // For 100% single item, use a circle instead of a path
    if (isSingleItem) {
      return { pathData: undefined, item, isCircle: true };
    }

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`,
    ].join(' ');

    return { pathData, item, isCircle: false };
  });

  return (
    <>
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={onClose} className="relative z-50">
          {/* Backdrop */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </TransitionChild>

          {/* Full-screen container to center the panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="glass-card rounded-lg border border-[rgb(var(--border))]/80 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-[rgb(var(--border))] flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        {totalLabel}: {totalCount}人
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Log Scale Toggle */}
                  {showLogScaleToggle && onLogScaleToggle && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-sm text-[rgb(var(--muted-foreground))]">対数スケール</span>
                      <Switch
                        checked={isLogScale}
                        onChange={onLogScaleToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isLogScale ? 'bg-blue-500' : 'bg-[rgb(var(--muted))]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isLogScale ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </Switch>
                    </div>
                  )}
                </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {data.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Pie Chart */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <svg width="320" height="320" viewBox="0 0 100 100" className="drop-shadow-lg">
                    {paths.map(({ pathData, item, isCircle }, index) => (
                      isCircle ? (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill={item.color}
                          stroke="rgb(var(--background))"
                          strokeWidth="0.5"
                          className="transition-opacity cursor-pointer"
                          opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.3}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      ) : (
                        <path
                          key={index}
                          d={pathData}
                          fill={item.color}
                          stroke="rgb(var(--background))"
                          strokeWidth="0.5"
                          className="transition-opacity cursor-pointer"
                          opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.3}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      )
                    ))}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                  {displayData.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded transition-colors ${
                        item.users && item.users.length > 0
                          ? 'cursor-pointer hover:bg-[rgb(var(--muted))] border border-transparent hover:border-blue-500'
                          : 'cursor-default border border-transparent'
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => handleLegendClick(item)}
                    >
                      <div
                        className="w-6 h-6 rounded flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                      </div>
                      <div className="text-sm text-[rgb(var(--muted-foreground))] flex-shrink-0 text-right">
                        <div>{item.value}人</div>
                        <div className="text-xs">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
                データがありません
              </div>
            )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      <UserListModal
        isOpen={userListOpen}
        onClose={() => setUserListOpen(false)}
        title={userListTitle}
        users={selectedUsers}
      />
    </>
  );
}
