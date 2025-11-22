'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, Fragment, useRef } from 'react';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, Transition } from '@headlessui/react';
import { HotbarRow } from './HotbarSlot';
import { getSegmentList, SPEEDRUN_SEGMENTS } from '@/lib/segments';
import { ItemSelectorModal } from './ItemSelectorModal';
import { Button, Textarea } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlusIcon, TrashIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import type { ItemLayout } from '@/types/itemLayout';

interface ItemLayoutEditorProps {
  uuid: string;
  onSave?: () => void;
  hideSaveButton?: boolean;
}

export interface ItemLayoutEditorRef {
  save: () => Promise<boolean>;
}

type SlotName = 'slot1' | 'slot2' | 'slot3' | 'slot4' | 'slot5' | 'slot6' | 'slot7' | 'slot8' | 'slot9' | 'offhand';

interface SegmentData {
  name: string;
  originalName: string | null; // DBから読み込んだ時の元の名前（リネーム検出用）
  layout: Partial<ItemLayout>;
  isNew: boolean; // DBに存在するかどうか
}

const EMPTY_LAYOUT = {
  slot1: [], slot2: [], slot3: [], slot4: [], slot5: [],
  slot6: [], slot7: [], slot8: [], slot9: [], offhand: [], notes: '',
};

/**
 * アイテム配置エディタコンポーネント
 */
export const ItemLayoutEditor = forwardRef<ItemLayoutEditorRef, ItemLayoutEditorProps>(
  function ItemLayoutEditor({ uuid, onSave, hideSaveButton = false }, ref) {
    const presetSegments = getSegmentList();
    const [segments, setSegments] = useState<SegmentData[]>([]);
    const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<SlotName | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [segmentQuery, setSegmentQuery] = useState('');

    // 削除予定のセグメント名（保存時にまとめて削除）
    const segmentsToDeleteRef = useRef<Set<string>>(new Set());

    // 現在選択中のセグメント
    const currentSegment = segments[selectedSegmentIndex];
    const currentLayout = currentSegment?.layout || EMPTY_LAYOUT;

    // プリセットセグメントの候補リスト
    const segmentOptions = presetSegments.map(seg => ({
      value: seg.id,
      label: seg.label,
      description: seg.description,
    }));

    // フィルタリングされたセグメントオプション
    const filteredSegmentOptions = segmentQuery === ''
      ? segmentOptions
      : segmentOptions.filter(opt =>
          opt.label.toLowerCase().includes(segmentQuery.toLowerCase()) ||
          opt.value.toLowerCase().includes(segmentQuery.toLowerCase())
        );

    // 既存のレイアウトを読み込み
    useEffect(() => {
      async function fetchLayouts() {
        setLoading(true);
        try {
          const response = await fetch(`/api/item-layouts?uuid=${uuid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const loadedSegments: SegmentData[] = data.map((layout: ItemLayout) => ({
                name: layout.segment,
                originalName: layout.segment,
                layout,
                isNew: false,
              }));
              setSegments(loadedSegments);
            } else {
              setSegments([]);
            }
          }
        } catch (error) {
          console.error('Failed to fetch layouts:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchLayouts();
    }, [uuid]);

    // スロットをクリック → モーダルを開く
    const handleSlotClick = (slotName: SlotName) => {
      setSelectedSlot(slotName);
      setIsModalOpen(true);
    };

    // スロットにアイテムを追加（モーダルは開いたまま）
    const addItemToSlot = (slotName: SlotName, itemId: string) => {
      const currentItems = (currentLayout[slotName] as string[]) || [];
      if (!currentItems.includes(itemId)) {
        updateCurrentLayout(slotName, [...currentItems, itemId]);
      }
    };

    // スロットからアイテムを削除
    const removeItemFromSlot = (slotName: SlotName, itemId: string) => {
      const currentItems = (currentLayout[slotName] as string[]) || [];
      updateCurrentLayout(slotName, currentItems.filter((id) => id !== itemId));
    };

    // 現在のセグメントのレイアウトを更新
    const updateCurrentLayout = (key: string, value: string[] | string) => {
      setSegments(prev => prev.map((seg, idx) =>
        idx === selectedSegmentIndex
          ? { ...seg, layout: { ...seg.layout, [key]: value } }
          : seg
      ));
    };

    // セグメント名を変更
    const updateSegmentName = (newName: string) => {
      setSegments(prev => prev.map((seg, idx) =>
        idx === selectedSegmentIndex ? { ...seg, name: newName } : seg
      ));
    };

    // 新しいセグメントを追加
    const addNewSegment = () => {
      const usedNames = new Set(segments.map(s => s.name));
      const availablePreset = presetSegments.find(p => !usedNames.has(p.id));
      const newName = availablePreset?.id || `カスタム${segments.length + 1}`;

      const newSegment: SegmentData = {
        name: newName,
        originalName: null,
        layout: { ...EMPTY_LAYOUT },
        isNew: true,
      };

      setSegments(prev => [...prev, newSegment]);
      setSelectedSegmentIndex(segments.length);
    };

    // セグメントを削除（ローカルのみ、保存時にDB削除）
    const deleteSegment = (index: number) => {
      const segment = segments[index];
      if (!segment) return;

      // DBに存在するセグメントは削除予定リストに追加
      if (!segment.isNew) {
        segmentsToDeleteRef.current.add(segment.name);
      }

      const newSegments = segments.filter((_, idx) => idx !== index);
      setSegments(newSegments);

      // 選択インデックスを調整
      if (newSegments.length === 0) {
        setSelectedSegmentIndex(0);
      } else if (selectedSegmentIndex >= newSegments.length) {
        setSelectedSegmentIndex(newSegments.length - 1);
      } else if (selectedSegmentIndex > index) {
        setSelectedSegmentIndex(selectedSegmentIndex - 1);
      }
    };

    // 保存
    const handleSave = async (): Promise<boolean> => {
      setSaving(true);
      try {
        // 削除予定のセグメントをDBから削除
        for (const segmentName of segmentsToDeleteRef.current) {
          try {
            await fetch(`/api/item-layouts?uuid=${uuid}&segment=${encodeURIComponent(segmentName)}`, {
              method: 'DELETE',
            });
          } catch (error) {
            console.error('Failed to delete segment:', segmentName, error);
          }
        }
        segmentsToDeleteRef.current.clear();

        // リネームされたセグメントの元の名前を削除
        for (const segment of segments) {
          if (segment.originalName && segment.originalName !== segment.name) {
            try {
              await fetch(`/api/item-layouts?uuid=${uuid}&segment=${encodeURIComponent(segment.originalName)}`, {
                method: 'DELETE',
              });
            } catch (error) {
              console.error('Failed to delete renamed segment:', segment.originalName, error);
            }
          }
        }

        // 全セグメントを保存
        for (const segment of segments) {
          const response = await fetch('/api/item-layouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uuid,
              segment: segment.name,
              ...segment.layout,
            }),
          });
          if (!response.ok) {
            return false;
          }
        }

        // 保存後は全てのセグメントをisNew: false、originalNameを現在の名前に更新
        setSegments(prev => prev.map(seg => ({ ...seg, isNew: false, originalName: seg.name })));

        onSave?.();
        return true;
      } catch (error) {
        console.error('Failed to save:', error);
        return false;
      } finally {
        setSaving(false);
      }
    };

    useImperativeHandle(ref, () => ({
      save: handleSave,
    }));

    // スロットデータを生成
    const getSlots = () => [
      { items: (currentLayout.slot1 as string[]) || [], num: 1 },
      { items: (currentLayout.slot2 as string[]) || [], num: 2 },
      { items: (currentLayout.slot3 as string[]) || [], num: 3 },
      { items: (currentLayout.slot4 as string[]) || [], num: 4 },
      { items: (currentLayout.slot5 as string[]) || [], num: 5 },
      { items: (currentLayout.slot6 as string[]) || [], num: 6 },
      { items: (currentLayout.slot7 as string[]) || [], num: 7 },
      { items: (currentLayout.slot8 as string[]) || [], num: 8 },
      { items: (currentLayout.slot9 as string[]) || [], num: 9 },
    ];

    // セグメント名の表示用ラベルを取得
    const getSegmentDisplayName = (name: string) => {
      const preset = SPEEDRUN_SEGMENTS[name as keyof typeof SPEEDRUN_SEGMENTS];
      return preset?.label || name;
    };

    // ローディング中
    if (loading) {
      return <div className="text-center py-8"><LoadingSpinner /></div>;
    }

    // セグメントが0件の場合
    if (segments.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12 border-2 border-dashed border-[rgb(var(--border))] rounded-lg">
            <p className="text-[rgb(var(--muted-foreground))] mb-4">アイテム配置が設定されていません</p>
            <Button onClick={addNewSegment} className="flex items-center gap-2 mx-auto">
              <PlusIcon className="w-5 h-5" />
              セグメントを追加
            </Button>
          </div>
          {!hideSaveButton && (
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving && <LoadingSpinner size="sm" variant="light" />}
              {saving ? '保存中...' : '保存'}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* セグメントタブ */}
        <div className="flex flex-wrap items-center gap-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => setSelectedSegmentIndex(index)}
                className={`px-4 py-2 rounded-l-lg border transition-colors ${
                  selectedSegmentIndex === index
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-[rgb(var(--muted))] border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                }`}
              >
                {getSegmentDisplayName(segment.name)}
              </button>
              <button
                onClick={() => deleteSegment(index)}
                className={`px-2 py-2 rounded-r-lg border-t border-r border-b transition-colors ${
                  selectedSegmentIndex === index
                    ? 'bg-primary/80 text-primary-foreground border-primary hover:bg-red-600 hover:border-red-600'
                    : 'bg-[rgb(var(--muted))] border-[rgb(var(--border))] hover:bg-red-600 hover:text-white hover:border-red-600'
                }`}
                title="セグメントを削除"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addNewSegment}
            className="px-3 py-2 rounded-lg border-2 border-dashed border-[rgb(var(--border))] hover:border-primary hover:bg-primary/10 transition-colors flex items-center gap-1 text-[rgb(var(--muted-foreground))] hover:text-primary"
            title="セグメントを追加"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm">追加</span>
          </button>
        </div>

        {/* セグメント名の編集 */}
        <div>
          <label className="block text-sm font-medium mb-2">セグメント名</label>
          <Combobox value={currentSegment?.name || ''} onChange={(value) => value && updateSegmentName(value)}>
            <div className="relative">
              <ComboboxInput
                className="w-full px-3 py-2 border rounded-md bg-[rgb(var(--input))] border-[rgb(var(--border))] text-[rgb(var(--foreground))] pr-10"
                onChange={(e) => {
                  setSegmentQuery(e.target.value);
                  updateSegmentName(e.target.value);
                }}
                displayValue={(name: string) => getSegmentDisplayName(name)}
                placeholder="セグメント名を入力または選択..."
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </ComboboxButton>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setSegmentQuery('')}
              >
                <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 py-1 shadow-lg focus:outline-none">
                  {filteredSegmentOptions.map((option) => (
                    <ComboboxOption
                      key={option.value}
                      value={option.value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 px-4 ${
                          active ? 'bg-primary/10 text-primary' : 'text-neutral-900 dark:text-neutral-100'
                        }`
                      }
                    >
                      <div>
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <span className="ml-2 text-sm opacity-70">({option.description})</span>
                        )}
                      </div>
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Transition>
            </div>
          </Combobox>
        </div>

        {/* ホットバー + オフハンド */}
        <div>
          <h3 className="font-medium mb-3">ホットバー + オフハンド</h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">スロットをクリックしてアイテムを追加</p>
          <HotbarRow
            slots={getSlots()}
            offhand={(currentLayout.offhand as string[]) || []}
            editable
            onSlotClick={(slotName) => handleSlotClick(slotName as SlotName)}
          />
        </div>

        {/* メモ欄 */}
        <Textarea
          label="メモ"
          value={(currentLayout.notes as string) || ''}
          onChange={(e) => updateCurrentLayout('notes', e.target.value)}
          rows={3}
          placeholder="このセグメントについてのメモ..."
        />

        {/* 保存ボタン */}
        {!hideSaveButton && (
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving && <LoadingSpinner size="sm" />}
            {saving ? '保存中...' : '保存'}
          </Button>
        )}

        {/* アイテム選択モーダル */}
        <ItemSelectorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={(itemId) => selectedSlot && addItemToSlot(selectedSlot, itemId)}
          onRemove={(itemId) => selectedSlot && removeItemFromSlot(selectedSlot, itemId)}
          selectedSlot={selectedSlot || 'slot1'}
          currentItems={selectedSlot ? (currentLayout[selectedSlot] as string[]) || [] : []}
        />
      </div>
    );
  }
);
