/**
 * キーコード変換ユーティリティ
 * Minecraft形式 ↔ Web標準形式の相互変換
 */

import { KEYS, type KeyDefinition } from './keys';

/**
 * Minecraft形式 → Web標準形式
 * @param mcKey Minecraft形式（例: "key.keyboard.w", "key.mouse.left"）
 * @returns Web標準形式（例: "KeyW", "Mouse0"）または元の値
 */
export function minecraftToWeb(mcKey: string): string {
  if (!mcKey) return mcKey;

  // 既にWeb標準形式の場合はそのまま返す
  if (!mcKey.startsWith('key.')) {
    return mcKey;
  }

  // KEYS定義から逆引き
  const foundKey = Object.values(KEYS).find(key => key.minecraft === mcKey);
  if (foundKey) {
    return foundKey.code;
  }

  // マッピングが見つからない場合の手動変換
  console.warn(`[keyConversion] No mapping found for Minecraft key: ${mcKey}`);

  // カスタムキーの処理
  if (mcKey.startsWith('key.custom.')) {
    // "key.custom.keyboard" → "CustomKeyboard" など
    const parts = mcKey.split('.');
    return parts.slice(2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  }

  // フォールバック: そのまま返す
  return mcKey;
}

/**
 * Web標準形式 → Minecraft形式（逆変換）
 * @param webKey Web標準形式（例: "KeyW", "Mouse0"）
 * @returns Minecraft形式（例: "key.keyboard.w", "key.mouse.left"）
 */
export function webToMinecraft(webKey: string): string {
  if (!webKey) return webKey;

  const keyDef = KEYS[webKey];
  if (keyDef?.minecraft) {
    return keyDef.minecraft;
  }

  // カスタムキーの逆変換
  if (webKey.startsWith('Custom')) {
    return `key.custom.${webKey.replace('Custom', '').toLowerCase()}`;
  }

  console.warn(`[keyConversion] No Minecraft mapping found for: ${webKey}`);
  return webKey;
}

/**
 * Web標準形式 → 表示名
 * @param code Web標準形式（例: "KeyW", "Mouse0", "ShiftLeft"）
 * @returns 表示名（例: "W", "マウス左", "左Shift"）
 */
export function formatKeyCode(code: string): string {
  if (!code) return '';

  const keyDef = KEYS[code];
  if (keyDef) {
    return keyDef.name;
  }

  // カスタムキーの処理
  if (code.startsWith('Custom')) {
    return code.replace('Custom', 'カスタム');
  }

  // 見つからない場合はそのまま返す
  console.warn(`[keyConversion] No key definition found for: ${code}`);
  return code;
}

/**
 * 表示名 → Web標準形式（逆引き）
 * @param name 表示名（例: "W", "マウス左", "左Shift"）
 * @returns Web標準形式（例: "KeyW", "Mouse0", "ShiftLeft"）またはnull
 */
export function parseKeyName(name: string): string | null {
  if (!name) return null;

  // 完全一致検索
  const foundKey = Object.values(KEYS).find(key => key.name === name);
  if (foundKey) {
    return foundKey.code;
  }

  // 大文字小文字を無視した検索
  const lowerName = name.toLowerCase();
  const foundKeyLower = Object.values(KEYS).find(
    key => key.name.toLowerCase() === lowerName
  );
  if (foundKeyLower) {
    return foundKeyLower.code;
  }

  return null;
}

/**
 * 旧Minecraft形式のJSONオブジェクトを新形式に一括変換
 * @param obj Minecraftキーコードを含むオブジェクト
 * @returns 新形式に変換されたオブジェクト
 */
export function convertMinecraftObject<T extends Record<string, any>>(
  obj: T
): T {
  const result: any = { ...obj };

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && value.startsWith('key.')) {
      result[key] = minecraftToWeb(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertMinecraftObject(value);
    }
  }

  return result as T;
}

/**
 * 配列内のMinecraft形式キーを一括変換
 * @param arr Minecraftキーコードの配列
 * @returns 新形式に変換された配列
 */
export function convertMinecraftArray(arr: string[]): string[] {
  return arr.map(minecraftToWeb);
}

/**
 * キーコードのバリデーション
 * @param code チェックするキーコード
 * @returns 有効なキーコードかどうか
 */
export function isValidKeyCode(code: string): boolean {
  // KEYS定義に存在するか
  if (KEYS[code]) {
    return true;
  }

  // カスタムキーのパターン
  if (code.startsWith('Custom')) {
    return true;
  }

  // Disabled特殊値
  if (code === 'Disabled') {
    return true;
  }

  return false;
}

/**
 * キーコードの正規化
 * - Minecraft形式が渡された場合は自動変換
 * - 既にWeb標準形式の場合はそのまま返す
 * @param key 任意の形式のキーコード
 * @returns 正規化されたWeb標準形式
 */
export function normalizeKeyCode(key: string): string {
  if (!key) return key;

  // Minecraft形式の場合は変換
  if (key.startsWith('key.')) {
    return minecraftToWeb(key);
  }

  // 既に正しい形式
  if (isValidKeyCode(key)) {
    return key;
  }

  // 表示名として解釈を試みる
  const parsed = parseKeyName(key);
  if (parsed) {
    return parsed;
  }

  // どの形式でもない場合はそのまま返す（カスタム値の可能性）
  return key;
}
