'use client';

import { useState } from 'react';
import { formatKeyName, formatKeyNameShort, calculateCursorSpeed, CustomKeyInfo } from '@/lib/utils';
import { getLanguageName } from '@/lib/languages';
import type { PlayerSettings, FingerAssignments, CustomKey } from '@/types/player';
import { VirtualKeyboard } from './VirtualKeyboard';

interface KeybindingDisplayProps {
  settings: PlayerSettings;
  keybindings?: Array<{ action: string; keyCode: string; category: string; fingers?: string[] }>;
  customKeys?: Array<{ keyCode: string; keyName: string; category: string }>;
  keyRemaps?: Array<{ sourceKey: string; targetKey: string | null }>;
  externalTools?: Array<{ triggerKey: string; toolName: string; actionName: string; description?: string | null }>;
  section?: 'all' | 'overview' | 'keyboard' | 'remappings' | 'externaltools';
}

// キー表示用のヘルパー関数（Web標準形式とMinecraft形式の両方に対応）
function formatKey(keyCode: string | string[] | undefined, customKeys?: CustomKeyInfo[]): string {
  if (!keyCode) return '-';
  if (Array.isArray(keyCode)) {
    return keyCode.map(k => formatKeyName(k, customKeys)).join(', ');
  }
  return formatKeyName(keyCode, customKeys);
}

export function KeybindingDisplay({
  settings,
  keybindings = [],
  customKeys = [],
  keyRemaps = [],
  externalTools = [],
  section = 'all'
}: KeybindingDisplayProps) {
  // keybindings配列をオブジェクトに変換してsettingsにマージ
  const keybindingsMap = keybindings.reduce((acc, kb) => {
    acc[kb.action] = kb.keyCode;
    return acc;
  }, {} as Record<string, string>);

  const mergedSettings = { ...settings, ...keybindingsMap } as PlayerSettings & Record<string, any>;

  // 指の割り当て設定を正規化（後方互換性のため、古い形式を配列に変換）
  const normalizedFingerAssignments: FingerAssignments = (() => {
    if (!settings.fingerAssignments) {
      return {};
    }

    // Prisma JsonValueを強制的にオブジェクトとして扱う
    const rawFingerAssignments = settings.fingerAssignments as Record<string, unknown>;
    const entries = Object.entries(rawFingerAssignments);

    if (entries.length === 0) {
      return {};
    }

    const normalized: FingerAssignments = {};
    entries.forEach(([key, value]) => {
      // 古い形式（単一の文字列）または新しい形式（配列）のどちらにも対応
      if (Array.isArray(value)) {
        normalized[key] = value;
      } else if (typeof value === 'string') {
        // 古い形式：文字列を配列に変換
        normalized[key] = [value as any];
      }
    });
    return normalized;
  })();

  // カスタムキー（新スキーマではpropsから直接取得）
  const customKeysData: CustomKey[] = customKeys.map(ck => ({
    id: ck.keyCode,
    label: ck.keyName,
    keyCode: ck.keyCode
  }));

  // 指の色分け表示のトグル（初期値: 指の割り当てがある場合は表示）
  const [showFingerColors, setShowFingerColors] = useState(
    Object.keys(normalizedFingerAssignments).length > 0
  );

  // 仮想キーボード用のバインディングマップ
  const bindings = {
    forward: mergedSettings.forward,
    back: mergedSettings.back,
    left: mergedSettings.left,
    right: mergedSettings.right,
    jump: mergedSettings.jump,
    sneak: mergedSettings.sneak,
    sprint: mergedSettings.sprint,
    attack: mergedSettings.attack,
    use: mergedSettings.use,
    pickBlock: mergedSettings.pickBlock,
    drop: mergedSettings.drop,
    inventory: mergedSettings.inventory,
    swapHands: mergedSettings.swapHands,
    hotbar1: mergedSettings.hotbar1,
    hotbar2: mergedSettings.hotbar2,
    hotbar3: mergedSettings.hotbar3,
    hotbar4: mergedSettings.hotbar4,
    hotbar5: mergedSettings.hotbar5,
    hotbar6: mergedSettings.hotbar6,
    hotbar7: mergedSettings.hotbar7,
    hotbar8: mergedSettings.hotbar8,
    hotbar9: mergedSettings.hotbar9,
    togglePerspective: mergedSettings.togglePerspective || 'key.keyboard.f5',
    fullscreen: mergedSettings.fullscreen || 'key.keyboard.f11',
    chat: mergedSettings.chat || 'key.keyboard.t',
    command: mergedSettings.command || 'key.keyboard.slash',
    toggleHud: mergedSettings.toggleHud || 'key.keyboard.f1',
    reset: mergedSettings.reset || 'key.keyboard.f6',
    playerList: mergedSettings.playerList || 'key.keyboard.tab',
  };

  // 外部ツール設定（新スキーマ配列を旧形式に変換）
  const flattenedExternalTools = externalTools.reduce((acc, tool) => {
    acc[tool.triggerKey] = tool.actionName;
    return acc;
  }, {} as { [key: string]: string });

  // キーリマップ設定（新スキーマ配列を旧形式に変換）
  const remappingsData = keyRemaps.reduce((acc, remap) => {
    if (remap.targetKey !== null) {
      acc[remap.sourceKey] = remap.targetKey;
    }
    return acc;
  }, {} as { [key: string]: string });

  // ホットバーキー
  const hotbarKeys = [
    settings.hotbar1,
    settings.hotbar2,
    settings.hotbar3,
    settings.hotbar4,
    settings.hotbar5,
    settings.hotbar6,
    settings.hotbar7,
    settings.hotbar8,
    settings.hotbar9,
  ].map(k => formatKey(k, customKeys));

  return (
    <div className="space-y-6">
      {/* Overview */}
      {(section === 'all' || section === 'overview') && (
      <div>
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="space-y-4">
          {/* 移動 */}
          <div className="bg-[rgb(var(--card))] p-5 rounded-lg border-2 border-[rgb(var(--border))] shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-primary">移動</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">前進</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.forward, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">後退</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.back, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">左</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.left, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">右</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.right, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">ジャンプ</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.jump, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">スニーク</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.sneak, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">ダッシュ</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.sprint, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-medium">視点変更</span>
                <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                  {formatKey(settings.togglePerspective, customKeys)}
                </kbd>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-semibold">Sprint</span>
                <div className={`text-xl font-bold px-3 py-2 text-center ${
                  settings.toggleSprint === null || settings.toggleSprint === undefined
                    ? 'text-muted-foreground'
                    : settings.toggleSprint
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {settings.toggleSprint === null || settings.toggleSprint === undefined
                    ? '-'
                    : settings.toggleSprint ? 'Toggle' : 'Hold'}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-semibold">Sneak</span>
                <div className={`text-xl font-bold px-3 py-2 text-center ${
                  settings.toggleSneak === null || settings.toggleSneak === undefined
                    ? 'text-muted-foreground'
                    : settings.toggleSneak
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {settings.toggleSneak === null || settings.toggleSneak === undefined
                    ? '-'
                    : settings.toggleSneak ? 'Toggle' : 'Hold'}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <span className="text-xs text-muted-foreground font-semibold">オートジャンプ</span>
                <div className={`text-xl font-bold px-3 py-2 text-center ${
                  settings.autoJump === null || settings.autoJump === undefined
                    ? 'text-muted-foreground'
                    : settings.autoJump
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {settings.autoJump === null || settings.autoJump === undefined
                    ? '-'
                    : settings.autoJump ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>
          </div>

          {/* インベントリ */}
          <div className="bg-[rgb(var(--card))] p-5 rounded-lg border-2 border-[rgb(var(--border))] shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-primary">インベントリ</h3>
            <div className="space-y-3">
              {/* ホットバー */}
              <div>
                <span className="text-xs text-muted-foreground mb-2 block font-medium">ホットバー</span>
                <div className="flex gap-2 flex-wrap">
                  {hotbarKeys.map((key, i) => (
                    <div key={i} className="flex flex-col gap-1 items-center">
                      <span className="text-xs text-muted-foreground font-semibold">{i + 1}</span>
                      <kbd className="px-3 py-2 text-base bg-[rgb(var(--card))] border-2 border-[rgb(var(--border))] rounded-lg font-mono font-bold shadow-sm min-w-[2.5rem] text-center whitespace-nowrap">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
              {/* その他のインベントリ操作 */}
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                  <span className="text-xs text-muted-foreground font-medium">オフハンド</span>
                  <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                    {formatKey(settings.swapHands, customKeys)}
                  </kbd>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                  <span className="text-xs text-muted-foreground font-medium">インベントリ</span>
                  <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                    {formatKey(settings.inventory, customKeys)}
                  </kbd>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                  <span className="text-xs text-muted-foreground font-medium">ドロップ</span>
                  <kbd className="px-3 py-2 text-center bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg font-mono font-semibold text-sm truncate shadow-sm">
                    {formatKey(settings.drop, customKeys)}
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* マウス設定 */}
          <div className="bg-[rgb(var(--card))] p-5 rounded-lg border-2 border-[rgb(var(--border))] shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-primary">マウス設定</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                <span className="text-xs text-muted-foreground font-semibold">DPI</span>
                <div className="text-2xl font-bold">{settings.mouseDpi || '-'}</div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                <span className="text-xs text-muted-foreground font-semibold">感度（ゲーム内）</span>
                <div className="text-2xl font-bold">{settings.gameSensitivity ? `${Math.floor(Number(settings.gameSensitivity) * 200)}%` : '-'}</div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                <span className="text-xs text-muted-foreground font-semibold">RawInput</span>
                <div className={`text-2xl font-bold ${
                  settings.rawInput
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {settings.rawInput ? 'ON' : 'OFF'}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                <span className="text-xs text-muted-foreground font-semibold">振り向き</span>
                <div className="text-2xl font-bold">{settings.cm360 ? `${settings.cm360}cm` : '-'}</div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                <span className="text-xs text-muted-foreground font-semibold">Win速度</span>
                <div className="text-2xl font-bold">{settings.windowsSpeed || '-'}</div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                <span className="text-xs text-muted-foreground font-semibold">マウス加速</span>
                <div className={`text-2xl font-bold ${
                  settings.mouseAcceleration
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {settings.mouseAcceleration ? 'ON' : 'OFF'}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                <span className="text-xs text-muted-foreground font-semibold">カーソル速度</span>
                <div className="text-2xl font-bold">
                  {(() => {
                    if (!settings.mouseDpi) return '-';
                    const cursorSpeed = calculateCursorSpeed(
                      settings.mouseDpi,
                      settings.windowsSpeed ?? 10,
                      settings.rawInput,
                      settings.mouseAcceleration
                    );
                    return cursorSpeed !== null ? `${cursorSpeed}` : '-';
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 仮想キーボード */}
      {(section === 'all' || section === 'keyboard') && (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">キー配置</h2>
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${Object.keys(normalizedFingerAssignments).length === 0 ? 'text-[rgb(var(--muted-foreground))]' : ''}`}>
              指の色分け表示
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={showFingerColors}
              onClick={() => setShowFingerColors(!showFingerColors)}
              disabled={Object.keys(normalizedFingerAssignments).length === 0}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                Object.keys(normalizedFingerAssignments).length === 0
                  ? 'bg-[rgb(var(--muted))] cursor-not-allowed opacity-50'
                  : showFingerColors
                  ? 'bg-blue-600'
                  : 'bg-[rgb(var(--border))]'
              }`}
              title={Object.keys(normalizedFingerAssignments).length === 0 ? '指の割り当てがありません' : ''}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showFingerColors ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <VirtualKeyboard
          bindings={bindings}
          mode="display"
          remappings={remappingsData}
          externalTools={flattenedExternalTools}
          fingerAssignments={normalizedFingerAssignments}
          showFingerColors={showFingerColors}
          keyboardLayout={(settings.keyboardLayout as 'JIS' | 'US') || 'JIS'}
          customKeys={customKeysData}
        />
      </div>
      )}

      {/* リマップ設定 */}
      {(section === 'all' || section === 'remappings') && Object.keys(remappingsData).length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">リマップ設定</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              ハードウェアレベルまたはドライバーレベルでのキー割り当て変更
            </p>
          </div>
          <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(remappingsData).map(([from, to]) => (
                      <div key={from} className="flex items-center gap-3 p-3 bg-[rgb(var(--muted))]/50 rounded-lg border border-[rgb(var(--border))]">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">物理キー</div>
                          <code className="px-2 py-1 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded font-mono text-sm break-all">
                            {formatKeyNameShort(from, customKeys)}
                          </code>
                        </div>
                        <svg className="w-5 h-5 flex-shrink-0 text-[rgb(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">リマップ先</div>
                          <code className="px-2 py-1 bg-blue-500/10 border border-blue-500 rounded font-mono text-sm font-semibold break-all">
                            {formatKeyNameShort(to, customKeys)}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
          </div>
        </div>
      )}

      {/* 外部ツール */}
      {(section === 'all' || section === 'externaltools') && Object.keys(flattenedExternalTools).length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">外部ツール・Modキー設定</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              JingleやAutoHotKeyなどの外部ツールによるアクション設定。SeedQueueの設定。
            </p>
          </div>
          <div>
                  <div className="space-y-3">
                    {Object.entries(flattenedExternalTools).map(([keyCode, action]) => (
                      <div key={keyCode} className="bg-[rgb(var(--background))] p-3 rounded-lg border border-[rgb(var(--border))]">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">トリガーキー</div>
                            <code className="px-2 py-1 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono text-sm">
                              {formatKeyName(keyCode, customKeys)}
                            </code>
                          </div>
                          <svg className="w-4 h-4 text-[rgb(var(--muted-foreground))] mt-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">実行アクション</div>
                            <div className="px-2 py-1 bg-purple-500/10 border border-purple-500 rounded text-sm font-semibold text-purple-700 dark:text-purple-300">
                              {action}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
          </div>
        </div>
      )}
    </div>
  );
}

