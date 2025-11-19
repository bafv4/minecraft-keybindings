'use client';

import { useState } from 'react';
import { formatKeyName, calculateCursorSpeed } from '@/lib/utils';
import type { PlayerSettings, FingerAssignments, CustomKey } from '@/types/player';
import { VirtualKeyboard } from './VirtualKeyboard';

interface KeybindingDisplayProps {
  settings: PlayerSettings;
  keybindings?: Array<{ action: string; keyCode: string; category: string; fingers?: string[] }>;
  customKeys?: Array<{ keyCode: string; keyName: string; category: string }>;
  keyRemaps?: Array<{ sourceKey: string; targetKey: string | null }>;
  externalTools?: Array<{ triggerKey: string; toolName: string; actionName: string; description?: string | null }>;
}

// 言語コードを言語名に変換する関数
function getLanguageName(languageCode: string): string {
  const languageNames: { [key: string]: string } = {
    'ja_jp': '日本語',
    'en_us': 'English (US)',
    'en_gb': 'English (UK)',
    'de_de': 'Deutsch',
    'es_es': 'Español (España)',
    'es_mx': 'Español (México)',
    'fr_fr': 'Français',
    'it_it': 'Italiano',
    'ko_kr': '한국어',
    'pt_br': 'Português (Brasil)',
    'pt_pt': 'Português (Portugal)',
    'ru_ru': 'Русский',
    'zh_cn': '简体中文',
    'zh_tw': '繁體中文',
    'nl_nl': 'Nederlands',
    'pl_pl': 'Polski',
    'sv_se': 'Svenska',
    'da_dk': 'Dansk',
    'fi_fi': 'Suomi',
    'no_no': 'Norsk',
    'cs_cz': 'Čeština',
    'el_gr': 'Ελληνικά',
    'hu_hu': 'Magyar',
    'ro_ro': 'Română',
    'tr_tr': 'Türkçe',
    'ar_sa': 'العربية',
    'he_il': 'עברית',
    'th_th': 'ภาษาไทย',
    'vi_vn': 'Tiếng Việt',
    'id_id': 'Bahasa Indonesia',
    'uk_ua': 'Українська',
    'bg_bg': 'Български',
    'ca_es': 'Català',
    'hr_hr': 'Hrvatski',
    'et_ee': 'Eesti',
    'lv_lv': 'Latviešu',
    'lt_lt': 'Lietuvių',
    'sk_sk': 'Slovenčina',
    'sl_si': 'Slovenščina',
    'sr_sp': 'Српски',
  };

  return languageNames[languageCode.toLowerCase()] || languageCode;
}

// キー表示用のヘルパー関数
function formatKey(keyCode: string | undefined): string {
  // undefinedチェック
  if (!keyCode) return '-';

  // key.keyboard.w -> W
  // key.mouse.left -> M1
  // key.keyboard.left.shift -> LShift
  if (keyCode.startsWith('key.mouse.')) {
    const button = keyCode.replace('key.mouse.', '');
    if (button === 'left') return 'M1';
    if (button === 'right') return 'M2';
    if (button === 'middle') return 'M3';
    return button.toUpperCase();
  }

  if (keyCode.startsWith('key.keyboard.')) {
    const key = keyCode.replace('key.keyboard.', '');

    // 特殊キーの短縮表示
    const specialKeys: { [key: string]: string } = {
      'left.shift': 'LShift',
      'right.shift': 'RShift',
      'left.control': 'LCtrl',
      'right.control': 'RCtrl',
      'left.alt': 'LAlt',
      'right.alt': 'RAlt',
      'space': 'Space',
      'caps.lock': 'Caps',
    };

    if (specialKeys[key]) {
      return specialKeys[key];
    }

    // 通常のキーは大文字に
    return key.toUpperCase();
  }

  return keyCode;
}

export function KeybindingDisplay({
  settings,
  keybindings = [],
  customKeys = [],
  keyRemaps = [],
  externalTools = []
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
  ].map(formatKey);

  return (
    <div className="space-y-6">
      {/* 仮想キーボード */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">キー配置</h2>
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
      </section>

      {/* キー配置Overview */}
      <section>
        <h2 className="text-xl font-bold mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* ホットバー */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">ホットバー</div>
            <div className="flex gap-1 flex-wrap">
              {hotbarKeys.map((key, i) => (
                <kbd key={i} className="px-2 py-1 text-xs bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
                  {key}
                </kbd>
              ))}
            </div>
          </div>

          {/* オフハンド */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">オフハンド</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.swapHands)}
            </kbd>
          </div>

          {/* スニーク */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">スニーク</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.sneak)}
            </kbd>
          </div>

          {/* ダッシュ */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">ダッシュ</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.sprint)}
            </kbd>
          </div>

          {/* ジャンプ */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">ジャンプ</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.jump)}
            </kbd>
          </div>

          {/* インベントリ */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">インベントリ</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.inventory)}
            </kbd>
          </div>

          {/* ドロップ */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">ドロップ</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.drop)}
            </kbd>
          </div>

          {/* 視点変更 */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">視点変更</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.togglePerspective)}
            </kbd>
          </div>

          {/* フルスクリーン */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">フルスクリーン</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.fullscreen)}
            </kbd>
          </div>

          {/* チャット */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">チャット</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.chat)}
            </kbd>
          </div>

          {/* コマンド */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">コマンド</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.command)}
            </kbd>
          </div>

          {/* HUD非表示 */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">HUD非表示</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey(settings.toggleHud)}
            </kbd>
          </div>

          {/* リセット */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">リセット</div>
            <kbd className="px-3 py-1.5 text-base bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono">
              {formatKey((settings.additionalSettings as { reset?: string })?.reset || 'key.keyboard.f6')}
            </kbd>
          </div>

          {/* DPI */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">DPI</div>
            <div className="text-2xl font-bold">{settings.mouseDpi || '-'}</div>
          </div>

          {/* 感度 */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">感度（ゲーム内）</div>
            <div className="text-2xl font-bold">{settings.gameSensitivity ? `${Math.floor(Number(settings.gameSensitivity) * 200)}%` : '-'}</div>
          </div>

          {/* RawInput */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">RawInput</div>
            <div className="text-2xl font-bold">{settings.rawInput ? 'ON' : 'OFF'}</div>
          </div>

          {/* 振り向き */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">振り向き</div>
            <div className="text-2xl font-bold">{settings.cm360 ? `${settings.cm360}cm` : '-'}</div>
          </div>

          {/* Windows速度 */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">Win Sens</div>
            <div className="text-2xl font-bold">{settings.windowsSpeed || '-'}</div>
          </div>

          {/* マウス加速 */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">マウス加速</div>
            <div className="text-2xl font-bold">{settings.mouseAcceleration ? 'ON' : 'OFF'}</div>
          </div>

          {/* カーソル速度 */}
          <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">カーソル速度</div>
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
      </section>

      {/* ゲーム設定（手動設定が必要な項目のみ表示） */}
      {(settings.toggleSprint !== undefined || settings.toggleSneak !== undefined || settings.autoJump !== undefined) && (
        <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
          <h2 className="text-xl font-bold mb-4">ゲーム設定</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Toggle Sprint */}
            {settings.toggleSprint !== undefined && settings.toggleSprint !== null && (
              <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">Toggle Sprint</div>
                <div className="text-2xl font-bold">{settings.toggleSprint ? 'ON' : 'OFF'}</div>
              </div>
            )}

            {/* Toggle Sneak */}
            {settings.toggleSneak !== undefined && settings.toggleSneak !== null && (
              <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">Toggle Sneak</div>
                <div className="text-2xl font-bold">{settings.toggleSneak ? 'ON' : 'OFF'}</div>
              </div>
            )}

            {/* Auto Jump */}
            {settings.autoJump !== undefined && settings.autoJump !== null && (
              <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">Auto Jump</div>
                <div className="text-2xl font-bold">{settings.autoJump ? 'ON' : 'OFF'}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* プレイヤー環境設定 */}
      {(settings.gameLanguage || settings.mouseModel || settings.keyboardModel || settings.notes) && (
        <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
          <h2 className="text-xl font-bold mb-4">プレイヤー環境設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ゲーム内の言語 */}
            {settings.gameLanguage && (
              <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">ゲーム内の言語</div>
                <div className="text-lg font-medium">{getLanguageName(settings.gameLanguage)}</div>
              </div>
            )}

            {/* マウス */}
            {settings.mouseModel && (
              <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">マウス</div>
                <div className="text-lg font-medium">{settings.mouseModel}</div>
              </div>
            )}

            {/* キーボード */}
            {settings.keyboardModel && (
              <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">キーボード</div>
                <div className="text-lg font-medium">{settings.keyboardModel}</div>
              </div>
            )}

            {/* 自由使用欄 */}
            {settings.notes && (
              <div className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))] md:col-span-2">
                <div className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2">コメント</div>
                <div className="text-base whitespace-pre-wrap">{settings.notes}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* リマップ設定 */}
      {Object.keys(remappingsData).length > 0 && (
        <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
          <h2 className="text-xl font-bold mb-4">リマップ設定</h2>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
            ハードウェアレベルまたはドライバーレベルでのキー割り当て変更
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(remappingsData).map(([from, to]) => (
              <div key={from} className="flex items-center gap-3 p-3 bg-[rgb(var(--muted))]/50 rounded-lg border border-[rgb(var(--border))]">
                <div className="flex-1">
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">物理キー</div>
                  <code className="px-2 py-1 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded font-mono text-sm">
                    {formatKeyName(from)}
                  </code>
                </div>
                <svg className="w-5 h-5 text-[rgb(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="flex-1">
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">リマップ先</div>
                  <code className="px-2 py-1 bg-blue-500/10 border border-blue-500 rounded font-mono text-sm font-semibold">
                    {formatKeyName(to)}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 外部ツール */}
      {Object.keys(flattenedExternalTools).length > 0 && (
        <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
          <h2 className="text-xl font-bold mb-4">外部ツール・Modキー設定</h2>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
            JingleやAutoHotKeyなどの外部ツールによるアクション設定。SeedQueueの設定。
          </p>
          <div className="space-y-3">
            {Object.entries(flattenedExternalTools).map(([keyCode, action]) => (
              <div key={keyCode} className="bg-[rgb(var(--background))] p-3 rounded-lg border border-[rgb(var(--border))]">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">トリガーキー</div>
                    <code className="px-2 py-1 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded font-mono text-sm">
                      {formatKeyName(keyCode)}
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
        </section>
      )}
    </div>
  );
}

