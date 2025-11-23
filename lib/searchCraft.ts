/**
 * サーチクラフトのキー入力文字列をWeb形式のキーコード配列に変換
 *
 * 対応文字：
 * - アルファベット a-z, A-Z（大文字は小文字として扱う）→ KeyA, KeyB...
 * - 数字 0-9 → Digit0, Digit1...
 * - 特殊文字（å, ä, ö, é など）→ Char_<文字>
 * - スペースや制御文字は不可
 *
 * @param input ユーザーが入力した文字列（最大4文字）
 * @returns Web形式のキーコード配列（例：["KeyA", "Char_å", "KeyC", "KeyD"]）
 * @throws Error 対応していない文字が含まれている場合
 */
export function stringToKeyCodes(input: string): string[] {
  if (!input) return [];

  // 4文字制限
  if (input.length > 4) {
    throw new Error('文字列は4文字以内で入力してください');
  }

  const keyCodes: string[] = [];

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // スペースや制御文字は不可
    if (/\s/.test(char) || char.charCodeAt(0) < 32) {
      throw new Error(`文字 "${char}" は使用できません。スペースや制御文字は使用できません。`);
    }

    // アルファベット a-z, A-Z（大文字は小文字として扱う）
    if (/^[a-zA-Z]$/.test(char)) {
      keyCodes.push(`Key${char.toUpperCase()}`);
      continue;
    }

    // 数字 0-9
    if (/^[0-9]$/.test(char)) {
      keyCodes.push(`Digit${char}`);
      continue;
    }

    // その他の文字（特殊文字）は "Char_" プレフィックス付きで保存
    keyCodes.push(`Char_${char}`);
  }

  return keyCodes;
}

/**
 * Web形式のキーコード配列を文字列に逆変換
 *
 * @param keyCodes Web形式のキーコード配列
 * @returns 文字列（例：["KeyA", "Char_å", "KeyB"] → "aåb"）
 */
export function keyCodesToString(keyCodes: (string | null)[]): string {
  return keyCodes
    .filter((key): key is string => key !== null && key !== undefined && key !== '')
    .map(key => {
      // KeyA-Z → a-z
      if (key.startsWith('Key') && key.length === 4) {
        return key.charAt(3).toLowerCase();
      }

      // Digit0-9 → 0-9
      if (key.startsWith('Digit') && key.length === 6) {
        return key.charAt(5);
      }

      // Char_<文字> → <文字>
      if (key.startsWith('Char_') && key.length > 5) {
        return key.substring(5);
      }

      // 変換できない場合は空文字
      return '';
    })
    .join('');
}
