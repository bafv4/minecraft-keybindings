import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Windows速度に応じたDPI係数テーブル
 */
const WINDOWS_SPEED_MULTIPLIERS: Record<number, number> = {
  1: 0.03125,
  2: 0.0625,
  3: 0.125,
  4: 0.25,
  5: 0.375,
  6: 0.5,
  7: 0.625,
  8: 0.75,
  9: 0.875,
  10: 1,
  11: 1.25,
  12: 1.5,
  13: 1.75,
  14: 2,
  15: 2.25,
  16: 2.5,
  17: 2.75,
  18: 3,
  19: 3.25,
  20: 3.5,
};

/**
 * カーソル速度（実効DPI）を計算する
 * @param dpi マウスDPI
 * @param windowsSpeed Windows感度 (1-20、デフォルト10)
 * @param rawInput RawInput使用の有無（デフォルトtrue）
 * @param mouseAcceleration マウス加速の有無（デフォルトfalse）
 * @returns 実効DPI（小数点以下切り捨て）、計算不可の場合はnull
 */
export function calculateCursorSpeed(
  dpi: number,
  windowsSpeed: number = 10,
  rawInput: boolean = true,
  mouseAcceleration: boolean = false
): number | null {
  // マウス加速が有効の場合、カーソル速度は計算できない
  if (mouseAcceleration) {
    return null;
  }

  // RawInputの状態に関わらず、DPIにWindows速度の係数をかける
  const multiplier = WINDOWS_SPEED_MULTIPLIERS[windowsSpeed] ?? 1;
  return Math.floor(dpi * multiplier);
}

/**
 * 振り向き距離（cm/180）を計算する
 * @param dpi マウスDPI
 * @param gameSensitivity ゲーム内感度 (Options.txt形式: 0.0-1.0、4%の場合は0.02)
 * @param windowsSpeed Windows感度 (1-20、デフォルト10)
 * @param rawInput RawInput使用の有無（デフォルトtrue）
 * @param mouseAcceleration マウス加速の有無（デフォルトfalse）
 * @returns 180度回転に必要な距離（cm）、計算不可の場合はnull
 */
export function calculateCm360(
  dpi: number,
  gameSensitivity: number,
  windowsSpeed: number = 10,
  rawInput: boolean = true,
  mouseAcceleration: boolean = false
): number | null {
  // マウス加速が有効かつRawInputが無効の場合、振り向きは計算できない
  if (mouseAcceleration && !rawInput) {
    return null;
  }

  // 感度はOptions.txt形式（0.0-1.0）で受け取る
  const sensitivity = gameSensitivity;

  // RawInputがオフの場合、DPIにWindows側の係数をかける
  let effectiveDpi = dpi;
  if (!rawInput) {
    const multiplier = WINDOWS_SPEED_MULTIPLIERS[windowsSpeed] ?? 1;
    effectiveDpi = dpi * multiplier;
  }

  // 計算式: 6096/(2 * [DPI] * 8 * (0.6 * [感度] + 0.2)^3)
  const cm360 = 6096 / (2 * effectiveDpi * 8 * Math.pow(0.6 * sensitivity + 0.2, 3));

  return Number(cm360.toFixed(2));
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

/**
 * 言語コードを言語名に変換
 * @param languageCode 言語コード（例: "ja_jp"）
 * @returns 言語名（例: "日本語"）
 */
export function getLanguageName(languageCode: string): string {
  const languageNames: { [key: string]: string } = {
    // 日本語・英語
    'ja_jp': '日本語',
    'en_us': 'English (US)',
    'en_gb': 'English (UK)',
    'en_ca': 'English (Canada)',
    'en_au': 'English (Australia)',
    'en_nz': 'English (New Zealand)',

    // ヨーロッパ言語
    'de_de': 'Deutsch',
    'de_at': 'Deutsch (Österreich)',
    'de_ch': 'Deutsch (Schweiz)',
    'es_es': 'Español (España)',
    'es_mx': 'Español (México)',
    'es_ar': 'Español (Argentina)',
    'es_cl': 'Español (Chile)',
    'es_uy': 'Español (Uruguay)',
    'es_ve': 'Español (Venezuela)',
    'fr_fr': 'Français',
    'fr_ca': 'Français (Canada)',
    'it_it': 'Italiano',
    'nl_nl': 'Nederlands',
    'nl_be': 'Nederlands (België)',
    'pl_pl': 'Polski',
    'pt_br': 'Português (Brasil)',
    'pt_pt': 'Português (Portugal)',
    'sv_se': 'Svenska',
    'da_dk': 'Dansk',
    'fi_fi': 'Suomi',
    'no_no': 'Norsk',
    'nb_no': 'Norsk bokmål',
    'nn_no': 'Norsk nynorsk',
    'is_is': 'Íslenska',

    // 東アジア言語
    'ko_kr': '한국어',
    'zh_cn': '简体中文',
    'zh_tw': '繁體中文',
    'zh_hk': '繁體中文（香港）',

    // スラブ語系
    'ru_ru': 'Русский',
    'uk_ua': 'Українська',
    'be_by': 'Беларуская',
    'bg_bg': 'Български',
    'cs_cz': 'Čeština',
    'sk_sk': 'Slovenčina',
    'sl_si': 'Slovenščina',
    'hr_hr': 'Hrvatski',
    'sr_sp': 'Српски',
    'mk_mk': 'Македонски',

    // その他ヨーロッパ
    'el_gr': 'Ελληνικά',
    'hu_hu': 'Magyar',
    'ro_ro': 'Română',
    'tr_tr': 'Türkçe',
    'et_ee': 'Eesti',
    'lv_lv': 'Latviešu',
    'lt_lt': 'Lietuvių',
    'ca_es': 'Català',
    'eu_es': 'Euskara',
    'gl_es': 'Galego',
    'cy_gb': 'Cymraeg',
    'ga_ie': 'Gaeilge',
    'gd_gb': 'Gàidhlig',
    'mt_mt': 'Malti',

    // 中東・アフリカ
    'ar_sa': 'العربية',
    'he_il': 'עברית',
    'fa_ir': 'فارسی',
    'af_za': 'Afrikaans',

    // 東南アジア
    'th_th': 'ภาษาไทย',
    'vi_vn': 'Tiếng Việt',
    'id_id': 'Bahasa Indonesia',
    'ms_my': 'Bahasa Melayu',
    'fil_ph': 'Filipino',
    'tl_ph': 'Tagalog',

    // アフリカ言語
    'yo_ng': 'Yorùbá',
    'so_so': 'Soomaali',
    'ast_es': 'Asturianu',

    // その他
    'eo_uy': 'Esperanto',
    'la_la': 'Latina',
  };

  return languageNames[languageCode.toLowerCase()] || languageCode;
}
