'use client';

import { ReactNode } from 'react';

export interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Padding size: 'sm' = p-3, 'md' = p-4 (default) */
  padding?: 'sm' | 'md';
}

/**
 * メインコンテンツ内のセクションカードコンポーネント
 * 統一されたスタイルで背景・枠線・タイトルを表示
 */
export function SectionCard({
  title,
  description,
  children,
  className = '',
  padding = 'md',
}: SectionCardProps) {
  const paddingClass = padding === 'sm' ? 'p-3' : 'p-4';

  return (
    <div
      className={`bg-stone-200/80 dark:bg-muted/50 ${paddingClass} rounded-xl border border-border ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-3 text-foreground">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      )}
      {children}
    </div>
  );
}
