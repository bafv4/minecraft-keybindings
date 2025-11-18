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
  { action: 'forward', keyCode: 'KeyW', category: 'movement', isCustom: false },
  { action: 'back', keyCode: 'KeyS', category: 'movement', isCustom: false },
  { action: 'left', keyCode: 'KeyA', category: 'movement', isCustom: false },
  { action: 'right', keyCode: 'KeyD', category: 'movement', isCustom: false },
  { action: 'jump', keyCode: 'Space', category: 'movement', isCustom: false },
  { action: 'sneak', keyCode: 'ShiftLeft', category: 'movement', isCustom: false },
  { action: 'sprint', keyCode: 'ControlLeft', category: 'movement', isCustom: false },

  // 戦闘
  { action: 'attack', keyCode: 'Mouse0', category: 'combat', isCustom: false },
  { action: 'use', keyCode: 'Mouse1', category: 'combat', isCustom: false },
  { action: 'pickBlock', keyCode: 'Mouse2', category: 'combat', isCustom: false },
  { action: 'drop', keyCode: 'KeyQ', category: 'combat', isCustom: false },

  // インベントリ
  { action: 'inventory', keyCode: 'KeyE', category: 'inventory', isCustom: false },
  { action: 'swapHands', keyCode: 'KeyF', category: 'inventory', isCustom: false },
  { action: 'hotbar1', keyCode: 'Digit1', category: 'inventory', isCustom: false },
  { action: 'hotbar2', keyCode: 'Digit2', category: 'inventory', isCustom: false },
  { action: 'hotbar3', keyCode: 'Digit3', category: 'inventory', isCustom: false },
  { action: 'hotbar4', keyCode: 'Digit4', category: 'inventory', isCustom: false },
  { action: 'hotbar5', keyCode: 'Digit5', category: 'inventory', isCustom: false },
  { action: 'hotbar6', keyCode: 'Digit6', category: 'inventory', isCustom: false },
  { action: 'hotbar7', keyCode: 'Digit7', category: 'inventory', isCustom: false },
  { action: 'hotbar8', keyCode: 'Digit8', category: 'inventory', isCustom: false },
  { action: 'hotbar9', keyCode: 'Digit9', category: 'inventory', isCustom: false },

  // UI
  { action: 'togglePerspective', keyCode: 'F5', category: 'ui', isCustom: false },
  { action: 'fullscreen', keyCode: 'F11', category: 'ui', isCustom: false },
  { action: 'chat', keyCode: 'KeyT', category: 'ui', isCustom: false },
  { action: 'command', keyCode: 'Slash', category: 'ui', isCustom: false },
  { action: 'toggleHud', keyCode: 'F1', category: 'ui', isCustom: false },
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
