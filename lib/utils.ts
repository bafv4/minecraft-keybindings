import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 振り向き距離（cm/360）を計算する
 * @param dpi マウスDPI
 * @param gameSensitivity ゲーム内感度 (0-200)
 * @param windowsSpeed Windows感度 (1-11、デフォルト6)
 * @returns 360度回転に必要な距離（cm）
 */
export function calculateCm360(
  dpi: number,
  gameSensitivity: number,
  windowsSpeed: number = 6
): number {
  // Windows感度補正（6/11が1.0倍）
  const windowsMultiplier = windowsSpeed <= 6
    ? windowsSpeed / 6
    : 1 + (windowsSpeed - 6) / 5;

  // Minecraftの感度計算（0-200%の範囲を0-2.0に変換）
  const mcSensitivity = gameSensitivity / 100;

  // 360度回転に必要なマウス移動距離（インチ）
  // Minecraftの感度係数は0.15
  const inches360 = (360 / 0.15) / (dpi * mcSensitivity * windowsMultiplier);

  // インチをcmに変換
  return Number((inches360 * 2.54).toFixed(2));
}

/**
 * キー名を人間が読みやすい形式に変換
 * @param key Minecraftのキー名（例: "key.keyboard.w"）
 * @returns 表示用のキー名（例: "W"）
 */
export function formatKeyName(key: string): string {
  if (!key) return "";

  // "key.keyboard." または "key.mouse." を削除
  const cleanKey = key
    .replace("key.keyboard.", "")
    .replace("key.mouse.", "");

  // 特殊キーの変換
  const keyMap: Record<string, string> = {
    "space": "Space",
    "left.shift": "L-Shift",
    "right.shift": "R-Shift",
    "left.control": "L-Ctrl",
    "right.control": "R-Ctrl",
    "left.alt": "L-Alt",
    "right.alt": "R-Alt",
    "caps.lock": "Caps Lock",
    "tab": "Tab",
    "escape": "Esc",
    "enter": "Enter",
    "backspace": "Backspace",
    "left": "Mouse Left",
    "right": "Mouse Right",
    "middle": "Mouse Middle",
  };

  return keyMap[cleanKey] || cleanKey.toUpperCase();
}

/**
 * Minecraft UUIDにハイフンを追加
 * @param uuid ハイフンなしのUUID
 * @returns ハイフン付きUUID
 */
export function formatUUID(uuid: string): string {
  if (uuid.includes("-")) return uuid;

  return [
    uuid.substring(0, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16),
    uuid.substring(16, 20),
    uuid.substring(20, 32),
  ].join("-");
}
