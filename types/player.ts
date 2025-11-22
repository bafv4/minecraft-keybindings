// マウス設定の型定義
export interface MouseSettings {
  mouseDpi?: number | null;
  gameSensitivity?: number | null; // Options.txt形式: 0.0-1.0 (4%は0.02)
  windowsSpeed?: number | null; // 1-20
  mouseAcceleration: boolean;
  rawInput: boolean; // RawInput使用の有無
  cm360?: number | null; // 自動計算
}

// リマップ設定の型定義
export interface RemappingConfig {
  [physicalKey: string]: string;
}

// 指の種類
export type Finger =
  | 'left-pinky'      // 左手小指
  | 'left-ring'       // 左手薬指
  | 'left-middle'     // 左手中指
  | 'left-index'      // 左手人差し指
  | 'left-thumb'      // 左手親指
  | 'right-thumb'     // 右手親指
  | 'right-index'     // 右手人差し指
  | 'right-middle'    // 右手中指
  | 'right-ring'      // 右手薬指
  | 'right-pinky';    // 右手小指

// 指の割り当て設定（複数の指を割り当て可能）
export interface FingerAssignments {
  [keyCode: string]: Finger[];
}

// カスタムキー定義
export interface CustomKey {
  id: string; // 一意のID（例: "custom-1", "custom-2"）
  label: string; // 表示名（数文字、例: "F13", "XB1", "M4"）
  keyCode: string; // 内部キーコード（例: "key.custom.1"）
}

// カスタムキー設定
export interface CustomKeysConfig {
  keys: CustomKey[];
}

// 外部ツール設定（キーごとにアクションを割り当て）
export interface ExternalToolsConfig {
  [keyCode: string]: string; // keyCode -> action (例: "key.keyboard.f" -> "リセット")
}

// キーバインディングの型定義（各キーに単一または複数のアクションを割り当て可能）
export interface Keybinding {
  // 移動
  forward: string | string[];
  back: string | string[];
  left: string | string[];
  right: string | string[];
  jump: string | string[];
  sneak: string | string[];
  sprint: string | string[];

  // アクション
  attack: string | string[];
  use: string | string[];
  pickBlock: string | string[];
  drop: string | string[];

  // インベントリ
  inventory: string | string[];
  swapHands: string | string[];
  hotbar1: string | string[];
  hotbar2: string | string[];
  hotbar3: string | string[];
  hotbar4: string | string[];
  hotbar5: string | string[];
  hotbar6: string | string[];
  hotbar7: string | string[];
  hotbar8: string | string[];
  hotbar9: string | string[];

  // ビュー・UI操作
  togglePerspective?: string | string[];
  fullscreen?: string | string[];
  chat?: string | string[];
  command?: string | string[];
  toggleHud?: string | string[];
}

// 追加設定の型定義
export interface AdditionalSettings {
  reset?: string | string[];
  playerList?: string | string[];
  customKeys?: CustomKeysConfig;
  [key: string]: unknown;
}

// プレイヤー設定の型定義
export interface PlayerSettings extends Keybinding, MouseSettings {
  uuid: string; // 主キー
  keyboardLayout: string; // "JIS" or "US"
  remappings?: RemappingConfig | null;
  externalTools?: ExternalToolsConfig | null;
  fingerAssignments?: FingerAssignments | null;
  additionalSettings?: AdditionalSettings | null;

  // ゲーム設定（手動設定が必要）
  toggleSprint?: boolean | null;
  toggleSneak?: boolean | null;
  autoJump?: boolean | null;

  // プレイヤー環境設定
  gameLanguage?: string | null;
  mouseModel?: string | null;
  keyboardModel?: string | null;
  notes?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// ユーザーの型定義
export interface User {
  uuid: string; // 主キー
  mcid: string;
  passphrase?: string | null;
  displayName: string;
  isGuest?: boolean; // ゲストユーザーフラグ
  createdAt: Date;
  updatedAt: Date;
  settings?: PlayerSettings | null;
  customKeys?: Array<{ keyCode: string; keyName: string }>;
}
