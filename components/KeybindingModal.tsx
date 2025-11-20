'use client';

import React, { useState, useEffect, Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Finger } from '@/types/player';
import {
  ActionTabContent,
  FingerTabContent,
  RemapTabContent,
  ExternalToolTabContent,
  CustomKeyTabContent
} from './KeybindingModal/TabContents';
import { formatKeyLabel } from './KeybindingModal/utils';

interface KeybindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: string;
  currentAction: string | string[] | null;
  onSave: (config: {
    actions?: string[];
    remap?: string;
    externalTool?: string;
    finger?: Finger[];
  }) => void;
  currentRemap?: string;
  currentExternalTool?: string;
  currentFinger?: Finger[];
  isCustomKey?: boolean;
  customKeyLabel?: string;
  onUpdateCustomKey?: (label: string) => void;
  onDeleteCustomKey?: () => void;
}

type TabType = 'action' | 'finger' | 'remap' | 'external' | 'custom';

const TAB_LABELS: Record<TabType, string> = {
  action: '操作割り当て',
  finger: '指の割り当て',
  remap: 'リマップ',
  external: '外部ツール・Mod',
  custom: 'カスタムキー'
};

export function KeybindingModal({
  isOpen,
  onClose,
  selectedKey,
  currentAction,
  onSave,
  currentRemap,
  currentExternalTool,
  currentFinger,
  isCustomKey = false,
  customKeyLabel = '',
  onUpdateCustomKey,
  onDeleteCustomKey,
}: KeybindingModalProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>(() => {
    if (!currentAction) return [];
    return Array.isArray(currentAction) ? currentAction : [currentAction];
  });
  const [remapInput, setRemapInput] = useState<string>(currentRemap || '');
  const [externalToolAction, setExternalToolAction] = useState<string>(currentExternalTool || '');
  const [selectedFingers, setSelectedFingers] = useState<Finger[]>(currentFinger || []);
  const [editedLabel, setEditedLabel] = useState(customKeyLabel);

  // タブ構成
  const tabs: TabType[] = ['action', 'finger', 'remap', 'external'];
  if (isCustomKey) tabs.push('custom');

  // モーダルが開くたびに状態をリセット
  useEffect(() => {
    if (isOpen) {
      setSelectedActions(() => {
        if (!currentAction) return [];
        return Array.isArray(currentAction) ? currentAction : [currentAction];
      });
      setRemapInput(currentRemap || '');
      setExternalToolAction(currentExternalTool || '');
      setSelectedFingers(currentFinger || []);
      setEditedLabel(customKeyLabel);
    }
  }, [isOpen, currentAction, currentRemap, currentExternalTool, currentFinger, customKeyLabel]);

  const handleSave = () => {
    // カスタムキーのラベル更新
    if (isCustomKey && onUpdateCustomKey && editedLabel !== customKeyLabel) {
      onUpdateCustomKey(editedLabel);
    }

    const config = {
      actions: selectedActions.length > 0 ? selectedActions : undefined,
      remap: remapInput.trim() || undefined,
      externalTool: externalToolAction.trim() || undefined,
      finger: selectedFingers.length > 0 ? selectedFingers : undefined,
    };

    console.log('KeybindingModal saving:', { selectedKey, config });
    onSave(config);
    onClose();
  };

  const clearCurrentTab = (activeTab: number) => {
    const tab = tabs[activeTab];
    switch (tab) {
      case 'action':
        setSelectedActions([]);
        break;
      case 'finger':
        setSelectedFingers([]);
        break;
      case 'remap':
        setRemapInput('');
        break;
      case 'external':
        setExternalToolAction('');
        break;
    }
  };

  const hasClearableContent = (activeTab: number): boolean => {
    const tab = tabs[activeTab];
    switch (tab) {
      case 'action':
        return selectedActions.length > 0;
      case 'finger':
        return selectedFingers.length > 0;
      case 'remap':
        return remapInput.trim() !== '';
      case 'external':
        return externalToolAction.trim() !== '';
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

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
            <DialogPanel className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent border border-border rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* ヘッダー */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <DialogTitle className="text-xl font-semibold">
                  キー設定: {formatKeyLabel(selectedKey)}
                </DialogTitle>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* タブとコンテンツ */}
              <TabGroup>
                {({ selectedIndex }) => (
                  <>
                    <TabList className="flex border-b border-border flex-shrink-0">
                      {tabs.map((tab) => (
                        <Tab
                          key={tab}
                          className={({ selected }) =>
                            `flex-1 px-4 py-3 font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                              selected
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`
                          }
                        >
                          {TAB_LABELS[tab]}
                        </Tab>
                      ))}
                    </TabList>

                    <TabPanels className="overflow-y-auto flex-1 px-6 py-4">
                      <TabPanel className="focus:outline-none">
                        <ActionTabContent
                          selectedActions={selectedActions}
                          onToggleAction={(actionId) => {
                            setSelectedActions(prev =>
                              prev.includes(actionId)
                                ? prev.filter(id => id !== actionId)
                                : [...prev, actionId]
                            );
                          }}
                        />
                      </TabPanel>

                      <TabPanel className="focus:outline-none">
                        <FingerTabContent
                          selectedFingers={selectedFingers}
                          onToggleFinger={(finger) => {
                            setSelectedFingers(prev =>
                              prev.includes(finger)
                                ? prev.filter(f => f !== finger)
                                : [...prev, finger]
                            );
                          }}
                        />
                      </TabPanel>

                      <TabPanel className="focus:outline-none">
                        <RemapTabContent
                          selectedKey={selectedKey}
                          remapInput={remapInput}
                          onRemapChange={setRemapInput}
                        />
                      </TabPanel>

                      <TabPanel className="focus:outline-none">
                        <ExternalToolTabContent
                          externalToolAction={externalToolAction}
                          onExternalToolChange={setExternalToolAction}
                        />
                      </TabPanel>

                      {isCustomKey && (
                        <TabPanel className="focus:outline-none">
                          <CustomKeyTabContent
                            editedLabel={editedLabel}
                            onLabelChange={setEditedLabel}
                            onDeleteCustomKey={onDeleteCustomKey}
                          />
                        </TabPanel>
                      )}
                    </TabPanels>

                    {/* フッター */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0">
                      <div>
                        {hasClearableContent(selectedIndex) && (
                          <button
                            onClick={() => clearCurrentTab(selectedIndex)}
                            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            クリア
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={onClose}
                          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </TabGroup>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
