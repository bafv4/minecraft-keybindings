/**
 * MinecraftキーコードをAutoHotKeyキーコードに変換するマッピング
 *
 * AutoHotKeyのキー表記規則：
 * - 文字・数字: そのまま小文字（a-z, 0-9）
 * - ファンクションキー: F1-F24
 * - 修飾キー: LShift, RShift, LControl/LCtrl, RControl/RCtrl, LAlt, RAlt, LWin, RWin
 * - 特殊キー: Space, Enter, Backspace, Tab, Escape, CapsLock
 * - 記号キー: そのまま（- = [ ] \ ; ' ` , . /）
 * - マウス: LButton, RButton, MButton, XButton1, XButton2
 */
const MINECRAFT_TO_AHK_MAP: { [key: string]: string } = {
  // 文字キー (A-Z) - AutoHotKeyでは小文字を使用
  'key.keyboard.a': 'a',
  'key.keyboard.b': 'b',
  'key.keyboard.c': 'c',
  'key.keyboard.d': 'd',
  'key.keyboard.e': 'e',
  'key.keyboard.f': 'f',
  'key.keyboard.g': 'g',
  'key.keyboard.h': 'h',
  'key.keyboard.i': 'i',
  'key.keyboard.j': 'j',
  'key.keyboard.k': 'k',
  'key.keyboard.l': 'l',
  'key.keyboard.m': 'm',
  'key.keyboard.n': 'n',
  'key.keyboard.o': 'o',
  'key.keyboard.p': 'p',
  'key.keyboard.q': 'q',
  'key.keyboard.r': 'r',
  'key.keyboard.s': 's',
  'key.keyboard.t': 't',
  'key.keyboard.u': 'u',
  'key.keyboard.v': 'v',
  'key.keyboard.w': 'w',
  'key.keyboard.x': 'x',
  'key.keyboard.y': 'y',
  'key.keyboard.z': 'z',

  // 数字キー (0-9)
  'key.keyboard.0': '0',
  'key.keyboard.1': '1',
  'key.keyboard.2': '2',
  'key.keyboard.3': '3',
  'key.keyboard.4': '4',
  'key.keyboard.5': '5',
  'key.keyboard.6': '6',
  'key.keyboard.7': '7',
  'key.keyboard.8': '8',
  'key.keyboard.9': '9',

  // ファンクションキー (F1-F24)
  'key.keyboard.f1': 'F1',
  'key.keyboard.f2': 'F2',
  'key.keyboard.f3': 'F3',
  'key.keyboard.f4': 'F4',
  'key.keyboard.f5': 'F5',
  'key.keyboard.f6': 'F6',
  'key.keyboard.f7': 'F7',
  'key.keyboard.f8': 'F8',
  'key.keyboard.f9': 'F9',
  'key.keyboard.f10': 'F10',
  'key.keyboard.f11': 'F11',
  'key.keyboard.f12': 'F12',
  'key.keyboard.f13': 'F13',
  'key.keyboard.f14': 'F14',
  'key.keyboard.f15': 'F15',
  'key.keyboard.f16': 'F16',
  'key.keyboard.f17': 'F17',
  'key.keyboard.f18': 'F18',
  'key.keyboard.f19': 'F19',
  'key.keyboard.f20': 'F20',
  'key.keyboard.f21': 'F21',
  'key.keyboard.f22': 'F22',
  'key.keyboard.f23': 'F23',
  'key.keyboard.f24': 'F24',

  // 修飾キー
  'key.keyboard.left.shift': 'LShift',
  'key.keyboard.right.shift': 'RShift',
  'key.keyboard.left.control': 'LControl',
  'key.keyboard.right.control': 'RControl',
  'key.keyboard.left.alt': 'LAlt',
  'key.keyboard.right.alt': 'RAlt',
  'key.keyboard.left.win': 'LWin',
  'key.keyboard.right.win': 'RWin',

  // 特殊キー
  'key.keyboard.space': 'Space',
  'key.keyboard.enter': 'Enter',
  'key.keyboard.backspace': 'Backspace',
  'key.keyboard.tab': 'Tab',
  'key.keyboard.escape': 'Escape',
  'key.keyboard.caps.lock': 'CapsLock',

  // 矢印キー
  'key.keyboard.up': 'Up',
  'key.keyboard.down': 'Down',
  'key.keyboard.left': 'Left',
  'key.keyboard.right': 'Right',

  // 移動・編集キー
  'key.keyboard.home': 'Home',
  'key.keyboard.end': 'End',
  'key.keyboard.page.up': 'PgUp',
  'key.keyboard.page.down': 'PgDn',
  'key.keyboard.insert': 'Insert',
  'key.keyboard.delete': 'Delete',

  // その他の特殊キー
  'key.keyboard.menu': 'AppsKey',
  'key.keyboard.print.screen': 'PrintScreen',
  'key.keyboard.scroll.lock': 'ScrollLock',
  'key.keyboard.pause': 'Pause',
  'key.keyboard.num.lock': 'NumLock',

  // テンキー
  'key.keyboard.keypad.0': 'Numpad0',
  'key.keyboard.keypad.1': 'Numpad1',
  'key.keyboard.keypad.2': 'Numpad2',
  'key.keyboard.keypad.3': 'Numpad3',
  'key.keyboard.keypad.4': 'Numpad4',
  'key.keyboard.keypad.5': 'Numpad5',
  'key.keyboard.keypad.6': 'Numpad6',
  'key.keyboard.keypad.7': 'Numpad7',
  'key.keyboard.keypad.8': 'Numpad8',
  'key.keyboard.keypad.9': 'Numpad9',
  'key.keyboard.keypad.divide': 'NumpadDiv',
  'key.keyboard.keypad.multiply': 'NumpadMult',
  'key.keyboard.keypad.subtract': 'NumpadSub',
  'key.keyboard.keypad.add': 'NumpadAdd',
  'key.keyboard.keypad.enter': 'NumpadEnter',
  'key.keyboard.keypad.decimal': 'NumpadDot',

  // 記号キー - AutoHotKeyではそのまま使える
  'key.keyboard.minus': '-',
  'key.keyboard.equal': '=',
  'key.keyboard.left.bracket': '[',
  'key.keyboard.right.bracket': ']',
  'key.keyboard.backslash': '\\',
  'key.keyboard.semicolon': ';',
  'key.keyboard.apostrophe': "'",
  'key.keyboard.grave.accent': '`',
  'key.keyboard.comma': ',',
  'key.keyboard.period': '.',
  'key.keyboard.slash': '/',

  // マウスボタン
  'key.mouse.left': 'LButton',
  'key.mouse.right': 'RButton',
  'key.mouse.middle': 'MButton',
  'key.mouse.4': 'XButton1',
  'key.mouse.5': 'XButton2',
};

/**
 * 任意の形式のキーコードをAutoHotKeyキーコードに変換
 * @param key Minecraft形式（key.keyboard.a）、Web形式（KeyA）、表示名（A）のいずれか
 * @returns AutoHotKeyキーコード（変換できない場合はそのまま返す）
 */
export function minecraftToAutoHotKey(key: string): string {
  if (!key) return '';

  // 1. Minecraft形式の場合は直接マッピングを参照
  const directMatch = MINECRAFT_TO_AHK_MAP[key.toLowerCase()];
  if (directMatch) {
    return directMatch;
  }

  // 2. Web形式の場合はKEYS定義を経由してMinecraft形式に変換
  // KEYS定義をインポートして使用
  try {
    const { KEYS } = require('./keys');
    const keyDef = KEYS[key];
    if (keyDef?.minecraft) {
      const ahkKey = MINECRAFT_TO_AHK_MAP[keyDef.minecraft.toLowerCase()];
      if (ahkKey) return ahkKey;
    }

    // 表示名からの検索も試行
    const keyDefByName = Object.values(KEYS).find((k: any) => k.name === key);
    if (keyDefByName && (keyDefByName as any).minecraft) {
      const ahkKey = MINECRAFT_TO_AHK_MAP[(keyDefByName as any).minecraft.toLowerCase()];
      if (ahkKey) return ahkKey;
    }
  } catch (e) {
    // KEYS定義が読み込めない場合はスキップ
  }

  // 3. Web形式を直接AutoHotKeyに変換するパターンマッチング
  // KeyA -> a, KeyB -> b のように単一文字の場合
  if (key.startsWith('Key') && key.length === 4) {
    return key.charAt(3).toLowerCase();
  }

  // Digit0-9 -> 0-9
  if (key.startsWith('Digit') && key.length === 6) {
    return key.charAt(5);
  }

  // ShiftLeft/ShiftRight -> LShift/RShift
  if (key === 'ShiftLeft') return 'LShift';
  if (key === 'ShiftRight') return 'RShift';
  if (key === 'ControlLeft') return 'LControl';
  if (key === 'ControlRight') return 'RControl';
  if (key === 'AltLeft') return 'LAlt';
  if (key === 'AltRight') return 'RAlt';
  if (key === 'MetaLeft' || key === 'OSLeft') return 'LWin';
  if (key === 'MetaRight' || key === 'OSRight') return 'RWin';

  // ファンクションキー F1-F24 はそのまま
  if (/^F(1[0-9]|2[0-4]|[1-9])$/.test(key)) {
    return key;
  }

  // 特殊キー
  const webToAhkSpecial: { [key: string]: string } = {
    'Space': 'Space',
    'Enter': 'Enter',
    'Backspace': 'Backspace',
    'Tab': 'Tab',
    'Escape': 'Escape',
    'CapsLock': 'CapsLock',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'PgUp',
    'PageDown': 'PgDn',
    'Insert': 'Insert',
    'Delete': 'Delete',
    'ContextMenu': 'AppsKey',
    'PrintScreen': 'PrintScreen',
    'ScrollLock': 'ScrollLock',
    'Pause': 'Pause',
    'NumLock': 'NumLock',
    // 記号キー
    'Minus': '-',
    'Equal': '=',
    'BracketLeft': '[',
    'BracketRight': ']',
    'Backslash': '\\',
    'Semicolon': ';',
    'Quote': "'",
    'Backquote': '`',
    'Comma': ',',
    'Period': '.',
    'Slash': '/',
    // テンキー
    'Numpad0': 'Numpad0',
    'Numpad1': 'Numpad1',
    'Numpad2': 'Numpad2',
    'Numpad3': 'Numpad3',
    'Numpad4': 'Numpad4',
    'Numpad5': 'Numpad5',
    'Numpad6': 'Numpad6',
    'Numpad7': 'Numpad7',
    'Numpad8': 'Numpad8',
    'Numpad9': 'Numpad9',
    'NumpadDivide': 'NumpadDiv',
    'NumpadMultiply': 'NumpadMult',
    'NumpadSubtract': 'NumpadSub',
    'NumpadAdd': 'NumpadAdd',
    'NumpadEnter': 'NumpadEnter',
    'NumpadDecimal': 'NumpadDot',
  };

  if (webToAhkSpecial[key]) {
    return webToAhkSpecial[key];
  }

  // マウスボタン (Mouse0 -> LButton など)
  if (key === 'Mouse0') return 'LButton';
  if (key === 'Mouse1') return 'RButton';
  if (key === 'Mouse2') return 'MButton';
  if (key === 'Mouse3') return 'XButton1';
  if (key === 'Mouse4') return 'XButton2';

  // 4. 変換できない場合はそのままベタ打ちで返す
  // AutoHotKeyは多くの特殊文字をそのまま認識できるため
  return key;
}

/**
 * リマップ設定からAutoHotKeyスクリプトを生成
 */
export function generateAutoHotKeyScript(
  remappings: { sourceKey: string; targetKey: string }[],
  selectedIndices?: Set<number>
): string {
  const lines: string[] = [];

  // ヘッダー
  lines.push('; AutoHotKey Remap Script');
  lines.push('; Generated by Minecraft Keybindings');
  lines.push('');
  lines.push('#NoEnv');
  lines.push('#SingleInstance Force');
  lines.push('#IfWinActive Minecraft');
  lines.push('');

  // リマップを追加
  remappings.forEach((remap, index) => {
    // 選択されていない場合はスキップ
    if (selectedIndices && !selectedIndices.has(index)) {
      return;
    }

    const sourceAhk = minecraftToAutoHotKey(remap.sourceKey);
    const targetAhk = minecraftToAutoHotKey(remap.targetKey);

    // 変換結果を出力（nullチェックは不要になった）
    lines.push(`${sourceAhk}::${targetAhk}`);
  });

  return lines.join('\n');
}

/**
 * AutoHotKeyスクリプトをファイルとしてダウンロード
 */
export function downloadAutoHotKeyScript(script: string, filename: string = 'minecraft_remap.ahk') {
  const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
