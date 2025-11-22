'use client';

import React from 'react';
import { RadioGroup as HeadlessRadioGroup, RadioGroupOption, Label, Description } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  name?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Headless UI RadioGroup - ラジオボタングループ
 *
 * @param value - 現在選択されている値
 * @param onChange - 値が変更されたときのコールバック
 * @param options - 選択肢の配列 { value, label, description? }
 * @param label - グループラベル
 * @param name - フォームのname属性
 * @param className - 追加のクラス名
 * @param orientation - ボタンの配置方向（horizontal: 横並び, vertical: 縦並び）
 */
export function RadioGroup({
  value,
  onChange,
  options,
  label,
  name,
  className = '',
  orientation = 'horizontal',
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <HeadlessRadioGroup value={value} onChange={onChange} name={name}>
        <div className={`flex gap-2 ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}`}>
          {options.map((option) => (
            <RadioGroupOption
              key={option.value}
              value={option.value}
              className={({ checked }) =>
                `relative flex cursor-pointer rounded-lg px-4 py-2 border transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  checked
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] text-[rgb(var(--foreground))]'
                }`
              }
            >
              {({ checked }) => (
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1">
                    <Label className="block text-sm font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    {option.description && (
                      <Description className="text-xs text-[rgb(var(--muted-foreground))]">
                        {option.description}
                      </Description>
                    )}
                  </div>
                  {checked && (
                    <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              )}
            </RadioGroupOption>
          ))}
        </div>
      </HeadlessRadioGroup>
    </div>
  );
}
