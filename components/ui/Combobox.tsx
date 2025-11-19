'use client';

import React, { useState, Fragment } from 'react';
import { Combobox as HeadlessCombobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface ComboboxOption {
  value: string;
  label: string;
  category?: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  label?: string;
  displayValue?: (value: string) => string;
  filterFunction?: (options: ComboboxOption[], query: string) => ComboboxOption[];
  allowCustomValue?: boolean;
  helpText?: string;
  className?: string;
}

/**
 * Headless UI Combobox - 検索可能なセレクトボックス
 *
 * @param value - 現在選択されている値
 * @param onChange - 値が変更されたときのコールバック
 * @param options - 選択肢の配列 { value, label, category? }
 * @param placeholder - プレースホルダーテキスト
 * @param label - ラベルテキスト
 * @param displayValue - 選択された値の表示方法をカスタマイズする関数
 * @param filterFunction - カスタムフィルタリング関数
 * @param allowCustomValue - カスタム値の入力を許可するか
 * @param helpText - ヘルプテキスト
 * @param className - 追加のクラス名
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = '選択してください',
  label,
  displayValue,
  filterFunction,
  allowCustomValue = false,
  helpText,
  className = '',
}: ComboboxProps) {
  const [query, setQuery] = useState('');

  // デフォルトの表示関数: valueからlabelを検索
  const defaultDisplayValue = (val: string) => {
    if (!val) return '';
    const option = options.find(opt => opt.value === val);
    return option ? option.label : val;
  };

  const getDisplayValue = displayValue || defaultDisplayValue;

  // デフォルトのフィルタリング関数
  const defaultFilterFunction = (opts: ComboboxOption[], q: string) => {
    if (!q.trim()) return opts;
    const lowerQuery = q.toLowerCase();
    return opts.filter(
      opt =>
        opt.label.toLowerCase().includes(lowerQuery) ||
        opt.value.toLowerCase().includes(lowerQuery)
    );
  };

  const filter = filterFunction || defaultFilterFunction;

  // フィルタリングされたオプション
  const filteredOptions = filter(options, query);

  // カテゴリごとにグループ化
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const category = option.category || '未分類';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {} as Record<string, ComboboxOption[]>);

  const hasCategories = Object.keys(groupedOptions).length > 1 ||
    (Object.keys(groupedOptions).length === 1 && !groupedOptions['未分類']);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <HeadlessCombobox
        value={value}
        onChange={(val) => {
          onChange(val || '');
          setQuery('');
        }}
      >
        <div className="relative">
          <div className="relative w-full">
            <ComboboxInput
              className="w-full px-4 py-2 pr-10 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              displayValue={(val: string) => getDisplayValue(val)}
              onChange={(event) => {
                setQuery(event.target.value);
                if (allowCustomValue) {
                  onChange(event.target.value);
                }
              }}
              placeholder={placeholder}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-[rgb(var(--muted-foreground))]"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-lg backdrop-blur-sm bg-[rgb(var(--card))]/95 focus:outline-none">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-[rgb(var(--muted-foreground))]">
                  {allowCustomValue ? 'Enterで追加' : '検索結果なし'}
                </div>
              ) : hasCategories ? (
                // カテゴリ別表示
                Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                  <div key={category}>
                    <div className="sticky top-0 bg-[rgb(var(--muted))] px-3 py-1 text-xs font-semibold text-[rgb(var(--muted-foreground))]">
                      {category}
                    </div>
                    {categoryOptions.map((option) => (
                      <ComboboxOption
                        key={option.value}
                        value={option.value}
                        className={({ focus, selected }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            focus ? 'bg-primary/10 text-primary' : 'text-[rgb(var(--foreground))]'
                          } ${selected ? 'font-semibold' : 'font-normal'}`
                        }
                      >
                        {({ selected, focus }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                              {option.label}
                            </span>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  focus ? 'text-primary' : 'text-primary'
                                }`}
                              >
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </ComboboxOption>
                    ))}
                  </div>
                ))
              ) : (
                // カテゴリなし表示
                filteredOptions.map((option) => (
                  <ComboboxOption
                    key={option.value}
                    value={option.value}
                    className={({ focus, selected }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        focus ? 'bg-primary/10 text-primary' : 'text-[rgb(var(--foreground))]'
                      } ${selected ? 'font-semibold' : 'font-normal'}`
                    }
                  >
                    {({ selected, focus }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                          {option.label}
                        </span>
                        {selected && (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              focus ? 'text-primary' : 'text-primary'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </HeadlessCombobox>
      {helpText && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
          {helpText}
        </p>
      )}
    </div>
  );
}
