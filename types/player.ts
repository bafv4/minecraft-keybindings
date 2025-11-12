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

// 外部ツールアクション
export interface ExternalToolAction {
  trigger: string;
  action: string;
  description?: string;
}

// 外部ツール設定
export interface ExternalToolsConfig {
  [toolName: string]: {
    actions: ExternalToolAction[];
  };
}

// キーバインディングの型定義
export interface Keybinding {
  // 移動
  forward: string;
  back: string;
  left: string;
  right: string;
  jump: string;
  sneak: string;
  sprint: string;

  // アクション
  attack: string;
  use: string;
  pickBlock: string;
  drop: string;

  // インベントリ
  inventory: string;
  swapHands: string;
  hotbar1: string;
  hotbar2: string;
  hotbar3: string;
  hotbar4: string;
  hotbar5: string;
  hotbar6: string;
  hotbar7: string;
  hotbar8: string;
  hotbar9: string;

  // ビュー・UI操作
  togglePerspective?: string;
  fullscreen?: string;
  chat?: string;
  command?: string;
  toggleHud?: string;
}

// プレイヤー設定の型定義
export interface PlayerSettings extends Keybinding, MouseSettings {
  uuid: string; // 主キー
  keyboardLayout: string; // "JIS" or "US"
  remappings?: RemappingConfig | null;
  externalTools?: ExternalToolsConfig | null;
  additionalSettings?: Record<string, unknown> | null;

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
  createdAt: Date;
  updatedAt: Date;
  settings?: PlayerSettings | null;
}
