/**
 * デフォルトキーバインド定義
 * Minecraft Java Edition バニラのデフォルト設定
 */

import type { KeybindingData } from '@/types/keybinding';

/**
 * デフォルトキーバインド（25個のアクション）
 */
export const DEFAULT_KEYBINDINGS: KeybindingData[] = [
  // 移動
  { action: 'forward', keyCode: 'KeyW', category: 'movement' },
  { action: 'back', keyCode: 'KeyS', category: 'movement' },
  { action: 'left', keyCode: 'KeyA', category: 'movement' },
  { action: 'right', keyCode: 'KeyD', category: 'movement' },
  { action: 'jump', keyCode: 'Space', category: 'movement' },
  { action: 'sneak', keyCode: 'ShiftLeft', category: 'movement' },
  { action: 'sprint', keyCode: 'ControlLeft', category: 'movement' },

  // 戦闘
  { action: 'attack', keyCode: 'Mouse0', category: 'combat' },
  { action: 'use', keyCode: 'Mouse1', category: 'combat' },
  { action: 'pickBlock', keyCode: 'Mouse2', category: 'combat' },
  { action: 'drop', keyCode: 'KeyQ', category: 'combat' },

  // インベントリ
  { action: 'inventory', keyCode: 'KeyE', category: 'inventory' },
  { action: 'swapHands', keyCode: 'KeyF', category: 'inventory' },
  { action: 'hotbar1', keyCode: 'Digit1', category: 'inventory' },
  { action: 'hotbar2', keyCode: 'Digit2', category: 'inventory' },
  { action: 'hotbar3', keyCode: 'Digit3', category: 'inventory' },
  { action: 'hotbar4', keyCode: 'Digit4', category: 'inventory' },
  { action: 'hotbar5', keyCode: 'Digit5', category: 'inventory' },
  { action: 'hotbar6', keyCode: 'Digit6', category: 'inventory' },
  { action: 'hotbar7', keyCode: 'Digit7', category: 'inventory' },
  { action: 'hotbar8', keyCode: 'Digit8', category: 'inventory' },
  { action: 'hotbar9', keyCode: 'Digit9', category: 'inventory' },

  // UI
  { action: 'togglePerspective', keyCode: 'F5', category: 'ui' },
  { action: 'fullscreen', keyCode: 'F11', category: 'ui' },
  { action: 'chat', keyCode: 'KeyT', category: 'ui' },
  { action: 'command', keyCode: 'Slash', category: 'ui' },
  { action: 'toggleHud', keyCode: 'F1', category: 'ui' },
];

/**
 * アクション名からデフォルトキーコードを取得
 */
export function getDefaultKeyCode(action: string): string | undefined {
  return DEFAULT_KEYBINDINGS.find(kb => kb.action === action)?.keyCode;
}

/**
 * 新規ユーザー用のデフォルトキーバインドを取得
 * @returns デフォルトキーバインドの配列（コピー）
 */
export function getDefaultKeybindingsForNewUser(): KeybindingData[] {
  return DEFAULT_KEYBINDINGS.map(kb => ({ ...kb }));
}
