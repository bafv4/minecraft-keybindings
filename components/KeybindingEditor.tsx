'use client';

import { useState, Fragment, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Switch, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { TrashIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { calculateCm360, calculateCursorSpeed } from '@/lib/utils';
import type { PlayerSettings, Finger, FingerAssignments, CustomKey } from '@/types/player';
import { VirtualKeyboard } from './VirtualKeyboard';
import { ItemLayoutEditor } from './ItemLayoutEditor';
import { SearchCraftEditor, type SearchCraftEditorRef } from './SearchCraftEditor';
import { Input, Textarea, Button } from '@/components/ui';
import { Combobox } from '@/components/ui/Combobox';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { minecraftToWeb } from '@/lib/keyConversion';
import { MINECRAFT_LANGUAGES } from '@/lib/languages';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useBlockNavigation } from '@/hooks/useBlockNavigation';
import { DraftRestoreDialog } from './DraftRestoreDialog';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { AutoHotKeyExportDialog } from './AutoHotKeyExportDialog';

// キーボードレイアウトオプション
const KEYBOARD_LAYOUT_OPTIONS = [
  { value: 'JIS', label: 'JIS', description: '日本語配列フルサイズ' },
  { value: 'US', label: 'US', description: '英語配列フルサイズ' },
  { value: 'JIS-TKL', label: 'JIS (TKL)', description: '日本語配列テンキーレス' },
  { value: 'US-TKL', label: 'US (TKL)', description: '英語配列テンキーレス' },
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
  const [showAutoHotKeyDialog, setShowAutoHotKeyDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [syncingMcid, setSyncingMcid] = useState(false);
  const itemLayoutEditorRef = useRef<{ save: () => Promise<boolean> }>(null);
  const searchCraftEditorRef = useRef<SearchCraftEditorRef>(null);

  // ヘルパー関数: 配列を文字列に正規化（後方互換性のため）
  const normalizeKeyBinding = (value: string | string[] | undefined, defaultValue: string): string => {
    if (!value) return defaultValue;
    return Array.isArray(value) ? (value[0] || defaultValue) : value;
  };

  // ユーザー情報
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [currentMcid, setCurrentMcid] = useState(mcid);
  const [keyboardLayout, setKeyboardLayout] = useState<'JIS' | 'JIS-TKL' | 'US' | 'US-TKL'>(
    (initialSettings?.keyboardLayout as 'JIS' | 'JIS-TKL' | 'US' | 'US-TKL') || 'JIS'
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

  // ゲーム設定（移動）
  const [sprintMode, setSprintMode] = useState<'hold' | 'toggle'>(
    initialSettings?.toggleSprint === true ? 'toggle' : 'hold'
  );
  const [sneakMode, setSneakMode] = useState<'hold' | 'toggle'>(
    initialSettings?.toggleSneak === true ? 'toggle' : 'hold'
  );
  const [autoJump, setAutoJump] = useState(initialSettings?.autoJump ?? false);

  // プレイヤー環境設定
  const [gameLanguage, setGameLanguage] = useState(initialSettings?.gameLanguage || '');
  const [mouseModel, setMouseModel] = useState(initialSettings?.mouseModel || '');
  const [keyboardModel, setKeyboardModel] = useState(initialSettings?.keyboardModel || '');
  const [notes, setNotes] = useState(initialSettings?.notes || '');

  // キーバインド（移動）- 1アクション1キーのみ
  const [forward, setForward] = useState<string>(normalizeKeyBinding(initialSettings?.forward, 'key.keyboard.w'));
  const [back, setBack] = useState<string>(normalizeKeyBinding(initialSettings?.back, 'key.keyboard.s'));
  const [left, setLeft] = useState<string>(normalizeKeyBinding(initialSettings?.left, 'key.keyboard.a'));
  const [right, setRight] = useState<string>(normalizeKeyBinding(initialSettings?.right, 'key.keyboard.d'));
  const [jump, setJump] = useState<string>(normalizeKeyBinding(initialSettings?.jump, 'key.keyboard.space'));
  const [sneak, setSneak] = useState<string>(normalizeKeyBinding(initialSettings?.sneak, 'key.keyboard.left.shift'));
  const [sprint, setSprint] = useState<string>(normalizeKeyBinding(initialSettings?.sprint, 'key.keyboard.left.control'));

  // キーバインド（アクション）- 1アクション1キーのみ
  const [attack, setAttack] = useState<string>(normalizeKeyBinding(initialSettings?.attack, 'key.mouse.left'));
  const [use, setUse] = useState<string>(normalizeKeyBinding(initialSettings?.use, 'key.mouse.right'));
  const [pickBlock, setPickBlock] = useState<string>(normalizeKeyBinding(initialSettings?.pickBlock, 'key.mouse.middle'));
  const [drop, setDrop] = useState<string>(normalizeKeyBinding(initialSettings?.drop, 'key.keyboard.q'));

  // キーバインド（インベントリ）- 1アクション1キーのみ
  const [inventory, setInventory] = useState<string>(normalizeKeyBinding(initialSettings?.inventory, 'key.keyboard.e'));
  const [swapHands, setSwapHands] = useState<string>(normalizeKeyBinding(initialSettings?.swapHands, 'key.keyboard.f'));
  const [hotbar1, setHotbar1] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar1, 'key.keyboard.1'));
  const [hotbar2, setHotbar2] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar2, 'key.keyboard.2'));
  const [hotbar3, setHotbar3] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar3, 'key.keyboard.3'));
  const [hotbar4, setHotbar4] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar4, 'key.keyboard.4'));
  const [hotbar5, setHotbar5] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar5, 'key.keyboard.5'));
  const [hotbar6, setHotbar6] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar6, 'key.keyboard.6'));
  const [hotbar7, setHotbar7] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar7, 'key.keyboard.7'));
  const [hotbar8, setHotbar8] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar8, 'key.keyboard.8'));
  const [hotbar9, setHotbar9] = useState<string>(normalizeKeyBinding(initialSettings?.hotbar9, 'key.keyboard.9'));

  // キーバインド（ビュー・UI操作）- 1アクション1キーのみ
  const [togglePerspective, setTogglePerspective] = useState<string>(normalizeKeyBinding(initialSettings?.togglePerspective, 'key.keyboard.f5'));
  const [fullscreen, setFullscreen] = useState<string>(normalizeKeyBinding(initialSettings?.fullscreen, 'key.keyboard.f11'));
  const [chat, setChat] = useState<string>(normalizeKeyBinding(initialSettings?.chat, 'key.keyboard.t'));
  const [command, setCommand] = useState<string>(normalizeKeyBinding(initialSettings?.command, 'key.keyboard.slash'));
  const [toggleHud, setToggleHud] = useState<string>(normalizeKeyBinding(initialSettings?.toggleHud, 'key.keyboard.f1'));

  // 追加設定（additionalSettings JSONフィールドから読み込み）- 1アクション1キーのみ
  const [reset, setReset] = useState<string>(
    normalizeKeyBinding((initialSettings?.additionalSettings as { reset?: string | string[] })?.reset, 'key.keyboard.f6')
  );
  const [playerList, setPlayerList] = useState<string>(
    normalizeKeyBinding((initialSettings?.additionalSettings as { playerList?: string | string[] })?.playerList, 'key.keyboard.tab')
  );

  // リマップとツール設定（オブジェクトとして管理）
  const [remappings, setRemappings] = useState<{ [key: string]: string }>(() => {
    if (initialSettings && 'remappings' in initialSettings) {
      return (initialSettings.remappings as { [key: string]: string }) || {};
    }
    return {};
  });

  // 外部ツール設定（key -> action名）
  const [externalTools, setExternalTools] = useState<{ [key: string]: string }>(() => {
    if (initialSettings && 'externalTools' in initialSettings) {
      return (initialSettings.externalTools as { [key: string]: string }) || {};
    }
    return {};
  });

  // 指の割り当て設定（後方互換性のため、古い形式を配列に変換）
  const [fingerAssignments, setFingerAssignments] = useState<FingerAssignments>(() => {
    if (!initialSettings?.fingerAssignments) return {};

    const normalized: FingerAssignments = {};
    Object.entries(initialSettings.fingerAssignments).forEach(([key, value]) => {
      // 古い形式（単一の文字列）または新しい形式（配列）のどちらにも対応
      if (Array.isArray(value)) {
        normalized[key] = value;
      } else if (typeof value === 'string') {
        // 古い形式：文字列を配列に変換
        normalized[key] = [value as Finger];
      }
    });
    return normalized;
  });

  // カスタムキー設定
  const [customKeys, setCustomKeys] = useState<CustomKey[]>(
    (initialSettings?.additionalSettings as { customKeys?: { keys: CustomKey[] } })?.customKeys?.keys || []
  );

  // 指の色分け表示のトグル
  const [showFingerColors, setShowFingerColors] = useState(true);

  // ローカルストレージ関連
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<Date | null>(null);
  const [isRestoringDraft, setIsRestoringDraft] = useState(false);

  // ページ遷移警告関連
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Undo/Redo適用中フラグ（履歴の重複追加を防ぐ）
  const isApplyingHistoryRef = useRef(false);

  // 全てのフォームデータをまとめたオブジェクト（自動保存用）
  const formData = useMemo(() => ({
    displayName,
    keyboardLayout,
    mouseDpi,
    sensitivityPercent,
    sensitivityRaw,
    windowsSpeed,
    mouseAcceleration,
    rawInput,
    sprintMode,
    sneakMode,
    autoJump,
    gameLanguage,
    mouseModel,
    keyboardModel,
    notes,
    forward, back, left, right, jump, sneak, sprint,
    attack, use, pickBlock, drop,
    inventory, swapHands,
    hotbar1, hotbar2, hotbar3, hotbar4, hotbar5, hotbar6, hotbar7, hotbar8, hotbar9,
    togglePerspective, fullscreen, chat, command, toggleHud,
    reset, playerList,
    remappings,
    externalTools,
    fingerAssignments,
    customKeys,
  }), [
    displayName, keyboardLayout, mouseDpi, sensitivityPercent, sensitivityRaw, windowsSpeed,
    mouseAcceleration, rawInput, sprintMode, sneakMode, autoJump, gameLanguage, mouseModel,
    keyboardModel, notes, forward, back, left, right, jump, sneak, sprint, attack, use,
    pickBlock, drop, inventory, swapHands, hotbar1, hotbar2, hotbar3, hotbar4, hotbar5,
    hotbar6, hotbar7, hotbar8, hotbar9, togglePerspective, fullscreen, chat, command,
    toggleHud, reset, playerList, remappings, externalTools, fingerAssignments, customKeys,
  ]);

  // ローカルストレージキー（ユーザーごとに異なるキーを使用）
  const storageKey = `keybinding-draft-${uuid}`;

  // 自動保存フック
  const { load: loadDraft, clear: clearDraft } = useAutoSave({
    key: storageKey,
    data: formData,
    delay: 2000, // 2秒のデバウンス
    enabled: !isRestoringDraft, // 復元中は自動保存を無効化
  });

  // Undo/Redoフック
  const {
    state: historyState,
    set: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo({
    initialState: formData,
    maxHistorySize: 50,
  });

  // ページ遷移警告フック
  useBlockNavigation({
    when: hasUnsavedChanges,
    onBlock: () => {
      // ブロック時の処理（必要に応じて実装）
    },
  });

  // 下書きから復元する関数
  const restoreDraft = (draftData: any) => {
    setIsRestoringDraft(true);

    // 全てのstateを復元
    if (draftData.displayName !== undefined) setDisplayName(draftData.displayName);
    if (draftData.keyboardLayout !== undefined) setKeyboardLayout(draftData.keyboardLayout);
    if (draftData.mouseDpi !== undefined) setMouseDpi(draftData.mouseDpi);
    if (draftData.sensitivityPercent !== undefined) setSensitivityPercent(draftData.sensitivityPercent);
    if (draftData.sensitivityRaw !== undefined) setSensitivityRaw(draftData.sensitivityRaw);
    if (draftData.windowsSpeed !== undefined) setWindowsSpeed(draftData.windowsSpeed);
    if (draftData.mouseAcceleration !== undefined) setMouseAcceleration(draftData.mouseAcceleration);
    if (draftData.rawInput !== undefined) setRawInput(draftData.rawInput);
    if (draftData.sprintMode !== undefined) setSprintMode(draftData.sprintMode);
    if (draftData.sneakMode !== undefined) setSneakMode(draftData.sneakMode);
    if (draftData.autoJump !== undefined) setAutoJump(draftData.autoJump);
    if (draftData.gameLanguage !== undefined) setGameLanguage(draftData.gameLanguage);
    if (draftData.mouseModel !== undefined) setMouseModel(draftData.mouseModel);
    if (draftData.keyboardModel !== undefined) setKeyboardModel(draftData.keyboardModel);
    if (draftData.notes !== undefined) setNotes(draftData.notes);

    // キーバインド
    if (draftData.forward !== undefined) setForward(draftData.forward);
    if (draftData.back !== undefined) setBack(draftData.back);
    if (draftData.left !== undefined) setLeft(draftData.left);
    if (draftData.right !== undefined) setRight(draftData.right);
    if (draftData.jump !== undefined) setJump(draftData.jump);
    if (draftData.sneak !== undefined) setSneak(draftData.sneak);
    if (draftData.sprint !== undefined) setSprint(draftData.sprint);
    if (draftData.attack !== undefined) setAttack(draftData.attack);
    if (draftData.use !== undefined) setUse(draftData.use);
    if (draftData.pickBlock !== undefined) setPickBlock(draftData.pickBlock);
    if (draftData.drop !== undefined) setDrop(draftData.drop);
    if (draftData.inventory !== undefined) setInventory(draftData.inventory);
    if (draftData.swapHands !== undefined) setSwapHands(draftData.swapHands);
    if (draftData.hotbar1 !== undefined) setHotbar1(draftData.hotbar1);
    if (draftData.hotbar2 !== undefined) setHotbar2(draftData.hotbar2);
    if (draftData.hotbar3 !== undefined) setHotbar3(draftData.hotbar3);
    if (draftData.hotbar4 !== undefined) setHotbar4(draftData.hotbar4);
    if (draftData.hotbar5 !== undefined) setHotbar5(draftData.hotbar5);
    if (draftData.hotbar6 !== undefined) setHotbar6(draftData.hotbar6);
    if (draftData.hotbar7 !== undefined) setHotbar7(draftData.hotbar7);
    if (draftData.hotbar8 !== undefined) setHotbar8(draftData.hotbar8);
    if (draftData.hotbar9 !== undefined) setHotbar9(draftData.hotbar9);
    if (draftData.togglePerspective !== undefined) setTogglePerspective(draftData.togglePerspective);
    if (draftData.fullscreen !== undefined) setFullscreen(draftData.fullscreen);
    if (draftData.chat !== undefined) setChat(draftData.chat);
    if (draftData.command !== undefined) setCommand(draftData.command);
    if (draftData.toggleHud !== undefined) setToggleHud(draftData.toggleHud);
    if (draftData.reset !== undefined) setReset(draftData.reset);
    if (draftData.playerList !== undefined) setPlayerList(draftData.playerList);

    // オブジェクト型のstate
    if (draftData.remappings !== undefined) setRemappings(draftData.remappings);
    if (draftData.externalTools !== undefined) setExternalTools(draftData.externalTools);
    if (draftData.fingerAssignments !== undefined) setFingerAssignments(draftData.fingerAssignments);
    if (draftData.customKeys !== undefined) setCustomKeys(draftData.customKeys);

    setTimeout(() => {
      setIsRestoringDraft(false);
    }, 100);
  };

  // 初回マウント時に下書きをチェック
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.data) {
      setDraftTimestamp(draft.timestamp);
      setShowDraftDialog(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // formDataの変更を監視して履歴に追加
  useEffect(() => {
    if (!isRestoringDraft && !isApplyingHistoryRef.current) {
      setHistoryState(formData);
      setHasUnsavedChanges(true);
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Undo/Redoでstateを復元する処理
  const applyHistoryState = useCallback((state: typeof formData) => {
    isApplyingHistoryRef.current = true;
    setIsRestoringDraft(true);
    restoreDraft(state);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Undoハンドラー
  const handleUndo = useCallback(() => {
    if (canUndo) {
      isApplyingHistoryRef.current = true;
      undo();
    }
  }, [canUndo, undo]);

  // Redoハンドラー
  const handleRedo = useCallback(() => {
    if (canRedo) {
      isApplyingHistoryRef.current = true;
      redo();
    }
  }, [canRedo, redo]);

  // historyStateの変更を監視してフォームに適用
  useEffect(() => {
    if (isApplyingHistoryRef.current) {
      applyHistoryState(historyState);
      // 次のティックでフラグをリセット
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 100);
    }
  }, [historyState, applyHistoryState]);

  // キーボードショートカット（Ctrl+Z / Ctrl+Y）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力欄にフォーカスがある場合はスキップ
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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

  // アクションのカテゴリを取得
  const getCategoryForAction = (action: string): string => {
    if (['forward', 'back', 'left', 'right', 'jump', 'sneak', 'sprint'].includes(action)) {
      return 'movement';
    }
    if (['attack', 'use', 'pickBlock', 'drop'].includes(action)) {
      return 'action';
    }
    if (['inventory', 'swapHands', 'hotbar1', 'hotbar2', 'hotbar3', 'hotbar4', 'hotbar5', 'hotbar6', 'hotbar7', 'hotbar8', 'hotbar9'].includes(action)) {
      return 'inventory';
    }
    if (['togglePerspective', 'fullscreen', 'chat', 'command', 'toggleHud'].includes(action)) {
      return 'view';
    }
    return 'other';
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
    actions?: string[];
    remap?: string;
    externalTool?: string;
    finger?: Finger[];
  }) => {
    // アクション割り当て処理（1アクション1キーのみ - 配列ヘルパー関数不要）
    if ('actions' in config) {
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

      const getters: { [key: string]: string } = {
        forward, back, left, right, jump, sneak, sprint,
        attack, use, pickBlock, drop,
        inventory, swapHands,
        hotbar1, hotbar2, hotbar3, hotbar4, hotbar5, hotbar6, hotbar7, hotbar8, hotbar9,
        togglePerspective, fullscreen, chat, command, toggleHud, playerList, reset,
      };

      // デフォルト値のマップ
      const defaults: { [key: string]: string } = {
        forward: 'key.keyboard.w', back: 'key.keyboard.s', left: 'key.keyboard.a', right: 'key.keyboard.d',
        jump: 'key.keyboard.space', sneak: 'key.keyboard.left.shift', sprint: 'key.keyboard.left.control',
        attack: 'key.mouse.left', use: 'key.mouse.right', pickBlock: 'key.mouse.middle', drop: 'key.keyboard.q',
        inventory: 'key.keyboard.e', swapHands: 'key.keyboard.f',
        hotbar1: 'key.keyboard.1', hotbar2: 'key.keyboard.2', hotbar3: 'key.keyboard.3',
        hotbar4: 'key.keyboard.4', hotbar5: 'key.keyboard.5', hotbar6: 'key.keyboard.6',
        hotbar7: 'key.keyboard.7', hotbar8: 'key.keyboard.8', hotbar9: 'key.keyboard.9',
        togglePerspective: 'key.keyboard.f5', fullscreen: 'key.keyboard.f11',
        chat: 'key.keyboard.t', command: 'key.keyboard.slash', toggleHud: 'key.keyboard.f1',
        playerList: 'key.keyboard.tab', reset: 'key.keyboard.f6',
      };

      // Find which actions are currently bound to this key（1アクション1キーのみ）
      const currentActionsForKey = Object.entries(getters)
        .filter(([_, keyBinding]) => keyBinding === keyCode)
        .map(([action]) => action);

      const newActions = config.actions || [];

      // Find actions to add (in newActions but not in currentActionsForKey)
      const actionsToAdd = newActions.filter(action => !currentActionsForKey.includes(action));

      // Find actions to remove (in currentActionsForKey but not in newActions)
      const actionsToRemove = currentActionsForKey.filter(action => !newActions.includes(action));

      // Add key to new actions（1アクション1キーのみ - 直接設定）
      for (const action of actionsToAdd) {
        const setter = setters[action];
        if (setter) {
          setter(keyCode); // 直接キーコードを設定（配列不要）
        }
      }

      // Remove key from removed actions（1アクション1キーのみ - デフォルト値に戻す）
      for (const action of actionsToRemove) {
        const setter = setters[action];
        const defaultValue = defaults[action] || '';
        if (setter) {
          setter(defaultValue); // デフォルト値または空文字列に戻す
        }
      }
    }

    // Minecraft形式のキーコードをWeb標準形式に変換
    const webKeyCode = minecraftToWeb(keyCode);

    // リマップ設定
    if ('remap' in config) {
      setRemappings(prev => {
        const updated = { ...prev };
        if (config.remap && config.remap.trim() !== '') {
          updated[webKeyCode] = config.remap;
        } else {
          // undefinedまたは空文字列の場合は削除
          delete updated[webKeyCode];
        }
        return updated;
      });
    }

    // 外部ツール設定
    if ('externalTool' in config) {
      setExternalTools(prev => {
        const updated = { ...prev };
        if (config.externalTool && config.externalTool.trim() !== '') {
          // アクション名を保存
          updated[webKeyCode] = config.externalTool;
        } else {
          delete updated[webKeyCode];
        }
        return updated;
      });
    }

    // 指の割り当て設定
    if ('finger' in config) {
      setFingerAssignments(prev => {
        const updated = { ...prev };
        if (config.finger && config.finger.length > 0) {
          updated[webKeyCode] = config.finger;
        } else {
          delete updated[webKeyCode];
        }
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      // キーバインドを新スキーマ形式（Keybinding配列）に変換（1アクション1キー）
      const keybindingStates: { [action: string]: string } = {
        forward, back, left, right, jump, sneak, sprint,
        attack, use, pickBlock, drop,
        inventory, swapHands,
        hotbar1, hotbar2, hotbar3, hotbar4, hotbar5, hotbar6, hotbar7, hotbar8, hotbar9,
        togglePerspective, fullscreen, chat, command, toggleHud,
      };

      // additionalSettingsのキーバインドも追加（1アクション1キー）
      const additionalBindings: { [action: string]: string } = {
        reset,
        playerList,
      };

      const keybindings: Array<{ action: string; keyCode: string; category: string; fingers?: string[] }> = [];

      // 通常のキーバインドを変換（1アクション1キーのみ）
      Object.entries(keybindingStates).forEach(([action, keyCode]) => {
        if (keyCode && keyCode !== '') {
          keybindings.push({
            action,
            keyCode,
            category: getCategoryForAction(action),
            fingers: fingerAssignments[keyCode] || undefined,
          });
        }
      });

      // 追加設定のキーバインドを変換（1アクション1キーのみ）
      Object.entries(additionalBindings).forEach(([action, keyCode]) => {
        if (keyCode && keyCode !== '') {
          keybindings.push({
            action,
            keyCode,
            category: 'other',
            fingers: fingerAssignments[keyCode] || undefined,
          });
        }
      });

      // キーリマップを配列形式に変換
      const keyRemaps = Object.entries(remappings).map(([sourceKey, targetKey]) => ({
        sourceKey,
        targetKey,
      }));

      // 外部ツールを配列形式に変換
      const externalToolsArray = Object.entries(externalTools).map(([triggerKey, actionName]) => ({
        triggerKey,
        toolName: 'AutoHotKey', // デフォルト値
        actionName,
        description: undefined,
      }));

      const data = {
        targetUuid: uuid, // 管理者がゲストユーザーを編集する場合のため、対象ユーザーのUUIDを送信
        settings: {
          displayName,
          keyboardLayout,
          mouseDpi: mouseDpi ? Number(mouseDpi) : null,
          gameSensitivity: sensitivityRaw ? Number(sensitivityRaw) : null,
          windowsSpeed: windowsSpeed ? Number(windowsSpeed) : null,
          mouseAcceleration,
          rawInput,
          cm360,
          toggleSprint: sprintMode === 'toggle',
          toggleSneak: sneakMode === 'toggle',
          autoJump,
          fingerAssignments: Object.keys(fingerAssignments).length > 0 ? fingerAssignments : undefined,
          gameLanguage: gameLanguage.trim() || undefined,
          mouseModel: mouseModel.trim() || undefined,
          keyboardModel: keyboardModel.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        keybindings,
        keyRemaps: keyRemaps.length > 0 ? keyRemaps : undefined,
        externalTools: externalToolsArray.length > 0 ? externalToolsArray : undefined,
        customKeys: customKeys.length > 0 ? customKeys.map(ck => ({
          keyCode: ck.keyCode,
          keyName: ck.label,
          category: 'keyboard' as const,
        })) : undefined,
      };

      const response = await fetch('/api/keybindings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to save settings');
      }

      // アイテム配置設定も保存
      if (itemLayoutEditorRef.current) {
        const itemLayoutSaved = await itemLayoutEditorRef.current.save();
        if (!itemLayoutSaved) {
          throw new Error('Failed to save item layouts');
        }
      }

      // サーチクラフト設定も保存
      if (searchCraftEditorRef.current) {
        const searchCraftSaved = await searchCraftEditorRef.current.save();
        if (!searchCraftSaved) {
          throw new Error('Failed to save search crafts');
        }
      }

      // 保存成功したらローカルストレージをクリアし、未保存フラグをfalseに
      clearDraft();
      setHasUnsavedChanges(false);

      // 現在のMCIDでリダイレクト
      router.push(`/player/${currentMcid}`);
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : '保存に失敗しました';
      alert(`保存に失敗しました: ${errorMessage}`);
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

      // 削除成功後、ローカルストレージをクリアしてプレイヤーページにリダイレクト
      clearDraft();
      setHasUnsavedChanges(false);
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

  // キャンセルボタンのハンドラー
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => () => {
        clearDraft();
        setHasUnsavedChanges(false);
        router.back();
      });
      setShowUnsavedDialog(true);
    } else {
      clearDraft();
      router.back();
    }
  };

  // ページ遷移時のハンドラー
  const handleNavigate = (url: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => () => {
        clearDraft();
        setHasUnsavedChanges(false);
        router.push(url);
      });
      setShowUnsavedDialog(true);
    } else {
      clearDraft();
      router.push(url);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      {/* ユーザー情報 */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">プレイヤー情報</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="表示名"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
                <Button
                  onClick={handleSyncMcid}
                  disabled={syncingMcid}
                  size="sm"
                  className="whitespace-nowrap flex-shrink-0"
                  title="Mojang APIから最新のMCIDを取得"
                >
                  {syncingMcid ? '同期中...' : '同期'}
                </Button>
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                MinecraftでIDを変更した場合は同期ボタンで更新できます
              </p>
            </div>
          </div>

          {/* ゲーム内の言語 */}
          <Combobox
            label="ゲーム内の言語"
            value={gameLanguage}
            onChange={setGameLanguage}
            options={MINECRAFT_LANGUAGES}
            placeholder="言語を選択または入力"
            allowCustomValue={true}
            helpText={gameLanguage ? `現在の選択: ${MINECRAFT_LANGUAGES.find(l => l.value === gameLanguage)?.label || gameLanguage}` : undefined}
          />

          {/* デバイス情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* 自由使用欄 */}
          <Textarea
            id="notes"
            label="コメント"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="その他のメモや補足情報など"
            rows={4}
            className="resize-y"
          />
        </div>
      </section>

      {/* 仮想キーボード */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">キー配置設定</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">指の色分け表示</label>
            <Switch
              checked={showFingerColors}
              onChange={setShowFingerColors}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                showFingerColors ? 'bg-primary' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showFingerColors ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Switch>
          </div>
        </div>

        <RadioGroup
          label="キーボードレイアウト"
          value={keyboardLayout}
          onChange={(value) => setKeyboardLayout(value as 'JIS' | 'JIS-TKL' | 'US' | 'US-TKL')}
          options={KEYBOARD_LAYOUT_OPTIONS}
          orientation="horizontal"
          className="mb-4"
        />
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
          customKeys={customKeys}
          onAddCustomKey={(section, label) => {
            const newKey: CustomKey = {
              id: `custom-${section}-${Date.now()}`,
              label: label,
              keyCode: `key.custom.${section}.${customKeys.filter(k => k.keyCode.includes(`custom.${section}`)).length + 1}`
            };
            setCustomKeys([...customKeys, newKey]);
          }}
          onUpdateCustomKey={(keyCode, label) => {
            setCustomKeys(customKeys.map(key =>
              key.keyCode === keyCode ? { ...key, label } : key
            ));
          }}
          onDeleteCustomKey={(keyCode) => {
            setCustomKeys(customKeys.filter(key => key.keyCode !== keyCode));
          }}
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
            <Switch
              checked={rawInput}
              onChange={setRawInput}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                rawInput ? 'bg-primary' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  rawInput ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Switch>
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
            <label className="font-semibold">マウス加速</label>
            <Switch
              checked={mouseAcceleration}
              onChange={setMouseAcceleration}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                mouseAcceleration ? 'bg-primary' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mouseAcceleration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Switch>
          </div>
        </div>

        {/* 振り向き計算結果（常時表示） */}
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
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
                return cursorSpeed !== null ? `${cursorSpeed} dpi` : '-';
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

      {/* 移動設定 */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">移動設定</h2>
        <div className="space-y-4">
          {/* Sprint */}
          <RadioGroup
            label="Sprint"
            value={sprintMode}
            onChange={(value) => setSprintMode(value as 'hold' | 'toggle')}
            options={[
              { value: 'hold', label: 'Hold' },
              { value: 'toggle', label: 'Toggle' },
            ]}
            orientation="horizontal"
          />

          {/* Sneak */}
          <RadioGroup
            label="Sneak"
            value={sneakMode}
            onChange={(value) => setSneakMode(value as 'hold' | 'toggle')}
            options={[
              { value: 'hold', label: 'Hold' },
              { value: 'toggle', label: 'Toggle' },
            ]}
            orientation="horizontal"
          />

          {/* Auto Jump */}
          <div className="flex items-center justify-between p-4 bg-[rgb(var(--muted))] rounded-lg">
            <label className="font-semibold">Auto Jump</label>
            <Switch
              checked={autoJump}
              onChange={setAutoJump}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                autoJump ? 'bg-primary' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoJump ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Switch>
          </div>
        </div>
      </section>

      {/* アイテム配置設定 */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <h2 className="text-xl font-bold mb-4">アイテム配置設定</h2>
        <ItemLayoutEditor uuid={uuid} ref={itemLayoutEditorRef} hideSaveButton />
      </section>

      {/* サーチクラフト設定 */}
      <section className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
        <SearchCraftEditor uuid={uuid} ref={searchCraftEditorRef} hideSaveButton />
      </section>

      {/* リマップと外部ツールは仮想キーボードのモーダルから設定可能 */}

      {/* 固定ボタンエリア */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgb(var(--background))]/95 backdrop-blur-sm border-t border-[rgb(var(--border))] z-40">
        <div className="container mx-auto px-4 py-4 flex gap-4 justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              variant="danger-outline"
              size="lg"
              className="p-3"
              title="設定を削除"
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setShowAutoHotKeyDialog(true)}
              variant="outline"
              size="lg"
              className="p-3"
              title="AutoHotKeyスクリプトを出力"
              disabled={Object.keys(remappings).length === 0}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </Button>
            <div className="flex gap-2 ml-4">
              <Button
                onClick={handleUndo}
                disabled={!canUndo || isRestoringDraft}
                variant="outline"
                size="lg"
                className="p-3"
                title="元に戻す (Ctrl+Z)"
              >
                <ArrowUturnLeftIcon className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleRedo}
                disabled={!canRedo || isRestoringDraft}
                variant="outline"
                size="lg"
                className="p-3"
                title="やり直す (Ctrl+Y)"
              >
                <ArrowUturnRightIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="lg"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              size="lg"
              className="flex items-center gap-2 min-w-32"
            >
              {saving && <LoadingSpinner size="sm" variant="light" />}
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <Transition show={showDeleteConfirm} as={Fragment}>
        <Dialog onClose={() => setShowDeleteConfirm(false)} className="relative z-50">
          {/* Backdrop */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          </TransitionChild>

          {/* Full-screen container to center the panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border max-w-md w-full shadow-lg max-h-[90vh] flex flex-col">
                <div className="p-8 overflow-y-auto flex-1">
                  <DialogTitle className="text-2xl font-bold mb-4">設定を削除しますか？</DialogTitle>
                  <p className="text-[rgb(var(--muted-foreground))] text-sm">
                    この操作は取り消せません。すべてのキーバインド設定が削除されます。
                  </p>
                </div>
                <div className="flex gap-3 justify-end px-8 pb-8 pt-6 border-t border-border/50">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    variant="outline"
                    size="lg"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    variant="danger"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {deleting && <LoadingSpinner size="sm" variant="light" />}
                    {deleting ? '削除中...' : '削除する'}
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* 下書き復元ダイアログ */}
      <DraftRestoreDialog
        isOpen={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
        onRestore={() => {
          const draft = loadDraft();
          if (draft && draft.data) {
            restoreDraft(draft.data);
          }
        }}
        onDiscard={() => {
          clearDraft();
        }}
        timestamp={draftTimestamp}
      />

      {/* 未保存変更の警告ダイアログ */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onClose={() => {
          setShowUnsavedDialog(false);
          setPendingNavigation(null);
        }}
        onDiscard={() => {
          if (pendingNavigation) {
            pendingNavigation();
          }
          setShowUnsavedDialog(false);
          setPendingNavigation(null);
        }}
        showSaveButton={false}
      />

      {/* AutoHotKey出力ダイアログ */}
      <AutoHotKeyExportDialog
        isOpen={showAutoHotKeyDialog}
        onClose={() => setShowAutoHotKeyDialog(false)}
        remappings={remappings}
      />
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
