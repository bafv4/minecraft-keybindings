/**
 * サーチクラフト用のリマップユーティリティ
 * Web キーコードから文字への変換とリマップ処理を行う
 */

/**
 * Web キーコード（code）から表示用の文字列に変換
 * 例: KeyA → A, CtrlLeft → LCtrl, Digit1 → 1
 */
export function webCodeToChar(code: string): string {
  // 修飾キー
  if (code === 'ControlLeft') return 'LCtrl';
  if (code === 'ControlRight') return 'RCtrl';
  if (code === 'ShiftLeft') return 'LShift';
  if (code === 'ShiftRight') return 'RShift';
  if (code === 'AltLeft') return 'LAlt';
  if (code === 'AltRight') return 'RAlt';
  if (code === 'MetaLeft') return 'LWin';
  if (code === 'MetaRight') return 'RWin';

  // 通常のキー（KeyA → A）
  if (code.startsWith('Key')) {
    return code.replace('Key', '');
  }

  // 数字キー（Digit1 → 1）
  if (code.startsWith('Digit')) {
    return code.replace('Digit', '');
  }

  // ファンクションキー（F1, F2...）
  if (code.match(/^F\d+$/)) {
    return code;
  }

  // マウスボタン
  if (code === 'MouseLeft') return '左クリック';
  if (code === 'MouseRight') return '右クリック';
  if (code === 'MouseMiddle') return 'ホイール';
  if (code === 'Mouse4') return 'MB4';
  if (code === 'Mouse5') return 'MB5';

  // 特殊キー
  const specialKeys: Record<string, string> = {
    'Space': 'Space',
    'Enter': 'Enter',
    'Tab': 'Tab',
    'Backspace': 'Backspace',
    'Escape': 'Esc',
    'CapsLock': 'Caps',
    'Insert': 'Ins',
    'Delete': 'Del',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'PgUp',
    'PageDown': 'PgDn',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Minus': '-',
    'Equal': '=',
    'BracketLeft': '[',
    'BracketRight': ']',
    'Backslash': '\\',
    'Semicolon': ';',
    'Quote': "'",
    'Comma': ',',
    'Period': '.',
    'Slash': '/',
    'Backquote': '`',
  };

  return specialKeys[code] || code;
}

/**
 * 文字列から Web キーコードに逆変換
 * 例: A → KeyA, LCtrl → ControlLeft, 1 → Digit1
 */
export function charToWebCode(char: string): string {
  // 修飾キー
  if (char === 'LCtrl') return 'ControlLeft';
  if (char === 'RCtrl') return 'ControlRight';
  if (char === 'LShift') return 'ShiftLeft';
  if (char === 'RShift') return 'ShiftRight';
  if (char === 'LAlt') return 'AltLeft';
  if (char === 'RAlt') return 'AltRight';
  if (char === 'LWin') return 'MetaLeft';
  if (char === 'RWin') return 'MetaRight';

  // 通常のアルファベット（A → KeyA）
  if (char.match(/^[A-Z]$/)) {
    return `Key${char}`;
  }

  // 数字（1 → Digit1）
  if (char.match(/^[0-9]$/)) {
    return `Digit${char}`;
  }

  // ファンクションキー
  if (char.match(/^F\d+$/)) {
    return char;
  }

  // マウスボタン
  if (char === '左クリック') return 'MouseLeft';
  if (char === '右クリック') return 'MouseRight';
  if (char === 'ホイール') return 'MouseMiddle';
  if (char === 'MB4') return 'Mouse4';
  if (char === 'MB5') return 'Mouse5';

  // 特殊キー（逆マップ）
  const reverseSpecialKeys: Record<string, string> = {
    'Space': 'Space',
    'Enter': 'Enter',
    'Tab': 'Tab',
    'Backspace': 'Backspace',
    'Esc': 'Escape',
    'Caps': 'CapsLock',
    'Ins': 'Insert',
    'Del': 'Delete',
    'Home': 'Home',
    'End': 'End',
    'PgUp': 'PageUp',
    'PgDn': 'PageDown',
    '↑': 'ArrowUp',
    '↓': 'ArrowDown',
    '←': 'ArrowLeft',
    '→': 'ArrowRight',
    '-': 'Minus',
    '=': 'Equal',
    '[': 'BracketLeft',
    ']': 'BracketRight',
    '\\': 'Backslash',
    ';': 'Semicolon',
    "'": 'Quote',
    ',': 'Comma',
    '.': 'Period',
    '/': 'Slash',
    '`': 'Backquote',
  };

  return reverseSpecialKeys[char] || char;
}

/**
 * リマップマップを作成
 * @param remappings リマップ設定（Web 形式のキーコード）
 * @returns リマップ後の文字 → リマップ前の文字のマップ
 */
export function createRemapMap(remappings: Record<string, string>): Record<string, string> {
  const remapMap: Record<string, string> = {};

  // リマップされたキーをマップに追加
  for (const [sourceKey, targetKey] of Object.entries(remappings)) {
    const sourceChar = webCodeToChar(sourceKey);
    const targetChar = webCodeToChar(targetKey);

    // リマップ後 → リマップ前
    remapMap[targetChar] = sourceChar;
  }

  return remapMap;
}

/**
 * サーチ文字列からリマップ前のキーを特定
 * @param searchStr リマップ後の文字列（例: "abc", "LCtrl+Q"）
 * @param remapMap リマップマップ（リマップ後 → リマップ前）
 * @returns リマップ前のキー配列（Web キーコード形式）
 */
export function resolveSearchStrToKeys(
  searchStr: string,
  remapMap: Record<string, string>
): string[] {
  // 文字列を個別の文字に分割（+ で区切られている場合も考慮）
  const chars = searchStr.includes('+')
    ? searchStr.split('+').map(s => s.trim())
    : searchStr.split('');

  // 各文字をリマップ前のキーに変換
  const keys = chars.map(char => {
    // リマップマップに存在する場合はリマップ前のキーを返す
    const originalChar = remapMap[char] || char;
    // 文字を Web キーコードに変換
    return charToWebCode(originalChar);
  });

  return keys;
}

/**
 * Web キーコードからサーチ文字列を生成
 * @param keys Web キーコード配列
 * @param remappings リマップ設定
 * @returns サーチ文字列（リマップ後）
 */
export function createSearchStr(keys: string[], remappings: Record<string, string>): string {
  // 各キーをリマップ後の文字に変換
  const chars = keys.map(key => {
    // リマップが定義されている場合はリマップ後のキーを使用
    const remappedKey = remappings[key] || key;
    return webCodeToChar(remappedKey);
  });

  // 修飾キー（Ctrl, Shift, Alt）が含まれる場合は + で連結
  const hasModifier = chars.some(c =>
    c.includes('Ctrl') || c.includes('Shift') || c.includes('Alt') || c.includes('Win')
  );

  if (hasModifier) {
    return chars.join('+');
  }

  // 通常のキーは連結
  return chars.join('');
}
