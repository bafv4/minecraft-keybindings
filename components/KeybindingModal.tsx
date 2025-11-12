'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface KeybindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: string;
  currentAction: string | null;
  onSave: (config: {
    action?: string;
    remap?: string;
    externalTool?: { tool: string; action: string; description?: string };
  }) => void;
  // 既存の設定を渡す
  currentRemap?: string;
  currentExternalTool?: { tool: string; action: string; description?: string };
}

type TabType = 'action' | 'remap' | 'external';

export function KeybindingModal({
  isOpen,
  onClose,
  selectedKey,
  currentAction,
  onSave,
  currentRemap,
  currentExternalTool,
}: KeybindingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('action');
  const [selectedAction, setSelectedAction] = useState<string | null>(currentAction);
  const [remapKey, setRemapKey] = useState<string>(currentRemap || '');
  const [externalToolName, setExternalToolName] = useState<string>(currentExternalTool?.tool || '');
  const [externalToolAction, setExternalToolAction] = useState<string>(currentExternalTool?.action || '');
  const [externalToolDescription, setExternalToolDescription] = useState<string>(currentExternalTool?.description || '');

  // モーダルが開くたびに現在の設定で状態をリセット
  useEffect(() => {
    if (isOpen) {
      setSelectedAction(currentAction);
      setRemapKey(currentRemap || '');
      setExternalToolName(currentExternalTool?.tool || '');
      setExternalToolAction(currentExternalTool?.action || '');
      setExternalToolDescription(currentExternalTool?.description || '');
      setActiveTab('action');
    }
  }, [isOpen, currentAction, currentRemap, currentExternalTool]);

  if (!isOpen) return null;

  const handleSave = () => {
    const config = {
      action: selectedAction || undefined,
      remap: remapKey || undefined,
      externalTool: externalToolName && externalToolAction
        ? { tool: externalToolName, action: externalToolAction, description: externalToolDescription || undefined }
        : undefined,
    };
    console.log('KeybindingModal saving:', { selectedKey, config });
    onSave(config);
    onClose();
  };

  // キーラベルを表示用にフォーマット
  const formatKeyLabel = (keyCode: string): string => {
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
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→',
      };

      if (specialKeys[key]) return specialKeys[key];
      return key.toUpperCase();
    }

    return keyCode;
  };

  // 利用可能なアクション一覧（攻撃/使用は除外 - MCSRルール）
  const actions = [
    { id: 'forward', label: '前進' },
    { id: 'back', label: '後退' },
    { id: 'left', label: '左移動' },
    { id: 'right', label: '右移動' },
    { id: 'jump', label: 'ジャンプ' },
    { id: 'sneak', label: 'スニーク' },
    { id: 'sprint', label: 'ダッシュ' },
    { id: 'inventory', label: 'インベントリ' },
    { id: 'swapHands', label: 'オフハンド持ち替え' },
    { id: 'drop', label: 'ドロップ' },
    // attack と use は MCSRルールにより除外
    { id: 'pickBlock', label: 'ブロック選択' },
    { id: 'chat', label: 'チャット' },
    { id: 'command', label: 'コマンド' },
    { id: 'togglePerspective', label: '視点変更' },
    { id: 'fullscreen', label: 'フルスクリーン' },
    { id: 'toggleHud', label: 'Hide HUD' },
    { id: 'playerList', label: 'プレイヤーリスト' },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `hotbar${i + 1}`,
      label: `ホットバー${i + 1}`,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))] flex-shrink-0">
          <h2 className="text-xl font-semibold">
            キー設定: {formatKeyLabel(selectedKey)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-[rgb(var(--border))] flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('action')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'action'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            操作割り当て
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remap')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'remap'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            リマップ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('external')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'external'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            外部ツール
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4 min-h-[300px] overflow-y-auto flex-1">
          {activeTab === 'action' && (
            <div className="space-y-3">
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                このキーに割り当てる操作を選択してください
              </p>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors text-left ${
                      selectedAction === action.id
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                        : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'remap' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                このキーを別のキーに置き換えます。ハードウェアレベルでの変更をシミュレートします。
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">
                  リマップ先のキー
                </label>
                <input
                  type="text"
                  value={remapKey}
                  onChange={(e) => setRemapKey(e.target.value)}
                  placeholder="例: key.keyboard.left.control"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  Minecraft のキーコード形式で入力してください（例: key.keyboard.caps.lock → key.keyboard.left.control）
                </p>
              </div>
              {remapKey && (
                <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatKeyLabel(selectedKey)}</span>
                    {' → '}
                    <span className="font-medium">{formatKeyLabel(remapKey)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                外部ツール（AutoHotKey、マクロソフトウェアなど）で実行するアクションを記録します。
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ツール名
                </label>
                <input
                  type="text"
                  value={externalToolName}
                  onChange={(e) => setExternalToolName(e.target.value)}
                  placeholder="例: AutoHotKey"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  アクション
                </label>
                <textarea
                  value={externalToolAction}
                  onChange={(e) => setExternalToolAction(e.target.value)}
                  placeholder="例: Send {LButton Down}&#x0A;Sleep 10&#x0A;Send {LButton Up}"
                  rows={4}
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] font-mono text-sm"
                />
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                  このキーが押されたときに実行される外部ツールのスクリプトを記述してください
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  説明（任意）
                </label>
                <input
                  type="text"
                  value={externalToolDescription}
                  onChange={(e) => setExternalToolDescription(e.target.value)}
                  placeholder="このアクションの説明"
                  className="w-full px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgb(var(--border))] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
