// マウス設定の型定義
export interface MouseSettings {
  dpi?: number;
  gameSensitivity?: number;
  windowsSpeed?: number;
  mouseAcceleration: boolean;
  cm360?: number; // 自動計算
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
}

// プレイヤー設定の型定義
export interface PlayerSettings extends Keybinding, MouseSettings {
  id: string;
  userId: string;
  remappings?: RemappingConfig;
  externalTools?: ExternalToolsConfig;
  additionalSettings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ユーザーの型定義
export interface User {
  id: string;
  mcid: string;
  uuid: string;
  microsoftId: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: PlayerSettings;
}
