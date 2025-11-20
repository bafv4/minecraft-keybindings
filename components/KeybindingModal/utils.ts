import { REMAPPABLE_KEYS } from './constants';

// キーラベルを表示用にフォーマット
export function formatKeyLabel(keyCode: string): string {
  if (keyCode.startsWith('key.mouse.')) {
    const button = keyCode.replace('key.mouse.', '');
    if (button === 'left') return 'マウス左';
    if (button === 'right') return 'マウス右';
    if (button === 'middle') return 'マウスホイール';
    if (button === '4') return 'マウス4';
    if (button === '5') return 'マウス5';
    return button.toUpperCase();
  }

  if (keyCode.startsWith('key.keyboard.')) {
    const key = keyCode.replace('key.keyboard.', '');
    const specialKeys: { [key: string]: string } = {
      'left.shift': '左Shift',
      'right.shift': '右Shift',
      'left.control': '左Ctrl',
      'right.control': '右Ctrl',
      'left.alt': '左Alt',
      'right.alt': '右Alt',
      'space': 'スペース',
      'caps.lock': 'Caps Lock',
      'enter': 'Enter',
      'tab': 'Tab',
      'backspace': 'Backspace',
      'escape': 'Esc',
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→',
      'nonconvert': '無変換',
      'convert': '変換',
      'kana': 'かな',
      'comma': ',',
      'period': '.',
      'slash': '/',
      'semicolon': ';',
      'apostrophe': '\'',
      'left.bracket': '[',
      'right.bracket': ']',
      'minus': '-',
      'equal': '=',
      'grave.accent': '`',
      'backslash': '\\',
      'world.1': 'World 1',
      'world.2': 'World 2',
      'section': '§',
      'ae': 'æ',
      'oe': 'ø',
      'aa': 'å',
      'a.umlaut': 'ä',
      'o.umlaut': 'ö',
      'u.umlaut': 'ü',
      'eszett': 'ß',
      'e.acute': 'é',
      'e.grave': 'è',
      'a.grave': 'à',
      'c.cedilla': 'ç',
      'n.tilde': 'ñ',
      'disabled': '無効化',
      'insert': 'Insert',
      'delete': 'Delete',
      'home': 'Home',
      'end': 'End',
      'page.up': 'Page Up',
      'page.down': 'Page Down',
      'keypad.0': 'テンキー 0',
      'keypad.1': 'テンキー 1',
      'keypad.2': 'テンキー 2',
      'keypad.3': 'テンキー 3',
      'keypad.4': 'テンキー 4',
      'keypad.5': 'テンキー 5',
      'keypad.6': 'テンキー 6',
      'keypad.7': 'テンキー 7',
      'keypad.8': 'テンキー 8',
      'keypad.9': 'テンキー 9',
      'keypad.add': 'テンキー +',
      'keypad.subtract': 'テンキー -',
      'keypad.multiply': 'テンキー *',
      'keypad.divide': 'テンキー /',
      'keypad.decimal': 'テンキー .',
      'keypad.enter': 'テンキー Enter',
      'keypad.equal': 'テンキー =',
    };

    if (specialKeys[key]) return specialKeys[key];

    // F13-F20の処理
    if (key.match(/^f(1[3-9]|20)$/)) {
      return key.toUpperCase();
    }

    return key.toUpperCase();
  }

  return keyCode;
}

// キーコードからラベルを取得（REMAPPABLE_KEYSから検索）
export function getKeyLabel(keyCode: string): string {
  if (!keyCode) return '';

  // REMAPPABLE_KEYSから検索
  for (const keys of Object.values(REMAPPABLE_KEYS)) {
    const found = keys.find(k => k.value === keyCode);
    if (found) return found.label;
  }

  // 見つからなければformatKeyLabelを使用
  return formatKeyLabel(keyCode);
}
