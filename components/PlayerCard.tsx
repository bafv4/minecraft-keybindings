import Link from 'next/link';
import { MinecraftAvatar } from './MinecraftAvatar';
import { formatKeyName, calculateCursorSpeed } from '@/lib/utils';
import type { User } from '@/types/player';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface PlayerCardProps {
  user: User;
}

export function PlayerCard({ user }: PlayerCardProps) {
  const { mcid, uuid, displayName, settings } = user;

  return (
    <Link
      href={`/player/${mcid}`}
      className="group block p-6 border border-[rgb(var(--border))] bg-[rgb(var(--card))] rounded-xl hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <MinecraftAvatar uuid={uuid} mcid={mcid} size={64} />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[rgb(var(--card))] rounded-full"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold truncate">{displayName}</h2>
            <ArrowRightIcon className="w-5 h-5 text-[rgb(var(--muted-foreground))] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">{mcid}</p>
          {settings && (
            <div className="text-sm text-[rgb(var(--muted-foreground))]">
              {settings.mouseDpi && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">DPI {settings.mouseDpi}</span>
                  {settings.gameSensitivity && (
                    <>
                      <span className="text-[rgb(var(--border))]">•</span>
                      <span>感度（ゲーム内） {Math.floor(Number(settings.gameSensitivity) * 200)}%</span>
                    </>
                  )}
                  {(() => {
                    const cursorSpeed = calculateCursorSpeed(
                      settings.mouseDpi,
                      settings.windowsSpeed ?? 10,
                      settings.rawInput,
                      settings.mouseAcceleration
                    );
                    return (
                      <>
                        <span className="text-[rgb(var(--border))]">•</span>
                        <span>
                          カーソル速度 {cursorSpeed !== null ? `${cursorSpeed}dpi` : '-'}
                        </span>
                      </>
                    );
                  })()}
                  {settings.cm360 && (
                    <>
                      <span className="text-[rgb(var(--border))]">•</span>
                      <span>{settings.cm360}cm/180°</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {settings && (
        <div className="flex flex-wrap gap-1.5">
          <KeyBadge label="W" keyName={settings.forward} />
          <KeyBadge label="A" keyName={settings.left} />
          <KeyBadge label="S" keyName={settings.back} />
          <KeyBadge label="D" keyName={settings.right} />
          <KeyBadge label="Space" keyName={settings.jump} accent />
          <KeyBadge label="Shift" keyName={settings.sneak} accent />
        </div>
      )}
    </Link>
  );
}

function KeyBadge({
  label,
  keyName,
  accent = false
}: {
  label: string;
  keyName: string;
  accent?: boolean;
}) {
  const formattedKey = formatKeyName(keyName);
  const isDefault = label.toUpperCase() === formattedKey.toUpperCase() ||
                    (label === 'Space' && formattedKey === 'Space') ||
                    (label === 'Shift' && formattedKey === 'Shift');

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
        ${accent
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'
        }
        ${!isDefault ? 'ring-1 ring-amber-500/50' : ''}
      `}
    >
      <span className="text-[rgb(var(--muted-foreground))] font-normal">{label}:</span>
      <span className="font-mono font-semibold">{formattedKey}</span>
    </span>
  );
}
