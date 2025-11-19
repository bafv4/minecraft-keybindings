/**
 * Web標準KeyboardEvent.code準拠のキー定義システム
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
 */

export type KeyCategory =
  | 'alphabet'
  | 'digit'
  | 'function'
  | 'modifier'
  | 'navigation'
  | 'numpad'
  | 'editing'
  | 'symbol'
  | 'special'
  | 'mouse'
  | 'jis-specific'
  | 'custom';

export interface KeyPosition {
  row: number;
  col: number;
}

export interface KeySize {
  width: number; // w-単位（Tailwind）
  height?: number; // デフォルト1
}

export interface KeyDefinition {
  code: string; // Web標準コード
  name: string; // 表示名（JIS専用キーは日本語）
  category: KeyCategory;
  position?: KeyPosition; // キーボード上の物理位置
  size?: KeySize;
  minecraft?: string; // 旧Minecraft形式（移行用）
}

/**
 * 全キー定義マップ
 */
export const KEYS: Record<string, KeyDefinition> = {
  // ========== 文字キー（アルファベット） ==========
  KeyA: { code: 'KeyA', name: 'A', category: 'alphabet', position: { row: 2, col: 1 }, minecraft: 'key.keyboard.a' },
  KeyB: { code: 'KeyB', name: 'B', category: 'alphabet', position: { row: 3, col: 5 }, minecraft: 'key.keyboard.b' },
  KeyC: { code: 'KeyC', name: 'C', category: 'alphabet', position: { row: 3, col: 3 }, minecraft: 'key.keyboard.c' },
  KeyD: { code: 'KeyD', name: 'D', category: 'alphabet', position: { row: 2, col: 3 }, minecraft: 'key.keyboard.d' },
  KeyE: { code: 'KeyE', name: 'E', category: 'alphabet', position: { row: 1, col: 3 }, minecraft: 'key.keyboard.e' },
  KeyF: { code: 'KeyF', name: 'F', category: 'alphabet', position: { row: 2, col: 4 }, minecraft: 'key.keyboard.f' },
  KeyG: { code: 'KeyG', name: 'G', category: 'alphabet', position: { row: 2, col: 5 }, minecraft: 'key.keyboard.g' },
  KeyH: { code: 'KeyH', name: 'H', category: 'alphabet', position: { row: 2, col: 6 }, minecraft: 'key.keyboard.h' },
  KeyI: { code: 'KeyI', name: 'I', category: 'alphabet', position: { row: 1, col: 8 }, minecraft: 'key.keyboard.i' },
  KeyJ: { code: 'KeyJ', name: 'J', category: 'alphabet', position: { row: 2, col: 7 }, minecraft: 'key.keyboard.j' },
  KeyK: { code: 'KeyK', name: 'K', category: 'alphabet', position: { row: 2, col: 8 }, minecraft: 'key.keyboard.k' },
  KeyL: { code: 'KeyL', name: 'L', category: 'alphabet', position: { row: 2, col: 9 }, minecraft: 'key.keyboard.l' },
  KeyM: { code: 'KeyM', name: 'M', category: 'alphabet', position: { row: 3, col: 7 }, minecraft: 'key.keyboard.m' },
  KeyN: { code: 'KeyN', name: 'N', category: 'alphabet', position: { row: 3, col: 6 }, minecraft: 'key.keyboard.n' },
  KeyO: { code: 'KeyO', name: 'O', category: 'alphabet', position: { row: 1, col: 9 }, minecraft: 'key.keyboard.o' },
  KeyP: { code: 'KeyP', name: 'P', category: 'alphabet', position: { row: 1, col: 10 }, minecraft: 'key.keyboard.p' },
  KeyQ: { code: 'KeyQ', name: 'Q', category: 'alphabet', position: { row: 1, col: 1 }, minecraft: 'key.keyboard.q' },
  KeyR: { code: 'KeyR', name: 'R', category: 'alphabet', position: { row: 1, col: 4 }, minecraft: 'key.keyboard.r' },
  KeyS: { code: 'KeyS', name: 'S', category: 'alphabet', position: { row: 2, col: 2 }, minecraft: 'key.keyboard.s' },
  KeyT: { code: 'KeyT', name: 'T', category: 'alphabet', position: { row: 1, col: 5 }, minecraft: 'key.keyboard.t' },
  KeyU: { code: 'KeyU', name: 'U', category: 'alphabet', position: { row: 1, col: 7 }, minecraft: 'key.keyboard.u' },
  KeyV: { code: 'KeyV', name: 'V', category: 'alphabet', position: { row: 3, col: 4 }, minecraft: 'key.keyboard.v' },
  KeyW: { code: 'KeyW', name: 'W', category: 'alphabet', position: { row: 1, col: 2 }, minecraft: 'key.keyboard.w' },
  KeyX: { code: 'KeyX', name: 'X', category: 'alphabet', position: { row: 3, col: 2 }, minecraft: 'key.keyboard.x' },
  KeyY: { code: 'KeyY', name: 'Y', category: 'alphabet', position: { row: 1, col: 6 }, minecraft: 'key.keyboard.y' },
  KeyZ: { code: 'KeyZ', name: 'Z', category: 'alphabet', position: { row: 3, col: 1 }, minecraft: 'key.keyboard.z' },

  // ========== 数字キー（上段） ==========
  Digit1: { code: 'Digit1', name: '1', category: 'digit', position: { row: 0, col: 1 }, minecraft: 'key.keyboard.1' },
  Digit2: { code: 'Digit2', name: '2', category: 'digit', position: { row: 0, col: 2 }, minecraft: 'key.keyboard.2' },
  Digit3: { code: 'Digit3', name: '3', category: 'digit', position: { row: 0, col: 3 }, minecraft: 'key.keyboard.3' },
  Digit4: { code: 'Digit4', name: '4', category: 'digit', position: { row: 0, col: 4 }, minecraft: 'key.keyboard.4' },
  Digit5: { code: 'Digit5', name: '5', category: 'digit', position: { row: 0, col: 5 }, minecraft: 'key.keyboard.5' },
  Digit6: { code: 'Digit6', name: '6', category: 'digit', position: { row: 0, col: 6 }, minecraft: 'key.keyboard.6' },
  Digit7: { code: 'Digit7', name: '7', category: 'digit', position: { row: 0, col: 7 }, minecraft: 'key.keyboard.7' },
  Digit8: { code: 'Digit8', name: '8', category: 'digit', position: { row: 0, col: 8 }, minecraft: 'key.keyboard.8' },
  Digit9: { code: 'Digit9', name: '9', category: 'digit', position: { row: 0, col: 9 }, minecraft: 'key.keyboard.9' },
  Digit0: { code: 'Digit0', name: '0', category: 'digit', position: { row: 0, col: 10 }, minecraft: 'key.keyboard.0' },

  // ========== ファンクションキー ==========
  F1: { code: 'F1', name: 'F1', category: 'function', minecraft: 'key.keyboard.f1' },
  F2: { code: 'F2', name: 'F2', category: 'function', minecraft: 'key.keyboard.f2' },
  F3: { code: 'F3', name: 'F3', category: 'function', minecraft: 'key.keyboard.f3' },
  F4: { code: 'F4', name: 'F4', category: 'function', minecraft: 'key.keyboard.f4' },
  F5: { code: 'F5', name: 'F5', category: 'function', minecraft: 'key.keyboard.f5' },
  F6: { code: 'F6', name: 'F6', category: 'function', minecraft: 'key.keyboard.f6' },
  F7: { code: 'F7', name: 'F7', category: 'function', minecraft: 'key.keyboard.f7' },
  F8: { code: 'F8', name: 'F8', category: 'function', minecraft: 'key.keyboard.f8' },
  F9: { code: 'F9', name: 'F9', category: 'function', minecraft: 'key.keyboard.f9' },
  F10: { code: 'F10', name: 'F10', category: 'function', minecraft: 'key.keyboard.f10' },
  F11: { code: 'F11', name: 'F11', category: 'function', minecraft: 'key.keyboard.f11' },
  F12: { code: 'F12', name: 'F12', category: 'function', minecraft: 'key.keyboard.f12' },
  F13: { code: 'F13', name: 'F13', category: 'function', minecraft: 'key.keyboard.f13' },
  F14: { code: 'F14', name: 'F14', category: 'function', minecraft: 'key.keyboard.f14' },
  F15: { code: 'F15', name: 'F15', category: 'function', minecraft: 'key.keyboard.f15' },
  F16: { code: 'F16', name: 'F16', category: 'function', minecraft: 'key.keyboard.f16' },
  F17: { code: 'F17', name: 'F17', category: 'function', minecraft: 'key.keyboard.f17' },
  F18: { code: 'F18', name: 'F18', category: 'function', minecraft: 'key.keyboard.f18' },
  F19: { code: 'F19', name: 'F19', category: 'function', minecraft: 'key.keyboard.f19' },
  F20: { code: 'F20', name: 'F20', category: 'function', minecraft: 'key.keyboard.f20' },

  // ========== 修飾キー ==========
  ShiftLeft: { code: 'ShiftLeft', name: 'LShift', category: 'modifier', position: { row: 3, col: 0 }, size: { width: 2 }, minecraft: 'key.keyboard.left.shift' },
  ShiftRight: { code: 'ShiftRight', name: 'RShift', category: 'modifier', position: { row: 3, col: 12 }, size: { width: 2 }, minecraft: 'key.keyboard.right.shift' },
  ControlLeft: { code: 'ControlLeft', name: 'LCtrl', category: 'modifier', position: { row: 4, col: 0 }, minecraft: 'key.keyboard.left.control' },
  ControlRight: { code: 'ControlRight', name: 'RCtrl', category: 'modifier', position: { row: 4, col: 12 }, minecraft: 'key.keyboard.right.control' },
  AltLeft: { code: 'AltLeft', name: 'LAlt', category: 'modifier', position: { row: 4, col: 2 }, minecraft: 'key.keyboard.left.alt' },
  AltRight: { code: 'AltRight', name: 'RAlt', category: 'modifier', position: { row: 4, col: 10 }, minecraft: 'key.keyboard.right.alt' },
  MetaLeft: { code: 'MetaLeft', name: 'LWin', category: 'modifier', position: { row: 4, col: 1 }, minecraft: 'key.keyboard.left.win' },
  MetaRight: { code: 'MetaRight', name: 'RWin', category: 'modifier', position: { row: 4, col: 11 }, minecraft: 'key.keyboard.right.win' },

  // ========== ナビゲーションキー ==========
  ArrowUp: { code: 'ArrowUp', name: '↑', category: 'navigation', minecraft: 'key.keyboard.up' },
  ArrowDown: { code: 'ArrowDown', name: '↓', category: 'navigation', minecraft: 'key.keyboard.down' },
  ArrowLeft: { code: 'ArrowLeft', name: '←', category: 'navigation', minecraft: 'key.keyboard.left' },
  ArrowRight: { code: 'ArrowRight', name: '→', category: 'navigation', minecraft: 'key.keyboard.right' },
  PageUp: { code: 'PageUp', name: 'PgUp', category: 'navigation', minecraft: 'key.keyboard.page.up' },
  PageDown: { code: 'PageDown', name: 'PgDn', category: 'navigation', minecraft: 'key.keyboard.page.down' },
  Home: { code: 'Home', name: 'Home', category: 'navigation', minecraft: 'key.keyboard.home' },
  End: { code: 'End', name: 'End', category: 'navigation', minecraft: 'key.keyboard.end' },

  // ========== テンキー ==========
  Numpad0: { code: 'Numpad0', name: 'Num0', category: 'numpad', minecraft: 'key.keyboard.keypad.0' },
  Numpad1: { code: 'Numpad1', name: 'Num1', category: 'numpad', minecraft: 'key.keyboard.keypad.1' },
  Numpad2: { code: 'Numpad2', name: 'Num2', category: 'numpad', minecraft: 'key.keyboard.keypad.2' },
  Numpad3: { code: 'Numpad3', name: 'Num3', category: 'numpad', minecraft: 'key.keyboard.keypad.3' },
  Numpad4: { code: 'Numpad4', name: 'Num4', category: 'numpad', minecraft: 'key.keyboard.keypad.4' },
  Numpad5: { code: 'Numpad5', name: 'Num5', category: 'numpad', minecraft: 'key.keyboard.keypad.5' },
  Numpad6: { code: 'Numpad6', name: 'Num6', category: 'numpad', minecraft: 'key.keyboard.keypad.6' },
  Numpad7: { code: 'Numpad7', name: 'Num7', category: 'numpad', minecraft: 'key.keyboard.keypad.7' },
  Numpad8: { code: 'Numpad8', name: 'Num8', category: 'numpad', minecraft: 'key.keyboard.keypad.8' },
  Numpad9: { code: 'Numpad9', name: 'Num9', category: 'numpad', minecraft: 'key.keyboard.keypad.9' },
  NumpadAdd: { code: 'NumpadAdd', name: 'Num+', category: 'numpad', minecraft: 'key.keyboard.keypad.add' },
  NumpadSubtract: { code: 'NumpadSubtract', name: 'Num-', category: 'numpad', minecraft: 'key.keyboard.keypad.subtract' },
  NumpadMultiply: { code: 'NumpadMultiply', name: 'Num*', category: 'numpad', minecraft: 'key.keyboard.keypad.multiply' },
  NumpadDivide: { code: 'NumpadDivide', name: 'Num/', category: 'numpad', minecraft: 'key.keyboard.keypad.divide' },
  NumpadDecimal: { code: 'NumpadDecimal', name: 'Num.', category: 'numpad', minecraft: 'key.keyboard.keypad.decimal' },
  NumpadEnter: { code: 'NumpadEnter', name: 'NumEnter', category: 'numpad', minecraft: 'key.keyboard.keypad.enter' },
  NumLock: { code: 'NumLock', name: 'NumLock', category: 'numpad', minecraft: 'key.keyboard.num.lock' },

  // ========== 編集キー ==========
  Insert: { code: 'Insert', name: 'Ins', category: 'editing', minecraft: 'key.keyboard.insert' },
  Delete: { code: 'Delete', name: 'Del', category: 'editing', minecraft: 'key.keyboard.delete' },
  Backspace: { code: 'Backspace', name: 'Back', category: 'editing', position: { row: 0, col: 13 }, size: { width: 2 }, minecraft: 'key.keyboard.backspace' },

  // ========== 記号・特殊キー ==========
  Space: { code: 'Space', name: 'Space', category: 'special', position: { row: 4, col: 3 }, size: { width: 6 }, minecraft: 'key.keyboard.space' },
  Enter: { code: 'Enter', name: 'Enter', category: 'special', position: { row: 2, col: 13 }, size: { width: 2 }, minecraft: 'key.keyboard.enter' },
  Tab: { code: 'Tab', name: 'Tab', category: 'special', position: { row: 1, col: 0 }, size: { width: 1.5 }, minecraft: 'key.keyboard.tab' },
  Escape: { code: 'Escape', name: 'Esc', category: 'special', minecraft: 'key.keyboard.escape' },
  CapsLock: { code: 'CapsLock', name: 'Caps', category: 'special', position: { row: 2, col: 0 }, size: { width: 1.75 }, minecraft: 'key.keyboard.caps.lock' },
  ContextMenu: { code: 'ContextMenu', name: 'Menu', category: 'special', minecraft: 'key.keyboard.menu' },
  PrintScreen: { code: 'PrintScreen', name: 'PrtSc', category: 'special', minecraft: 'key.keyboard.print.screen' },
  ScrollLock: { code: 'ScrollLock', name: 'ScrLk', category: 'special', minecraft: 'key.keyboard.scroll.lock' },
  Pause: { code: 'Pause', name: 'Pause', category: 'special', minecraft: 'key.keyboard.pause' },

  // 記号キー
  Backquote: { code: 'Backquote', name: '`', category: 'symbol', position: { row: 0, col: 0 }, minecraft: 'key.keyboard.grave.accent' },
  Minus: { code: 'Minus', name: '-', category: 'symbol', position: { row: 0, col: 11 }, minecraft: 'key.keyboard.minus' },
  Equal: { code: 'Equal', name: '=', category: 'symbol', position: { row: 0, col: 12 }, minecraft: 'key.keyboard.equal' },
  BracketLeft: { code: 'BracketLeft', name: '[', category: 'symbol', position: { row: 1, col: 11 }, minecraft: 'key.keyboard.left.bracket' },
  BracketRight: { code: 'BracketRight', name: ']', category: 'symbol', position: { row: 1, col: 12 }, minecraft: 'key.keyboard.right.bracket' },
  Backslash: { code: 'Backslash', name: '\\', category: 'symbol', position: { row: 1, col: 13 }, minecraft: 'key.keyboard.backslash' },
  Semicolon: { code: 'Semicolon', name: ';', category: 'symbol', position: { row: 2, col: 10 }, minecraft: 'key.keyboard.semicolon' },
  Quote: { code: 'Quote', name: "'", category: 'symbol', position: { row: 2, col: 11 }, minecraft: 'key.keyboard.apostrophe' },
  Comma: { code: 'Comma', name: ',', category: 'symbol', position: { row: 3, col: 8 }, minecraft: 'key.keyboard.comma' },
  Period: { code: 'Period', name: '.', category: 'symbol', position: { row: 3, col: 9 }, minecraft: 'key.keyboard.period' },
  Slash: { code: 'Slash', name: '/', category: 'symbol', position: { row: 3, col: 10 }, minecraft: 'key.keyboard.slash' },

  // ========== JIS専用キー ==========
  IntlRo: { code: 'IntlRo', name: 'ろ', category: 'jis-specific', minecraft: 'key.keyboard.world.1' },
  IntlYen: { code: 'IntlYen', name: '¥', category: 'jis-specific', minecraft: 'key.keyboard.world.2' },
  NonConvert: { code: 'NonConvert', name: '無変換', category: 'jis-specific', position: { row: 4, col: 3 }, minecraft: 'key.keyboard.nonconvert' },
  Convert: { code: 'Convert', name: '変換', category: 'jis-specific', position: { row: 4, col: 7 }, minecraft: 'key.keyboard.convert' },
  KanaMode: { code: 'KanaMode', name: 'カナ', category: 'jis-specific', minecraft: 'key.keyboard.kana' },

  // ========== マウスボタン ==========
  Mouse0: { code: 'Mouse0', name: 'L', category: 'mouse', minecraft: 'key.mouse.left' },
  Mouse1: { code: 'Mouse1', name: 'R', category: 'mouse', minecraft: 'key.mouse.right' },
  Mouse2: { code: 'Mouse2', name: 'MButton', category: 'mouse', minecraft: 'key.mouse.middle' },
  Mouse3: { code: 'Mouse3', name: 'MB4', category: 'mouse', minecraft: 'key.mouse.4' },
  Mouse4: { code: 'Mouse4', name: 'MB5', category: 'mouse', minecraft: 'key.mouse.5' },
  Mouse5: { code: 'Mouse5', name: 'MB6', category: 'mouse', minecraft: 'key.mouse.6' },
  Mouse6: { code: 'Mouse6', name: 'MB7', category: 'mouse', minecraft: 'key.mouse.7' },
  Mouse7: { code: 'Mouse7', name: 'MB8', category: 'mouse', minecraft: 'key.mouse.8' },

  // ========== 特殊値 ==========
  Disabled: { code: 'Disabled', name: '✕', category: 'special', minecraft: 'key.keyboard.disabled' },
};

/**
 * コードから定義を取得
 */
export function getKeyDefinition(code: string): KeyDefinition | undefined {
  return KEYS[code];
}

/**
 * カテゴリで絞り込み
 */
export function getKeysByCategory(category: KeyCategory): KeyDefinition[] {
  return Object.values(KEYS).filter(key => key.category === category);
}

/**
 * 表示名から検索（あいまい検索）
 */
export function searchKeysByName(query: string): KeyDefinition[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(KEYS).filter(key =>
    key.name.toLowerCase().includes(lowerQuery) ||
    key.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 全キーコードリストを取得
 */
export function getAllKeyCodes(): string[] {
  return Object.keys(KEYS);
}
