'use client';

import { useState, useEffect, useRef } from 'react';
import { MinecraftAvatar } from './MinecraftAvatar';
import { ShareButton } from './ShareButton';
import { KeybindingDisplay } from './KeybindingDisplay';
import { ItemLayoutsDisplay } from './ItemLayoutsDisplay';
import { SearchCraftDisplay } from './SearchCraftDisplay';
import { TabContainer } from './TabContainer';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mainCardTop, setMainCardTop] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const isScrolledRef = useRef(false);
  const showDisplayName = user.displayName && user.displayName.trim() !== '';

  // 環境設定の存在チェック
  const hasPlayerConfig = settings && (
    settings.gameLanguage ||
    settings.mouseModel ||
    settings.keyboardModel ||
    settings.notes
  );

  useEffect(() => {
    const calculateMainCardTop = () => {
      if (cardRef.current) {
        // グローバルヘッダー（モバイル: 56px, デスクトップ: 80px）
        const globalHeader = window.innerWidth >= 768 ? 80 : 56;
        // ヘッダーとプレイヤー情報カードの間のマージン（16px）
        const headerMargin = 16;
        // カードの高さ（縮小版）
        const cardHeight = cardRef.current.offsetHeight;
        // カードとメインカードの間のマージン（16px = mb-4）
        const cardMargin = 16;

        setMainCardTop(globalHeader + headerMargin + cardHeight + cardMargin);
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const newIsScrolled = scrollTop > 100;

      if (newIsScrolled !== isScrolledRef.current) {
        isScrolledRef.current = newIsScrolled;
        setIsScrolled(newIsScrolled);

        // スクロール状態が変わったら再計算
        if (newIsScrolled) {
          // 少し遅延させて、縮小アニメーション後の高さを取得
          setTimeout(calculateMainCardTop, 50);
        }
      }
    };

    const handleResize = () => {
      calculateMainCardTop();
    };

    // wheelイベントでメインカード内スクロールを制御
    const handleWheel = (e: WheelEvent) => {
      const scrollTop = window.scrollY;
      const mainCard = mainCardRef.current;

      if (!mainCard) return;

      // ページスクロールがまだ100px未満の場合
      if (scrollTop < 100) {
        // ページ全体をスクロール（デフォルト動作）
        return;
      }

      // ページスクロールが100px以上の場合
      const canScrollUp = mainCard.scrollTop > 0;
      const canScrollDown = mainCard.scrollTop < mainCard.scrollHeight - mainCard.clientHeight - 1;

      // 下にスクロールしようとしていて、メインカードがまだスクロール可能な場合
      if (e.deltaY > 0 && canScrollDown) {
        e.preventDefault();
        mainCard.scrollTop += e.deltaY;
        return;
      }

      // 上にスクロールしようとしていて、メインカードがまだ上にスクロール可能な場合
      if (e.deltaY < 0 && canScrollUp) {
        e.preventDefault();
        mainCard.scrollTop += e.deltaY;
        return;
      }

      // メインカードの上端に達し、上にスクロールしようとしている場合
      // ページスクロールを許可（デフォルト動作）
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleWheel, { passive: false });

    // 初期計算
    calculateMainCardTop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []); // 依存配列を空に

  // メインカードの高さを計算
  const mainCardHeight = isScrolled
    ? `calc(100vh - ${mainCardTop}px)`
    : 'auto';

  return (
    <div className="pb-6 flex flex-col">
      {/* プレイヤーヘッダー */}
      <div
        ref={headerRef}
        className={`transition-all duration-300 ${
          isScrolled
            ? 'sticky top-[4.5rem] md:top-24 z-30 mb-4'
            : 'mb-8'
        }`}
      >
        <div
          ref={cardRef}
          className={`bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm relative transition-all duration-300 ${
            isScrolled ? 'p-4 backdrop-blur-sm' : 'p-6'
          }`}
        >
          {/* 共有ボタン */}
          {!isScrolled && (
            <div className="absolute top-4 right-4">
              <ShareButton mcid={user.mcid} />
            </div>
          )}

          {/* プレイヤー情報 */}
          <div className={`flex items-center gap-4 ${isScrolled ? 'gap-3' : 'gap-6'}`}>
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-30"></div>
              <MinecraftAvatar
                uuid={user.uuid}
                mcid={user.mcid}
                size={isScrolled ? 48 : 96}
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className={`font-bold text-foreground transition-all duration-300 truncate ${
                    isScrolled ? 'text-2xl' : 'text-4xl'
                  }`}
                >
                  {showDisplayName ? user.displayName : user.mcid}
                </h1>
                {user.isGuest && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold ${
                      isScrolled ? 'text-[10px] px-2 py-0.5' : ''
                    }`}
                  >
                    GUEST
                  </span>
                )}
              </div>
              {showDisplayName && user.displayName !== user.mcid && (
                <p
                  className={`text-muted-foreground transition-all duration-300 ${
                    isScrolled ? 'text-sm mt-0' : 'text-lg mt-1'
                  }`}
                >
                  {user.mcid}
                </p>
              )}
            </div>
            {isScrolled && (
              <div className="flex-shrink-0">
                <ShareButton mcid={user.mcid} />
              </div>
            )}
          </div>

          {/* 環境設定（スクロール時は非表示） */}
          {!isScrolled && hasPlayerConfig && (
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
                <div className="bg-[rgb(var(--card))] p-5 rounded-lg border-2 border-[rgb(var(--border))] shadow-md">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">コメント</p>
                  <p className="text-sm whitespace-pre-wrap">{settings.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* タブコンテンツ */}
      {settings ? (
        <TabContainer
          ref={mainCardRef}
          height={mainCardHeight}
          tabs={[
            {
              name: 'keybindings',
              label: 'キーボード・マウス設定',
              content: (
                <KeybindingDisplay
                  settings={settings as any}
                  keybindings={rawKeybindings}
                  customKeys={rawCustomKeys}
                  keyRemaps={rawKeyRemaps}
                  externalTools={rawExternalTools}
                />
              ),
            },
            {
              name: 'items',
              label: 'アイテム配置',
              content: (
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
              ),
            },
            {
              name: 'searchcraft',
              label: 'サーチクラフト設定',
              content: (
                <SearchCraftDisplay
                  searchCrafts={searchCrafts}
                  keyRemaps={rawKeyRemaps}
                  fingerAssignments={(settings.fingerAssignments as any) || {}}
                />
              ),
            },
          ]}
          defaultTab="keybindings"
        />
      ) : (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
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
  );
}
