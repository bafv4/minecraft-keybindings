'use client';

import { useState, useEffect } from 'react';
import { MinecraftAvatar } from './MinecraftAvatar';
import { ShareButton } from './ShareButton';
import { KeybindingDisplay } from './KeybindingDisplay';
import { ItemLayoutsDisplay } from './ItemLayoutsDisplay';
import { SearchCraftDisplay } from './SearchCraftDisplay';
import { getLanguageName } from '@/lib/languages';

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

type TabName = 'keybindings' | 'items' | 'searchcraft';

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
  const [showCompactHeader, setShowCompactHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('keybindings');
  const showDisplayName = user.displayName && user.displayName.trim() !== '';

  // 環境設定の存在チェック
  const hasPlayerConfig = settings && (
    settings.gameLanguage ||
    settings.mouseModel ||
    settings.keyboardModel ||
    settings.notes
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowCompactHeader(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    {
      name: 'keybindings' as TabName,
      label: 'キーボード・マウス設定',
    },
    {
      name: 'items' as TabName,
      label: 'アイテム配置',
    },
    {
      name: 'searchcraft' as TabName,
      label: 'サーチクラフト設定',
    },
  ];

  return (
    <div className="pb-6">
      {/* コンパクトヘッダー（スクロール時のみ表示） */}
      <div
        className={`fixed top-[3.5rem] md:top-20 left-0 right-0 z-40 transition-all duration-300 ${
          showCompactHeader ? 'translate-y-0 opacity-100' : '-translate-y-[calc(100%+1rem)] opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
            {/* コンパクトプレイヤー情報 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <MinecraftAvatar
                uuid={user.uuid}
                mcid={user.mcid}
                size={40}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">
                  {showDisplayName ? user.displayName : user.mcid}
                </h2>
                {showDisplayName && user.displayName !== user.mcid && (
                  <p className="text-xs text-muted-foreground truncate">{user.mcid}</p>
                )}
              </div>
              <ShareButton mcid={user.mcid} />
            </div>

            {/* コンパクトタブ */}
            {settings && (
              <div className="flex gap-1 p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                      activeTab === tab.name
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メインカード */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* プレイヤー情報ヘッダー */}
        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent border-b border-border py-6 px-6">
          <div className="relative">
            {/* 共有ボタン */}
            <div className="absolute top-0 right-0">
              <ShareButton mcid={user.mcid} />
            </div>

            {/* プレイヤー情報 */}
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-30"></div>
                <MinecraftAvatar
                  uuid={user.uuid}
                  mcid={user.mcid}
                  size={96}
                  priority
                />
              </div>
              <div className="flex-1 min-w-0 pr-12">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-bold text-foreground truncate">
                    {showDisplayName ? user.displayName : user.mcid}
                  </h1>
                  {user.isGuest && (
                    <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold">
                      GUEST
                    </span>
                  )}
                </div>
                {showDisplayName && user.displayName !== user.mcid && (
                  <p className="text-lg text-muted-foreground mt-1">
                    {user.mcid}
                  </p>
                )}
              </div>
            </div>

            {/* 環境設定 */}
            {hasPlayerConfig && (
              <div className="border-t border-border/50 pt-6 mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  環境
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {settings.gameLanguage && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">言語:</span>
                      <span className="font-medium">{getLanguageName(settings.gameLanguage)}</span>
                    </div>
                  )}
                  {settings.mouseModel && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">マウス:</span>
                      <span className="font-medium">{settings.mouseModel}</span>
                    </div>
                  )}
                  {settings.keyboardModel && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">キーボード:</span>
                      <span className="font-medium">{settings.keyboardModel}</span>
                    </div>
                  )}
                </div>
                {settings.notes && (
                  <div className="bg-background/50 p-5 rounded-lg border border-border">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">コメント</p>
                    <p className="text-sm whitespace-pre-wrap">{settings.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* タブナビゲーション */}
        {settings && (
          <div className="bg-background/95 border-b border-border">
            <div className="flex gap-1 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.name
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* タブコンテンツ */}
        <div className="p-6">
          {settings ? (
            <>
              {activeTab === 'keybindings' && (
                <KeybindingDisplay
                  settings={settings as any}
                  keybindings={rawKeybindings}
                  customKeys={rawCustomKeys}
                  keyRemaps={rawKeyRemaps}
                  externalTools={rawExternalTools}
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
