/**
 * 汎用リストコンポーネント
 * プレイヤーリスト、統計リストなど、さまざまな一覧表示に使用できる
 */
'use client';

import { useState, useMemo, ReactNode } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getItemKey: (item: T) => string;
  title?: string;
  description?: string | ((count: number) => string);
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  sort?: (a: T, b: T) => number;
  header?: ReactNode;
  emptyState?: ReactNode;
  actions?: ReactNode;
  className?: string;
  variant?: 'table' | 'cards' | 'compact';
}

export function List<T>({
  items,
  renderItem,
  getItemKey,
  title,
  description,
  searchable = false,
  searchPlaceholder = '検索...',
  searchFilter,
  sort,
  header,
  emptyState,
  actions,
  className = '',
  variant = 'table',
}: ListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  // ソート
  const sortedItems = useMemo(() => {
    if (!sort) return items;
    return [...items].sort(sort);
  }, [items, sort]);

  // 検索フィルター
  const filteredItems = useMemo(() => {
    if (!searchable || !searchQuery.trim() || !searchFilter) return sortedItems;
    return sortedItems.filter((item) => searchFilter(item, searchQuery.toLowerCase()));
  }, [sortedItems, searchQuery, searchable, searchFilter]);

  const count = filteredItems.length;
  const descriptionText =
    typeof description === 'function' ? description(count) : description;

  return (
    <div className={`flex flex-col h-full min-h-0 space-y-6 ${className}`}>
      {/* ヘッダーセクション */}
      <div className="flex flex-col gap-6 flex-shrink-0">
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {title && (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-light via-secondary to-slate-500 dark:to-slate-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                {descriptionText && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {descriptionText}
                  </p>
                )}
              </div>
            )}

            {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
          </div>
        )}

        {/* 検索ボックス */}
        {searchable && searchFilter && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 md:py-3.5 text-sm md:text-base border-2 border-border rounded-xl bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        )}
      </div>

      {/* リスト */}
      {filteredItems.length === 0 ? (
        emptyState || (
          <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-2xl border border-border shadow-sm p-8 md:p-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-base md:text-lg font-medium text-foreground mb-1">
              {searchQuery ? '検索結果が見つかりませんでした' : 'データがありません'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? '別のキーワードで検索してみてください' : ''}
            </p>
          </div>
        )
      ) : (
        <div
          className={`flex-1 ${
            variant === 'cards'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto'
              : 'bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-0'
          }`}
        >
          {variant !== 'cards' && header && (
            <div className="sticky top-0 z-10 backdrop-blur-sm">{header}</div>
          )}

          <div
            className={
              variant === 'cards'
                ? 'contents'
                : 'flex-1 overflow-y-auto'
            }
          >
            {filteredItems.map((item) => (
              <div key={getItemKey(item)}>{renderItem(item)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * リストアイテムのラッパー（テーブル/コンパクトモード用）
 */
export function ListItem({
  children,
  href,
  onClick,
  className = '',
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const Component = href ? 'a' : 'div';
  const props = href ? { href } : onClick ? { onClick, role: 'button', tabIndex: 0 } : {};

  return (
    <Component
      {...props}
      className={`block border-b border-border hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:border-primary/20 active:from-primary/10 active:to-secondary/10 transition-all duration-200 last:border-b-0 group cursor-pointer ${className}`}
    >
      {children}
    </Component>
  );
}

/**
 * カード型リストアイテム
 */
export function CardItem({
  children,
  href,
  onClick,
  className = '',
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const Component = href ? 'a' : 'div';
  const props = href ? { href } : onClick ? { onClick, role: 'button', tabIndex: 0 } : {};

  return (
    <Component
      {...props}
      className={`block bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all duration-200 p-4 group cursor-pointer ${className}`}
    >
      {children}
    </Component>
  );
}
