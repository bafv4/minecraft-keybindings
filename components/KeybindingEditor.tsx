'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateCm360 } from '@/lib/utils';
import type { PlayerSettings } from '@/types/player';

interface KeybindingEditorProps {
  initialSettings?: PlayerSettings;
  mcid: string;
}

export function KeybindingEditor({ initialSettings, mcid }: KeybindingEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // マウス設定
  const [mouseDpi, setMouseDpi] = useState(initialSettings?.mouseDpi?.toString() || '');
  const [gameSensitivity, setGameSensitivity] = useState(initialSettings?.gameSensitivity?.toString() || '');
  const [windowsSpeed, setWindowsSpeed] = useState(initialSettings?.windowsSpeed?.toString() || '6');
  const [mouseAcceleration, setMouseAcceleration] = useState(initialSettings?.mouseAcceleration || false);

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

  // リマップとツール設定
  const [remappings, setRemappings] = useState(
    JSON.stringify(initialSettings?.remappings || {}, null, 2)
  );
  const [externalTools, setExternalTools] = useState(
    JSON.stringify(initialSettings?.externalTools || {}, null, 2)
  );

  // 振り向き計算
  const cm360 = mouseDpi && gameSensitivity
    ? calculateCm360(Number(mouseDpi), Number(gameSensitivity), Number(windowsSpeed))
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let parsedRemappings = null;
      let parsedExternalTools = null;

      try {
        parsedRemappings = remappings.trim() ? JSON.parse(remappings) : null;
      } catch {
        alert('リマップ設定のJSON形式が正しくありません');
        setSaving(false);
        return;
      }

      try {
        parsedExternalTools = externalTools.trim() ? JSON.parse(externalTools) : null;
      } catch {
        alert('外部ツール設定のJSON形式が正しくありません');
        setSaving(false);
        return;
      }

      const data = {
        // マウス設定
        mouseDpi: mouseDpi ? Number(mouseDpi) : null,
        gameSensitivity: gameSensitivity ? Number(gameSensitivity) : null,
        windowsSpeed: windowsSpeed ? Number(windowsSpeed) : null,
        mouseAcceleration,
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

        // リマップと外部ツール
        remappings: parsedRemappings,
        externalTools: parsedExternalTools,
      };

      const response = await fetch('/api/keybindings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      router.push(`/player/${mcid}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* マウス設定 */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">マウス設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="DPI"
            type="number"
            value={mouseDpi}
            onChange={setMouseDpi}
            placeholder="800"
          />
          <InputField
            label="ゲーム内感度 (%)"
            type="number"
            value={gameSensitivity}
            onChange={setGameSensitivity}
            placeholder="100"
            min="0"
            max="200"
          />
          <InputField
            label="Windows速度 (1-11)"
            type="number"
            value={windowsSpeed}
            onChange={setWindowsSpeed}
            placeholder="6"
            min="1"
            max="11"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mouseAccel"
              checked={mouseAcceleration}
              onChange={(e) => setMouseAcceleration(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="mouseAccel" className="font-semibold">
              マウス加速
            </label>
          </div>
        </div>
        {cm360 && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <span className="font-semibold">振り向き:</span> {cm360} cm/360°
          </div>
        )}
      </section>

      {/* 移動キー */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">移動</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="前進" value={forward} onChange={setForward} />
          <InputField label="後退" value={back} onChange={setBack} />
          <InputField label="左移動" value={left} onChange={setLeft} />
          <InputField label="右移動" value={right} onChange={setRight} />
          <InputField label="ジャンプ" value={jump} onChange={setJump} />
          <InputField label="スニーク" value={sneak} onChange={setSneak} />
          <InputField label="ダッシュ" value={sprint} onChange={setSprint} />
        </div>
      </section>

      {/* アクション */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">アクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="攻撃" value={attack} onChange={setAttack} />
          <InputField label="使う" value={use} onChange={setUse} />
          <InputField label="ブロック選択" value={pickBlock} onChange={setPickBlock} />
          <InputField label="ドロップ" value={drop} onChange={setDrop} />
        </div>
      </section>

      {/* インベントリ */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">インベントリ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <InputField label="インベントリ" value={inventory} onChange={setInventory} />
          <InputField label="持ち替え" value={swapHands} onChange={setSwapHands} />
        </div>
        <h3 className="font-semibold mb-2">ホットバー</h3>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          <InputField label="1" value={hotbar1} onChange={setHotbar1} compact />
          <InputField label="2" value={hotbar2} onChange={setHotbar2} compact />
          <InputField label="3" value={hotbar3} onChange={setHotbar3} compact />
          <InputField label="4" value={hotbar4} onChange={setHotbar4} compact />
          <InputField label="5" value={hotbar5} onChange={setHotbar5} compact />
          <InputField label="6" value={hotbar6} onChange={setHotbar6} compact />
          <InputField label="7" value={hotbar7} onChange={setHotbar7} compact />
          <InputField label="8" value={hotbar8} onChange={setHotbar8} compact />
          <InputField label="9" value={hotbar9} onChange={setHotbar9} compact />
        </div>
      </section>

      {/* リマップ設定 */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-2">リマップ設定 (JSON)</h2>
        <p className="text-sm text-gray-600 mb-4">
          例: &#123;&quot;key.keyboard.caps.lock&quot;: &quot;key.keyboard.left.control&quot;&#125;
        </p>
        <textarea
          value={remappings}
          onChange={(e) => setRemappings(e.target.value)}
          className="w-full h-32 p-3 border rounded font-mono text-sm"
          placeholder="{}"
        />
      </section>

      {/* 外部ツール */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-2">外部ツール (JSON)</h2>
        <p className="text-sm text-gray-600 mb-4">
          例: &#123;&quot;AutoHotKey&quot;: &#123;&quot;actions&quot;: [&#123;&quot;trigger&quot;: &quot;key.keyboard.x&quot;, &quot;action&quot;: &quot;Sprint Toggle&quot;&#125;]&#125;&#125;
        </p>
        <textarea
          value={externalTools}
          onChange={(e) => setExternalTools(e.target.value)}
          className="w-full h-32 p-3 border rounded font-mono text-sm"
          placeholder="{}"
        />
      </section>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  compact?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`font-semibold ${compact ? 'text-xs' : ''}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`px-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none ${compact ? 'py-1 text-sm' : 'py-2'}`}
      />
    </div>
  );
}
