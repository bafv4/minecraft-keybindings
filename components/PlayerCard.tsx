import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import { formatKeyName } from '@/lib/utils';
import type { User } from '@/types/player';

interface PlayerCardProps {
  user: User;
}

export function PlayerCard({ user }: PlayerCardProps) {
  const { mcid, uuid, settings } = user;

  return (
    <Link
      href={`/player/${mcid}`}
      className="block p-4 border rounded-lg hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <MinecraftAvatar uuid={uuid} mcid={mcid} size={64} />

        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">{mcid}</h2>

          {settings && (
            <div className="space-y-1 text-sm text-gray-600">
              {/* マウス設定 */}
              {settings.mouseDpi && (
                <div className="flex gap-2">
                  <span className="font-semibold">DPI:</span>
                  <span>{settings.mouseDpi}</span>
                  {settings.gameSensitivity && (
                    <>
                      <span className="mx-1">|</span>
                      <span className="font-semibold">感度:</span>
                      <span>{settings.gameSensitivity}%</span>
                    </>
                  )}
                  {settings.cm360 && (
                    <>
                      <span className="mx-1">|</span>
                      <span className="font-semibold">振り向き:</span>
                      <span>{settings.cm360}cm/360°</span>
                    </>
                  )}
                </div>
              )}

              {/* 主要なキーバインド */}
              <div className="flex flex-wrap gap-2 mt-2">
                <KeyDisplay label="前進" keyName={settings.forward} />
                <KeyDisplay label="後退" keyName={settings.back} />
                <KeyDisplay label="左" keyName={settings.left} />
                <KeyDisplay label="右" keyName={settings.right} />
                <KeyDisplay label="ジャンプ" keyName={settings.jump} />
                <KeyDisplay label="スニーク" keyName={settings.sneak} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function KeyDisplay({ label, keyName }: { label: string; keyName: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
      <span className="text-gray-500">{label}:</span>
      <span className="font-mono font-bold">{formatKeyName(keyName)}</span>
    </span>
  );
}
