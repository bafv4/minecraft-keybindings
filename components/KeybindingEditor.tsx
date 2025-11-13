'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateCm360, calculateCursorSpeed } from '@/lib/utils';
import type { PlayerSettings, Finger, FingerAssignments } from '@/types/player';
import { VirtualKeyboard } from './VirtualKeyboard';

// Minecraft言語リスト（全言語）
const MINECRAFT_LANGUAGES = [
  { value: 'af_za', label: 'Afrikaans (Suid-Afrika)' },
  { value: 'ar_sa', label: 'العربية (السعودية)' },
  { value: 'ast_es', label: 'Asturianu (España)' },
  { value: 'az_az', label: 'Azərbaycanca (Azərbaycan)' },
  { value: 'ba_ru', label: 'Башҡортса (Россия)' },
  { value: 'bar', label: 'Bairisch' },
  { value: 'be_by', label: 'Беларуская (Беларусь)' },
  { value: 'bg_bg', label: 'Български (България)' },
  { value: 'br_fr', label: 'Brezhoneg (Frañs)' },
  { value: 'brb', label: 'Barbadian' },
  { value: 'bs_ba', label: 'Bosanski (Bosna i Hercegovina)' },
  { value: 'ca_es', label: 'Català (Espanya)' },
  { value: 'cs_cz', label: 'Čeština (Česko)' },
  { value: 'cy_gb', label: 'Cymraeg (Y Deyrnas Unedig)' },
  { value: 'da_dk', label: 'Dansk (Danmark)' },
  { value: 'de_at', label: 'Deutsch (Österreich)' },
  { value: 'de_ch', label: 'Deutsch (Schweiz)' },
  { value: 'de_de', label: 'Deutsch (Deutschland)' },
  { value: 'el_gr', label: 'Ελληνικά (Ελλάδα)' },
  { value: 'en_au', label: 'English (Australia)' },
  { value: 'en_ca', label: 'English (Canada)' },
  { value: 'en_gb', label: 'English (United Kingdom)' },
  { value: 'en_nz', label: 'English (New Zealand)' },
  { value: 'en_pt', label: 'English (Pirate Speak)' },
  { value: 'en_ud', label: 'English (Upside Down)' },
  { value: 'en_us', label: 'English (United States)' },
  { value: 'enp', label: 'English (Anglish)' },
  { value: 'enws', label: 'English (Early Modern)' },
  { value: 'eo_uy', label: 'Esperanto (Urugvajo)' },
  { value: 'es_ar', label: 'Español (Argentina)' },
  { value: 'es_cl', label: 'Español (Chile)' },
  { value: 'es_ec', label: 'Español (Ecuador)' },
  { value: 'es_es', label: 'Español (España)' },
  { value: 'es_mx', label: 'Español (México)' },
  { value: 'es_uy', label: 'Español (Uruguay)' },
  { value: 'es_ve', label: 'Español (Venezuela)' },
  { value: 'et_ee', label: 'Eesti (Eesti)' },
  { value: 'eu_es', label: 'Euskara (Espainia)' },
  { value: 'fa_ir', label: 'فارسی (ایران)' },
  { value: 'fi_fi', label: 'Suomi (Suomi)' },
  { value: 'fil_ph', label: 'Filipino (Pilipinas)' },
  { value: 'fo_fo', label: 'Føroyskt (Føroyar)' },
  { value: 'fr_ca', label: 'Français (Canada)' },
  { value: 'fr_fr', label: 'Français (France)' },
  { value: 'fra_de', label: 'Fränkisch (Deutschland)' },
  { value: 'fur_it', label: 'Furlan (Italie)' },
  { value: 'fy_nl', label: 'Frysk (Nederlân)' },
  { value: 'ga_ie', label: 'Gaeilge (Éire)' },
  { value: 'gd_gb', label: 'Gàidhlig (An Rìoghachd Aonaichte)' },
  { value: 'gl_es', label: 'Galego (España)' },
  { value: 'haw_us', label: 'ʻŌlelo Hawaiʻi (ʻAmelika Hui Pū ʻIa)' },
  { value: 'he_il', label: 'עברית (ישראל)' },
  { value: 'hi_in', label: 'हिन्दी (भारत)' },
  { value: 'hr_hr', label: 'Hrvatski (Hrvatska)' },
  { value: 'hu_hu', label: 'Magyar (Magyarország)' },
  { value: 'hy_am', label: 'Հայերեն (Հայաստան)' },
  { value: 'id_id', label: 'Bahasa Indonesia (Indonesia)' },
  { value: 'ig_ng', label: 'Igbo (Naịjịrịa)' },
  { value: 'io_en', label: 'Ido (Anglia)' },
  { value: 'is_is', label: 'Íslenska (Ísland)' },
  { value: 'isv', label: 'Interslavic' },
  { value: 'it_it', label: 'Italiano (Italia)' },
  { value: 'ja_jp', label: '日本語 (日本)' },
  { value: 'jbo_en', label: 'la .lojban. (lb\'anglia)' },
  { value: 'ka_ge', label: 'ქართული (საქართველო)' },
  { value: 'kk_kz', label: 'Қазақша (Қазақстан)' },
  { value: 'kn_in', label: 'ಕನ್ನಡ (ಭಾರತ)' },
  { value: 'ko_kr', label: '한국어 (대한민국)' },
  { value: 'ksh', label: 'Kölsch' },
  { value: 'kw_gb', label: 'Kernewek (Rywvaneth Unys)' },
  { value: 'la_la', label: 'Latina (Imperium Romanum)' },
  { value: 'lb_lu', label: 'Lëtzebuergesch (Lëtzebuerg)' },
  { value: 'li_li', label: 'Limburgs (Limburg)' },
  { value: 'lmo', label: 'Lombard' },
  { value: 'lt_lt', label: 'Lietuvių (Lietuva)' },
  { value: 'lv_lv', label: 'Latviešu (Latvija)' },
  { value: 'lzh', label: '文言 (華夏)' },
  { value: 'mk_mk', label: 'Македонски (Македонија)' },
  { value: 'mn_mn', label: 'Монгол (Монгол Улс)' },
  { value: 'ms_my', label: 'Bahasa Melayu (Malaysia)' },
  { value: 'mt_mt', label: 'Malti (Malta)' },
  { value: 'nds_de', label: 'Plattdüütsch (Düütschland)' },
  { value: 'nl_be', label: 'Nederlands (België)' },
  { value: 'nl_nl', label: 'Nederlands (Nederland)' },
  { value: 'nn_no', label: 'Norsk nynorsk (Noreg)' },
  { value: 'no_no', label: 'Norsk bokmål (Norge)' },
  { value: 'oc_fr', label: 'Occitan (França)' },
  { value: 'ovd', label: 'Övdalsk' },
  { value: 'pl_pl', label: 'Polski (Polska)' },
  { value: 'pt_br', label: 'Português (Brasil)' },
  { value: 'pt_pt', label: 'Português (Portugal)' },
  { value: 'qya_aa', label: 'Quenya (Arda)' },
  { value: 'ro_ro', label: 'Română (România)' },
  { value: 'rpr', label: 'Ripoarisch' },
  { value: 'ru_ru', label: 'Русский (Россия)' },
  { value: 'se_no', label: 'Davvisámegiella (Norga)' },
  { value: 'sk_sk', label: 'Slovenčina (Slovensko)' },
  { value: 'sl_si', label: 'Slovenščina (Slovenija)' },
  { value: 'so_so', label: 'Soomaaliga (Soomaaliya)' },
  { value: 'sq_al', label: 'Shqip (Shqipëri)' },
  { value: 'sr_sp', label: 'Српски (Србија)' },
  { value: 'sv_se', label: 'Svenska (Sverige)' },
  { value: 'sxu', label: 'Saksisch' },
  { value: 'szl', label: 'Ślōnskŏ gŏdka' },
  { value: 'ta_in', label: 'தமிழ் (இந்தியா)' },
  { value: 'th_th', label: 'ไทย (ประเทศไทย)' },
  { value: 'tl_ph', label: 'Tagalog (Pilipinas)' },
  { value: 'tlh_aa', label: 'tlhIngan Hol (tlhIngan wo\')' },
  { value: 'tok', label: 'toki pona' },
  { value: 'tr_tr', label: 'Türkçe (Türkiye)' },
  { value: 'tt_ru', label: 'Татарча (Россия)' },
  { value: 'uk_ua', label: 'Українська (Україна)' },
  { value: 'val_es', label: 'Valencià (Espanya)' },
  { value: 'vec_it', label: 'Vèneto (Itàlia)' },
  { value: 'vi_vn', label: 'Tiếng Việt (Việt Nam)' },
  { value: 'yi_de', label: 'ייִדיש (דײַטשלאַנד)' },
  { value: 'yo_ng', label: 'Yorùbá (Nàìjíríà)' },
  { value: 'zh_cn', label: '简体中文 (中国大陆)' },
  { value: 'zh_hk', label: '繁體中文 (香港)' },
  { value: 'zh_tw', label: '繁體中文 (台灣)' },
  { value: 'zlm_arab', label: 'بهاس ملايو (مليسيا)' },
];

interface KeybindingEditorProps {
  initialSettings?: PlayerSettings;
  uuid: string;
  mcid: string;
  displayName: string;
}

export function KeybindingEditor({ initialSettings, uuid, mcid, displayName: initialDisplayName }: KeybindingEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [syncingMcid, setSyncingMcid] = useState(false);

  // ユーザー情報
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [currentMcid, setCurrentMcid] = useState(mcid);
  const [keyboardLayout, setKeyboardLayout] = useState<'JIS' | 'US'>(
    (initialSettings?.keyboardLayout as 'JIS' | 'US') || 'JIS'
  );

  // マウス設定
  const [mouseDpi, setMouseDpi] = useState(initialSettings?.mouseDpi?.toString() || '');
  // 感度: %形式とOptions.txt形式の両方の入力欄を用意
  const [sensitivityPercent, setSensitivityPercent] = useState(
    initialSettings?.gameSensitivity
      ? (Number(initialSettings.gameSensitivity) * 200).toString() // DB値(0.0-1.0)を%表示(0-200)に変換
      : ''
  );
  const [sensitivityRaw, setSensitivityRaw] = useState(
    initialSettings?.gameSensitivity
      ? Number(initialSettings.gameSensitivity).toString() // DB値をそのまま表示
      : ''
  );
  const [windowsSpeed, setWindowsSpeed] = useState(initialSettings?.windowsSpeed?.toString() || '10');
  const [mouseAcceleration, setMouseAcceleration] = useState(initialSettings?.mouseAcceleration || false);
  const [rawInput, setRawInput] = useState(initialSettings?.rawInput ?? true);

  // プレイヤー環境設定
  const [gameLanguage, setGameLanguage] = useState(initialSettings?.gameLanguage || '');
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [mouseModel, setMouseModel] = useState(initialSettings?.mouseModel || '');
  const [keyboardModel, setKeyboardModel] = useState(initialSettings?.keyboardModel || '');
  const [notes, setNotes] = useState(initialSettings?.notes || '');

  // キーバインド（移動）
  const [forward, setForward] = useState(initialSettings?.forward || 'key.keyboard.w');
  const [back, setBack] = useState(initialSettings?.back || 'key.keyboard.s');
  const [left, setLeft] = useState(initialSettings?.left || 'key.keyboard.a');
  const [right, setRight] = useState(initialSettings?.right || 'key.keyboard.d');
  const [jump, setJump] = useState(initialSettings?.jump || 'key.keyboard.space');
  const [sneak, setSneak] = useState(initialSettings?.sneak || 'key.keyboard.left.shift');
  const [sprint, setSprint] = useState(initialSettings?.sprint || 'key.keyboard.left.control');

  // キーバインド（アクション）
  const [attack, setAttack] = useState(initialSettings?.attack || 'key.mouse.left');
  const [use, setUse] = useState(initialSettings?.use || 'key.mouse.right');
  const [pickBlock, setPickBlock] = useState(initialSettings?.pickBlock || 'key.mouse.middle');
  const [drop, setDrop] = useState(initialSettings?.drop || 'key.keyboard.q');

  // キーバインド（インベントリ）
  const [inventory, setInventory] = useState(initialSettings?.inventory || 'key.keyboard.e');
  const [swapHands, setSwapHands] = useState(initialSettings?.swapHands || 'key.keyboard.f');
  const [hotbar1, setHotbar1] = useState(initialSettings?.hotbar1 || 'key.keyboard.1');
  const [hotbar2, setHotbar2] = useState(initialSettings?.hotbar2 || 'key.keyboard.2');
  const [hotbar3, setHotbar3] = useState(initialSettings?.hotbar3 || 'key.keyboard.3');
  const [hotbar4, setHotbar4] = useState(initialSettings?.hotbar4 || 'key.keyboard.4');
  const [hotbar5, setHotbar5] = useState(initialSettings?.hotbar5 || 'key.keyboard.5');
  const [hotbar6, setHotbar6] = useState(initialSettings?.hotbar6 || 'key.keyboard.6');
  const [hotbar7, setHotbar7] = useState(initialSettings?.hotbar7 || 'key.keyboard.7');
  const [hotbar8, setHotbar8] = useState(initialSettings?.hotbar8 || 'key.keyboard.8');
  const [hotbar9, setHotbar9] = useState(initialSettings?.hotbar9 || 'key.keyboard.9');

  // キーバインド（ビュー・UI操作）
  const [togglePerspective, setTogglePerspective] = useState(initialSettings?.togglePerspective || 'key.keyboard.f5');
  const [fullscreen, setFullscreen] = useState(initialSettings?.fullscreen || 'key.keyboard.f11');
  const [chat, setChat] = useState(initialSettings?.chat || 'key.keyboard.t');
  const [command, setCommand] = useState(initialSettings?.command || 'key.keyboard.slash');
  const [toggleHud, setToggleHud] = useState(initialSettings?.toggleHud || 'key.keyboard.f1');

  // 追加設定（additionalSettings JSONフィールドから読み込み）
  const [reset, setReset] = useState(
    (initialSettings?.additionalSettings as { reset?: string })?.reset || 'key.keyboard.f6'
  );
  const [playerList, setPlayerList] = useState(
    (initialSettings?.additionalSettings as { playerList?: string })?.playerList || 'key.keyboard.tab'
  );

  // リマップとツール設定（オブジェクトとして管理）
  const [remappings, setRemappings] = useState<{ [key: string]: string }>(
    initialSettings?.remappings || {}
  );

  // 外部ツール設定を平坦化（key -> {tool, action, description}）
  const [externalTools, setExternalTools] = useState<{ [key: string]: { tool: string; action: string; description?: string } }>(() => {
    if (!initialSettings?.externalTools) return {};

    const flattened: { [key: string]: { tool: string; action: string; description?: string } } = {};
    Object.entries(initialSettings.externalTools).forEach(([toolName, config]) => {
      config.actions.forEach((actionDef) => {
        flattened[actionDef.trigger] = {
          tool: toolName,
          action: actionDef.action,
          description: actionDef.description,
        };
      });
    });
    return flattened;
  });

  // 指の割り当て設定
  const [fingerAssignments, setFingerAssignments] = useState<FingerAssignments>(
    initialSettings?.fingerAssignments || {}
  );

  // 指の色分け表示のトグル
  const [showFingerColors, setShowFingerColors] = useState(true);

  // %入力とOptions.txt入力を連動させるハンドラー
  const handleSensitivityPercentChange = (value: string) => {
    setSensitivityPercent(value);
    if (value) {
      const rawValue = Number(value) / 200;
      setSensitivityRaw(rawValue.toString());
    } else {
      setSensitivityRaw('');
    }
  };

  const handleSensitivityRawChange = (value: string) => {
    setSensitivityRaw(value);
    if (value) {
      const percentValue = Number(value) * 200;
      setSensitivityPercent(percentValue.toString());
    } else {
      setSensitivityPercent('');
    }
  };

  // 振り向き計算
  const cm360 = mouseDpi && sensitivityRaw
    ? calculateCm360(Number(mouseDpi), Number(sensitivityRaw), Number(windowsSpeed), rawInput, mouseAcceleration)
    : null;

  // 言語検索の絞り込み
  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) return MINECRAFT_LANGUAGES;
    const query = languageSearch.toLowerCase();
    return MINECRAFT_LANGUAGES.filter((lang) =>
      lang.label.toLowerCase().includes(query) || lang.value.toLowerCase().includes(query)
    );
  }, [languageSearch]);

  // 選択された言語のラベル取得
  const selectedLanguageLabel = useMemo(() => {
    const found = MINECRAFT_LANGUAGES.find((lang) => lang.value === gameLanguage);
    return found ? found.label : gameLanguage;
  }, [gameLanguage]);

  // ドロップダウン外クリック検知用のref
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  // 仮想キーボード用のバインディングマップ
  const bindings = {
    forward, back, left, right, jump, sneak, sprint,
    attack, use, pickBlock, drop,
    inventory, swapHands,
    hotbar1, hotbar2, hotbar3, hotbar4, hotbar5, hotbar6, hotbar7, hotbar8, hotbar9,
    togglePerspective, fullscreen, chat, command, toggleHud, playerList,
    reset,
  };

  // アクション名のラベル
  const getActionLabel = (action: string): string => {
    const labels: { [key: string]: string } = {
      forward: '前進', back: '後退', left: '左', right: '右',
      jump: 'ジャンプ', sneak: 'スニーク', sprint: 'ダッシュ',
      attack: '攻撃', use: '使う', pickBlock: 'ブロック選択', drop: 'ドロップ',
      inventory: 'インベントリ', swapHands: 'オフハンド',
      hotbar1: 'ホットバー1', hotbar2: 'ホットバー2', hotbar3: 'ホットバー3',
      hotbar4: 'ホットバー4', hotbar5: 'ホットバー5', hotbar6: 'ホットバー6',
      hotbar7: 'ホットバー7', hotbar8: 'ホットバー8', hotbar9: 'ホットバー9',
      togglePerspective: '視点変更', fullscreen: 'フルスクリーン', chat: 'チャット',
      command: 'コマンド', toggleHud: 'Hide HUD', playerList: 'プレイヤーリスト', reset: 'リセット',
    };
    return labels[action] || action;
  };

  // MCIDを手動同期
  const handleSyncMcid = async () => {
    setSyncingMcid(true);
    try {
      const response = await fetch(`/api/sync-mcid?uuid=${uuid}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync MCID');
      }

      if (result.updated) {
        setCurrentMcid(result.newMcid);
        alert(`MCIDが更新されました: ${result.oldMcid} → ${result.newMcid}`);
        router.refresh();
      } else {
        alert('MCIDは最新の状態です');
      }
    } catch (error) {
      console.error(error);
      alert('MCID同期に失敗しました');
    } finally {
      setSyncingMcid(false);
    }
  };

  // モーダルからの設定更新を処理
  const handleUpdateConfig = (keyCode: string, config: {
    action?: string;
    remap?: string;
    externalTool?: { tool: string; action: string; description?: string };
    finger?: Finger;
  }) => {
    console.log('handleUpdateConfig called:', { keyCode, config });

    // アクション割り当て
    if (config.action) {
      const setters: { [key: string]: (value: string) => void } = {
        forward: setForward, back: setBack, left: setLeft, right: setRight,
        jump: setJump, sneak: setSneak, sprint: setSprint,
        attack: setAttack, use: setUse, pickBlock: setPickBlock, drop: setDrop,
        inventory: setInventory, swapHands: setSwapHands,
        hotbar1: setHotbar1, hotbar2: setHotbar2, hotbar3: setHotbar3,
        hotbar4: setHotbar4, hotbar5: setHotbar5, hotbar6: setHotbar6,
        hotbar7: setHotbar7, hotbar8: setHotbar8, hotbar9: setHotbar9,
        togglePerspective: setTogglePerspective, fullscreen: setFullscreen,
        chat: setChat, command: setCommand, toggleHud: setToggleHud,
        playerList: setPlayerList, reset: setReset,
      };
      setters[config.action]?.(keyCode);
    }

    // リマップ設定
    if (config.remap !== undefined) {
      setRemappings(prev => {
        const updated = { ...prev };
        if (config.remap) {
          updated[keyCode] = config.remap;
        } else {
          delete updated[keyCode];
        }
        return updated;
      });
    }

    // 外部ツール設定
    if (config.externalTool !== undefined) {
      setExternalTools(prev => {
        const updated = { ...prev };
        if (config.externalTool && config.externalTool.tool) {
          // toolが存在すれば保存（actionは空でもOK - プリセットの場合）
          updated[keyCode] = config.externalTool;
        } else {
          delete updated[keyCode];
        }
        return updated;
      });
    }

    // 指の割り当て設定
    if (config.finger !== undefined) {
      setFingerAssignments(prev => {
        const updated = { ...prev };
        if (config.finger) {
          updated[keyCode] = config.finger;
        } else {
          delete updated[keyCode];
        }
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      // 外部ツールを平坦化形式から nested structure に変換
      const nestedExternalTools: { [toolName: string]: { actions: Array<{ trigger: string; action: string; description?: string }> } } = {};
      Object.entries(externalTools).forEach(([trigger, config]) => {
        const { tool, action, description } = config;
        if (!nestedExternalTools[tool]) {
          nestedExternalTools[tool] = { actions: [] };
        }
        nestedExternalTools[tool].actions.push({ trigger, action, description });
      });

      const data = {
        uuid, // UUIDを送信
        displayName, // 表示名を送信
        keyboardLayout, // キーボードレイアウトを送信

        // マウス設定
        mouseDpi: mouseDpi ? Number(mouseDpi) : null,
        gameSensitivity: sensitivityRaw ? Number(sensitivityRaw) : null,
        windowsSpeed: windowsSpeed ? Number(windowsSpeed) : null,
        mouseAcceleration,
        rawInput,
        cm360,

        // 移動
        forward,
        back,
        left,
        right,
        jump,
        sneak,
        sprint,

        // アクション
        attack,
        use,
        pickBlock,
        drop,

        // インベントリ
        inventory,
        swapHands,
        hotbar1,
        hotbar2,
        hotbar3,
        hotbar4,
        hotbar5,
        hotbar6,
        hotbar7,
        hotbar8,
        hotbar9,

        // ビュー・UI操作
        togglePerspective,
        fullscreen,
        chat,
        command,
        toggleHud,

        // リマップと外部ツール（空のオブジェクトの場合はnullに変換）
        remappings: Object.keys(remappings).length > 0 ? remappings : null,
        externalTools: Object.keys(nestedExternalTools).length > 0 ? nestedExternalTools : null,
        fingerAssignments: Object.keys(fingerAssignments).length > 0 ? fingerAssignments : null,

        // 追加設定（additionalSettings JSONフィールドに保存）
        additionalSettings: { reset, playerList },

        // プレイヤー環境設定
        gameLanguage: gameLanguage.trim() || undefined,
        mouseModel: mouseModel.trim() || undefined,
        keyboardModel: keyboardModel.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      console.log('Saving keybindings:', { remappings, externalTools, nestedExternalTools, fingerAssignments });

      const response = await fetch('/api/keybindings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // 現在のMCIDでリダイレクト
      router.push(`/player/${currentMcid}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/keybindings?uuid=${uuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete settings');
      }

      // 削除成功後、プレイヤーページにリダイレクト
      router.push(`/player/${currentMcid}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ユーザー情報 */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">ユーザー情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="表示名"
            type="text"
            value={displayName}
            onChange={setDisplayName}
            placeholder="表示名を入力"
          />
          <div className="flex flex-col gap-1">
            <label className="font-semibold">MCID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMcid}
                readOnly
                className="flex-1 min-w-0 px-3 py-2 border rounded bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleSyncMcid}
                disabled={syncingMcid}
                className="px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors whitespace-nowrap flex-shrink-0"
                title="Mojang APIから最新のMCIDを取得"
              >
                {syncingMcid ? '同期中...' : '同期'}
              </button>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              MinecraftでIDを変更した場合は同期ボタンで更新できます
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="font-semibold mb-2 block">キーボードレイアウト</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKeyboardLayout('JIS')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors font-medium ${
                keyboardLayout === 'JIS'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                  : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
              }`}
            >
              JIS (日本語)
            </button>
            <button
              type="button"
              onClick={() => setKeyboardLayout('US')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors font-medium ${
                keyboardLayout === 'US'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                  : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
              }`}
            >
              US (英語)
            </button>
          </div>
        </div>
      </section>

      {/* 仮想キーボード */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">キー配置設定</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">指の色分け表示</label>
            <button
              type="button"
              role="switch"
              aria-checked={showFingerColors}
              onClick={() => setShowFingerColors(!showFingerColors)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showFingerColors ? 'bg-blue-600' : 'bg-[rgb(var(--border))]'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showFingerColors ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
          キーをクリックして、操作の割り当て・指の割り当て・リマップ・外部ツールの設定を行えます
        </p>
        <VirtualKeyboard
          bindings={bindings}
          mode="edit"
          remappings={remappings}
          externalTools={externalTools}
          fingerAssignments={fingerAssignments}
          showFingerColors={showFingerColors}
          onUpdateConfig={handleUpdateConfig}
          keyboardLayout={keyboardLayout}
        />
      </section>

      {/* マウス設定 */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">マウス設定</h2>
        <div className="space-y-6">
          {/* DPI */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-base">DPI</label>
              <input
                type="number"
                value={mouseDpi}
                onChange={(e) => setMouseDpi(e.target.value)}
                className="w-32 px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))] text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="800"
              />
            </div>
            <input
              type="range"
              min="100"
              max="16000"
              step="50"
              value={mouseDpi || 800}
              onChange={(e) => setMouseDpi(e.target.value)}
              className="w-full h-2 bg-[rgb(var(--muted))] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))] mt-1">
              <span>100</span>
              <span>16000</span>
            </div>
          </div>

          {/* ゲーム内感度 */}
          <div>
            <label className="font-semibold mb-2 block">感度（ゲーム内）</label>

            {/* %入力 */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-base text-[rgb(var(--muted-foreground))]">% 表記</label>
                <input
                  type="number"
                  value={sensitivityPercent}
                  onChange={(e) => handleSensitivityPercentChange(e.target.value)}
                  className="w-32 px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))] text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="100"
                  min="0"
                  max="200"
                  step="1"
                />
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={sensitivityPercent || 100}
                onChange={(e) => handleSensitivityPercentChange(e.target.value)}
                className="w-full h-2 bg-[rgb(var(--muted))] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))] mt-1">
                <span>0%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Options.txt形式入力 */}
            <div className="pt-3 border-t border-[rgb(var(--border))]">
              <div className="flex justify-between items-center">
                <label className="text-base text-[rgb(var(--muted-foreground))]">Options.txt 形式</label>
                <input
                  type="number"
                  value={sensitivityRaw}
                  onChange={(e) => handleSensitivityRawChange(e.target.value)}
                  className="w-32 px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))] text-right font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.5"
                  min="0"
                  max="1"
                  step="0.001"
                />
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                範囲: 0.0 - 1.0（より細かい値で設定可能）
              </p>
            </div>
          </div>

          {/* RawInput */}
          <div className="flex items-center justify-between p-4 bg-[rgb(var(--muted))] rounded-lg">
            <div>
              <label className="font-semibold">RawInput</label>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                オフの場合、DPIにWindows速度の係数をかけます
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={rawInput}
              onClick={() => setRawInput(!rawInput)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                rawInput ? 'bg-blue-600' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  rawInput ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Windows速度 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-base">Windows速度</label>
              <input
                type="number"
                value={windowsSpeed}
                onChange={(e) => setWindowsSpeed(e.target.value)}
                className="w-32 px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))] text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="10"
                min="1"
                max="20"
              />
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={windowsSpeed || 10}
              onChange={(e) => setWindowsSpeed(e.target.value)}
              className="w-full h-2 bg-[rgb(var(--muted))] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))] mt-1">
              <span>1 (遅い)</span>
              <span>10 (標準)</span>
              <span>20 (速い)</span>
            </div>
          </div>

          {/* マウス加速 */}
          <div className="flex items-center justify-between p-4 bg-[rgb(var(--muted))] rounded-lg">
            <label htmlFor="mouseAccel" className="font-semibold">マウス加速</label>
            <button
              type="button"
              role="switch"
              aria-checked={mouseAcceleration}
              onClick={() => setMouseAcceleration(!mouseAcceleration)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mouseAcceleration ? 'bg-blue-600' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mouseAcceleration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 振り向き計算結果（常時表示） */}
        <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base">振り向き（cm/180°）</span>
            <span className="text-xl font-bold">
              {mouseDpi && sensitivityRaw && cm360 !== null
                ? `${cm360} cm`
                : mouseDpi && sensitivityRaw && cm360 === null
                ? '計算不可'
                : '未設定'}
            </span>
          </div>
          {mouseDpi && sensitivityRaw && cm360 === null && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              マウス加速が有効かつRawInputが無効のため計算できません
            </p>
          )}
          {(!mouseDpi || !sensitivityRaw) && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              DPIと感度を設定すると自動計算されます
            </p>
          )}
        </div>

        {/* カーソル速度（常時表示） */}
        <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base">カーソル速度</span>
            <span className="text-xl font-bold">
              {(() => {
                if (!mouseDpi) return '未設定';
                const cursorSpeed = calculateCursorSpeed(
                  Number(mouseDpi),
                  Number(windowsSpeed),
                  rawInput,
                  mouseAcceleration
                );
                return cursorSpeed !== null ? `${cursorSpeed} dpi` : '計算不可';
              })()}
            </span>
          </div>
          {!mouseDpi && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              DPIを設定すると自動計算されます
            </p>
          )}
          {mouseDpi && mouseAcceleration && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              マウス加速が有効のため計算できません
            </p>
          )}
        </div>
      </section>

      {/* プレイヤー環境設定 */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">プレイヤー環境設定</h2>

        <div className="space-y-4">
          {/* ゲーム内の言語 */}
          <div className="relative" ref={languageDropdownRef}>
            <label className="font-semibold text-base mb-2 block">ゲーム内の言語</label>
            <div className="relative">
              <input
                type="text"
                value={showLanguageDropdown ? languageSearch : selectedLanguageLabel}
                onChange={(e) => {
                  setLanguageSearch(e.target.value);
                  setGameLanguage(e.target.value);
                  if (!showLanguageDropdown) setShowLanguageDropdown(true);
                }}
                onFocus={() => {
                  setShowLanguageDropdown(true);
                  setLanguageSearch('');
                }}
                placeholder="言語を選択または入力"
                className="w-full px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))]"
              />
              {showLanguageDropdown && (
                <div className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => {
                          setGameLanguage(lang.value);
                          setShowLanguageDropdown(false);
                          setLanguageSearch('');
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--muted))] focus:bg-[rgb(var(--muted))] focus:outline-none"
                      >
                        {lang.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">
                      検索結果なし
                    </div>
                  )}
                </div>
              )}
            </div>
            {gameLanguage && (
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                現在の選択: {selectedLanguageLabel}
              </p>
            )}
          </div>

          {/* マウス */}
          <div>
            <label htmlFor="mouseModel" className="font-semibold text-base mb-2 block">マウス</label>
            <input
              id="mouseModel"
              type="text"
              value={mouseModel}
              onChange={(e) => setMouseModel(e.target.value)}
              placeholder="例: Logicool G Pro X Superlight"
              className="w-full px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))]"
            />
          </div>

          {/* キーボード */}
          <div>
            <label htmlFor="keyboardModel" className="font-semibold text-base mb-2 block">キーボード</label>
            <input
              id="keyboardModel"
              type="text"
              value={keyboardModel}
              onChange={(e) => setKeyboardModel(e.target.value)}
              placeholder="例: Keychron K8 Pro"
              className="w-full px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))]"
            />
          </div>

          {/* 自由使用欄 */}
          <div>
            <label htmlFor="notes" className="font-semibold text-base mb-2 block">自由使用欄</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="その他のメモや補足情報など"
              rows={4}
              className="w-full px-3 py-2 text-base border border-[rgb(var(--border))] rounded bg-[rgb(var(--background))] resize-y"
            />
          </div>
        </div>
      </section>

      {/* リマップと外部ツールは仮想キーボードのモーダルから設定可能 */}

      <div className="flex gap-4 justify-between">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          className="px-6 py-3 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          設定を削除
        </button>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))] max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">設定を削除しますか？</h3>
            <p className="text-[rgb(var(--muted-foreground))] mb-6">
              この操作は取り消せません。すべてのキーバインド設定が削除されます。
            </p>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-6 py-3 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                {deleting && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  compact = false,
  min,
  max,
  action,
  selectedAction,
  onSelectAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  compact?: boolean;
  min?: string;
  max?: string;
  action?: string;
  selectedAction?: string | null;
  onSelectAction?: (action: string) => void;
}) {
  const isSelected = action && selectedAction === action;

  return (
    <div className="flex flex-col gap-1">
      <label className={`font-semibold ${compact ? 'text-xs' : ''}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => action && onSelectAction?.(action)}
        placeholder={placeholder}
        min={min}
        max={max}
        readOnly={!!action}
        className={`px-3 border rounded focus:ring-1 outline-none ${compact ? 'py-1 text-sm' : 'py-2'} ${
          isSelected
            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500'
            : 'border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:ring-[rgb(var(--ring))]'
        } ${action ? 'cursor-pointer' : ''}`}
      />
    </div>
  );
}
