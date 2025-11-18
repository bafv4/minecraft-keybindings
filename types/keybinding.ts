/**
 * キーバインド関連の型定義
 */

/**
 * アクションカテゴリ
 */
export type ActionCategory = 'movement' | 'combat' | 'inventory' | 'ui' | 'custom';

/**
 * 指の種類
 */
export type FingerType =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'left-thumb'
  | 'right-thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

/**
 * キーバインドデータ（DBレコード用）
 */
export interface KeybindingData {
  action: string; // アクション名（例: "forward", "attack", "hotbar1"）
  keyCode: string; // Web標準キーコード（例: "KeyW", "Mouse0"）
  category: ActionCategory;
  isCustom: boolean;
  fingers?: FingerType[]; // このキーを押す指
}

/**
 * キーリマップデータ
 */
export interface KeyRemapData {
  sourceKey: string; // 元のキー（例: "CapsLock"）
  targetKey: string; // リマップ先（例: "ControlLeft"）
}

/**
 * 外部ツールアクション
 */
export interface ExternalToolData {
  triggerKey: string; // トリガーキー（例: "KeyF"）
  toolName: string; // ツール名（例: "Ninb", "SeedQueue"）
  actionName: string; // アクション名（例: "リセット", "Reset All"）
  description?: string; // 説明
}

/**
 * プレイヤー設定（デバイス情報）
 */
export interface PlayerSettingsData {
  keyboardLayout?: string; // "JIS" | "US"
  mouseDpi?: number;
  gameSensitivity?: number; // 0.0-1.0
  windowsSpeed?: number; // 1-20
  mouseAcceleration?: boolean;
  rawInput?: boolean;
  cm360?: number;
  gameLanguage?: string;
  mouseModel?: string;
  keyboardModel?: string;
  notes?: string;
}

/**
 * 完全なプレイヤーデータ（API戻り値）
 */
export interface PlayerData {
  uuid: string;
  mcid: string;
  displayName?: string;
  settings: PlayerSettingsData;
  keybindings: KeybindingData[];
  keyRemaps: KeyRemapData[];
  externalTools: ExternalToolData[];
}

/**
 * キーバインド更新リクエスト
 */
export interface UpdateKeybindingsRequest {
  settings?: Partial<PlayerSettingsData>;
  keybindings?: KeybindingData[];
  keyRemaps?: KeyRemapData[];
  externalTools?: ExternalToolData[];
}

/**
 * アクション名ラベルマップ（日本語）
 */
export const ACTION_LABELS: Record<string, string> = {
  // 移動
  forward: '前進',
  back: '後退',
  left: '左移動',
  right: '右移動',
  jump: 'ジャンプ',
  sneak: 'スニーク',
  sprint: 'スプリント',

  // 戦闘
  attack: '攻撃',
  use: '使用',
  pickBlock: 'ピックブロック',
  drop: 'ドロップ',

  // インベントリ
  inventory: 'インベントリ',
  swapHands: 'オフハンド交換',
  hotbar1: 'ホットバー1',
  hotbar2: 'ホットバー2',
  hotbar3: 'ホットバー3',
  hotbar4: 'ホットバー4',
  hotbar5: 'ホットバー5',
  hotbar6: 'ホットバー6',
  hotbar7: 'ホットバー7',
  hotbar8: 'ホットバー8',
  hotbar9: 'ホットバー9',

  // UI
  togglePerspective: '視点変更',
  fullscreen: 'フルスクリーン',
  chat: 'チャット',
  command: 'コマンド',
  toggleHud: 'HUD表示切替',
};

/**
 * アクションのカテゴリを取得
 */
export function getActionCategory(action: string): ActionCategory {
  if (['forward', 'back', 'left', 'right', 'jump', 'sneak', 'sprint'].includes(action)) {
    return 'movement';
  }
  if (['attack', 'use', 'pickBlock', 'drop'].includes(action)) {
    return 'combat';
  }
  if (['inventory', 'swapHands', ...Array.from({ length: 9 }, (_, i) => `hotbar${i + 1}`)].includes(action)) {
    return 'inventory';
  }
  if (['togglePerspective', 'fullscreen', 'chat', 'command', 'toggleHud'].includes(action)) {
    return 'ui';
  }
  return 'custom';
}

/**
 * アクションの表示名を取得
 */
export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
}
