'use client';

import { useState } from 'react';
import { MinecraftAvatar } from './MinecraftAvatar';
import { ShareButton } from './ShareButton';
import { KeybindingDisplay } from './KeybindingDisplay';
import { ItemLayoutsDisplay } from './ItemLayoutsDisplay';
import { SearchCraftDisplay } from './SearchCraftDisplay';

interface PlayerPageContentProps {
  user: {
    uuid: string;
    mcid: string;
    displayName: string | null;
    isGuest: boolean;
  };
  settings: any;
  rawKeybindings: any[];
  rawCustomKeys: any[];
  rawKeyRemaps: any[];
  rawExternalTools: any[];
  itemLayouts: any[];
  searchCrafts: any[];
}

type TabName = 'overview' | 'environment' | 'keyboard' | 'remappings' | 'externaltools' | 'items' | 'searchcraft';

export function PlayerPageContent({
  user,
  settings,
  rawKeybindings,
  rawCustomKeys,
  rawKeyRemaps,
  rawExternalTools,
  itemLayouts,
  searchCrafts,
}: PlayerPageContentProps) {
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const showDisplayName = user.displayName && user.displayName.trim() !== '';

  // コメントの存在チェック
  const hasNotes = settings?.notes && settings.notes.trim() !== '';

  // リマップ設定と外部ツールの存在チェック
  const hasRemappings = rawKeyRemaps && rawKeyRemaps.length > 0;
  const hasExternalTools = rawExternalTools && rawExternalTools.length > 0;
  const hasItemLayouts = itemLayouts && itemLayouts.length > 0;
  const hasSearchCrafts = searchCrafts && searchCrafts.length > 0;

  const tabs = [
    {
      name: 'overview' as TabName,
      label: 'Overview',
    },
    {
      name: 'environment' as TabName,
      label: '環境・設定',
    },
    {
      name: 'keyboard' as TabName,
      label: 'キー配置',
    },
    ...(hasRemappings ? [{
      name: 'remappings' as TabName,
      label: 'リマップ設定',
    }] : []),
    ...(hasExternalTools ? [{
      name: 'externaltools' as TabName,
      label: '外部ツール',
    }] : []),
    ...(hasItemLayouts ? [{
      name: 'items' as TabName,
      label: 'アイテム配置',
    }] : []),
    ...(hasSearchCrafts ? [{
      name: 'searchcraft' as TabName,
      label: 'サーチクラフト',
    }] : []),
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 pb-4">
      {/* プレイヤー情報カード */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm p-4 md:p-6 flex-shrink-0">
        <div className="flex items-start gap-4 md:gap-6">
          {/* アバター */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-30"></div>
            <MinecraftAvatar
              uuid={user.uuid}
              mcid={user.mcid}
              size={64}
              className="md:w-20 md:h-20"
              priority
            />
          </div>

          {/* 名前・MCID */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                {showDisplayName ? user.displayName : user.mcid}
              </h1>
              {user.isGuest && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold">
                  GUEST
                </span>
              )}
            </div>
            {showDisplayName && user.displayName !== user.mcid && (
              <p className="text-sm md:text-base text-muted-foreground mt-0.5">
                {user.mcid}
              </p>
            )}
          </div>

          {/* 共有ボタン */}
          <div className="flex-shrink-0">
            <ShareButton mcid={user.mcid} />
          </div>
        </div>

        {/* コメント（吹き出し風） - アバターの下まで表示 */}
        {hasNotes && (
          <div className="mt-4 relative">
            {/* 三角形：アバター方向を指す */}
            <div className="absolute -top-2 left-6 md:left-8 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-stone-200/80 dark:border-b-muted/50"></div>
            <div className="bg-stone-200/80 dark:bg-muted/50 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">
              {settings.notes}
            </div>
          </div>
        )}
      </div>

      {/* メインカード（タブ＋コンテンツ） */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* タブナビゲーション */}
        {settings && (
          <div className="border-b border-border flex-shrink-0">
            <div className="overflow-x-auto">
              <div className="flex gap-1 p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.name
                        ? 'bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* コンテンツエリア（スクロール可能） */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {settings ? (
            <>
              {activeTab === 'overview' && (
                <KeybindingDisplay
                  settings={settings as any}
                  keybindings={rawKeybindings}
                  customKeys={rawCustomKeys}
                  keyRemaps={rawKeyRemaps}
                  externalTools={rawExternalTools}
                  section="overview"
                />
              )}
              {activeTab === 'environment' && (
                <KeybindingDisplay
                  settings={settings as any}
                  keybindings={rawKeybindings}
                  customKeys={rawCustomKeys}
                  keyRemaps={rawKeyRemaps}
                  externalTools={rawExternalTools}
                  section="environment"
                />
              )}
              {activeTab === 'keyboard' && (
                <KeybindingDisplay
                  settings={settings as any}
                  keybindings={rawKeybindings}
                  customKeys={rawCustomKeys}
                  keyRemaps={rawKeyRemaps}
                  externalTools={rawExternalTools}
                  section="keyboard"
                />
              )}
              {activeTab === 'remappings' && (
                <KeybindingDisplay
                  settings={settings as any}
                  keybindings={rawKeybindings}
                  customKeys={rawCustomKeys}
                  keyRemaps={rawKeyRemaps}
                  externalTools={rawExternalTools}
                  section="remappings"
                />
              )}
              {activeTab === 'externaltools' && (
                <KeybindingDisplay
                  settings={settings as any}
                  keybindings={rawKeybindings}
                  customKeys={rawCustomKeys}
                  keyRemaps={rawKeyRemaps}
                  externalTools={rawExternalTools}
                  section="externaltools"
                />
              )}
              {activeTab === 'items' && (
                <ItemLayoutsDisplay
                  itemLayouts={itemLayouts}
                  keybinds={{
                    hotbar1: (settings as any).hotbar1,
                    hotbar2: (settings as any).hotbar2,
                    hotbar3: (settings as any).hotbar3,
                    hotbar4: (settings as any).hotbar4,
                    hotbar5: (settings as any).hotbar5,
                    hotbar6: (settings as any).hotbar6,
                    hotbar7: (settings as any).hotbar7,
                    hotbar8: (settings as any).hotbar8,
                    hotbar9: (settings as any).hotbar9,
                    swapHands: (settings as any).swapHands,
                  }}
                  customKeys={rawCustomKeys}
                />
              )}
              {activeTab === 'searchcraft' && (
                <SearchCraftDisplay
                  searchCrafts={searchCrafts}
                  keyRemaps={rawKeyRemaps}
                  fingerAssignments={(settings.fingerAssignments as any) || {}}
                />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-foreground mb-1">設定が登録されていません</p>
              <p className="text-sm text-muted-foreground">
                このプレイヤーはまだキーボード・マウス設定を登録していません
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
