import { formatKeyName } from '@/lib/utils';
import type { PlayerSettings } from '@/types/player';

interface KeybindingDisplayProps {
  settings: PlayerSettings;
}

export function KeybindingDisplay({ settings }: KeybindingDisplayProps) {
  return (
    <div className="space-y-6">
      {/* マウス設定 */}
      {(settings.mouseDpi || settings.gameSensitivity) && (
        <section className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">マウス設定</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {settings.mouseDpi && (
              <SettingItem label="DPI" value={settings.mouseDpi.toString()} />
            )}
            {settings.gameSensitivity && (
              <SettingItem label="ゲーム内感度" value={`${settings.gameSensitivity}%`} />
            )}
            {settings.windowsSpeed && (
              <SettingItem label="Windows速度" value={`${settings.windowsSpeed}/11`} />
            )}
            <SettingItem
              label="マウス加速"
              value={settings.mouseAcceleration ? 'ON' : 'OFF'}
            />
            {settings.cm360 && (
              <SettingItem label="振り向き" value={`${settings.cm360} cm/360°`} />
            )}
          </div>
        </section>
      )}

      {/* 移動キー */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">移動</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KeybindItem label="前進" keyName={settings.forward} />
          <KeybindItem label="後退" keyName={settings.back} />
          <KeybindItem label="左移動" keyName={settings.left} />
          <KeybindItem label="右移動" keyName={settings.right} />
          <KeybindItem label="ジャンプ" keyName={settings.jump} />
          <KeybindItem label="スニーク" keyName={settings.sneak} />
          <KeybindItem label="ダッシュ" keyName={settings.sprint} />
        </div>
      </section>

      {/* アクション */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">アクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KeybindItem label="攻撃" keyName={settings.attack} />
          <KeybindItem label="使う" keyName={settings.use} />
          <KeybindItem label="ブロック選択" keyName={settings.pickBlock} />
          <KeybindItem label="ドロップ" keyName={settings.drop} />
        </div>
      </section>

      {/* インベントリ */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">インベントリ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KeybindItem label="インベントリ" keyName={settings.inventory} />
          <KeybindItem label="持ち替え" keyName={settings.swapHands} />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">ホットバー</h3>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            <KeybindItem label="1" keyName={settings.hotbar1} compact />
            <KeybindItem label="2" keyName={settings.hotbar2} compact />
            <KeybindItem label="3" keyName={settings.hotbar3} compact />
            <KeybindItem label="4" keyName={settings.hotbar4} compact />
            <KeybindItem label="5" keyName={settings.hotbar5} compact />
            <KeybindItem label="6" keyName={settings.hotbar6} compact />
            <KeybindItem label="7" keyName={settings.hotbar7} compact />
            <KeybindItem label="8" keyName={settings.hotbar8} compact />
            <KeybindItem label="9" keyName={settings.hotbar9} compact />
          </div>
        </div>
      </section>

      {/* リマップ設定 */}
      {settings.remappings && Object.keys(settings.remappings).length > 0 && (
        <section className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">リマップ設定</h2>
          <div className="space-y-2">
            {Object.entries(settings.remappings as Record<string, string>).map(([from, to]) => (
              <div key={from} className="flex items-center gap-2 text-sm">
                <code className="px-2 py-1 bg-gray-100 rounded font-mono">
                  {formatKeyName(from)}
                </code>
                <span>→</span>
                <code className="px-2 py-1 bg-blue-100 rounded font-mono">
                  {formatKeyName(to)}
                </code>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 外部ツール */}
      {settings.externalTools && Object.keys(settings.externalTools).length > 0 && (
        <section className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">外部ツール</h2>
          <div className="space-y-4">
            {Object.entries(settings.externalTools as Record<string, { actions: Array<{ trigger: string; action: string; description?: string }> }>).map(([toolName, config]) => (
              <div key={toolName}>
                <h3 className="font-semibold mb-2">{toolName}</h3>
                <div className="space-y-2">
                  {config.actions.map((action, idx) => (
                    <div key={idx} className="pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
                          {formatKeyName(action.trigger)}
                        </code>
                        <span>→</span>
                        <span className="font-semibold">{action.action}</span>
                      </div>
                      {action.description && (
                        <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function KeybindItem({
  label,
  keyName,
  compact = false
}: {
  label: string;
  keyName: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex ${compact ? 'flex-col items-center' : 'flex-col'} gap-1`}>
      <span className={`text-sm text-gray-600 ${compact ? 'text-xs' : ''}`}>
        {label}
      </span>
      <code className={`px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded font-mono font-bold text-center ${compact ? 'text-xs px-2 py-1' : ''}`}>
        {formatKeyName(keyName)}
      </code>
    </div>
  );
}
