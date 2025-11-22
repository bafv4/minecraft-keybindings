import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { getPlayerData } from '@/lib/playerData';
import { formatKeyName } from '@/lib/utils';

export const runtime = 'nodejs';
export const alt = 'Player Keybindings';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{
    mcid: string;
  }>;
}

export default async function Image({ params }: Props) {
  const { mcid } = await params;

  // プレイヤーデータを取得
  const playerData = await getPlayerData(mcid);

  if (!playerData) {
    // デフォルト画像を返す
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: 60,
            fontWeight: 'bold',
          }}
        >
          MCSRer Hotkeys
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const { user, settings } = playerData;
  const displayName = user.displayName && user.displayName.trim() !== '' ? user.displayName : user.mcid;

  // アバター画像URL（Base64エンコードして埋め込む）
  const avatarUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/avatar?uuid=${user.uuid}&size=128`;

  // 主要なキーバインド
  const hotbarKeys = [
    settings?.hotbar1 || 'key.keyboard.1',
    settings?.hotbar2 || 'key.keyboard.2',
    settings?.hotbar3 || 'key.keyboard.3',
    settings?.hotbar4 || 'key.keyboard.4',
    settings?.hotbar5 || 'key.keyboard.5',
    settings?.hotbar6 || 'key.keyboard.6',
    settings?.hotbar7 || 'key.keyboard.7',
    settings?.hotbar8 || 'key.keyboard.8',
    settings?.hotbar9 || 'key.keyboard.9',
  ].map((key) => formatKeyName(key));

  const movementKeys = {
    forward: formatKeyName(settings?.forward || 'key.keyboard.w'),
    left: formatKeyName(settings?.left || 'key.keyboard.a'),
    back: formatKeyName(settings?.back || 'key.keyboard.s'),
    right: formatKeyName(settings?.right || 'key.keyboard.d'),
  };

  const actionKeys = {
    jump: formatKeyName(settings?.jump || 'key.keyboard.space'),
    sneak: formatKeyName(settings?.sneak || 'key.keyboard.left.shift'),
    sprint: formatKeyName(settings?.sprint || 'key.keyboard.left.control'),
  };

  // マウス設定
  const mouseSettings = {
    dpi: settings?.mouseDpi,
    sensitivity: settings?.gameSensitivity ? Math.floor(Number(settings.gameSensitivity) * 200) : undefined,
    cm360: settings?.cm360,
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px',
          color: 'white',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span>🎮</span>
            <span>MCSRer Hotkeys</span>
          </div>
        </div>

        {/* プレイヤー情報 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {/* アバター */}
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={displayName}
              width={96}
              height={96}
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* 名前 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>{displayName}</div>
            {user.displayName && user.displayName !== user.mcid && (
              <div style={{ fontSize: 24, opacity: 0.8 }}>{user.mcid}</div>
            )}
          </div>
        </div>

        {/* キーバインド */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '30px',
            flex: 1,
          }}
        >
          {/* ホットバー */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', opacity: 0.9 }}>ホットバー</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {hotbarKeys.map((key, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: 18,
                    fontWeight: 'bold',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                >
                  {key}
                </div>
              ))}
            </div>
          </div>

          {/* 移動とアクション */}
          <div style={{ display: 'flex', gap: '40px' }}>
            {/* 移動 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', opacity: 0.9 }}>移動</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.entries(movementKeys).map(([action, key]) => (
                  <div
                    key={action}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: 18,
                      fontWeight: 'bold',
                      minWidth: '40px',
                      textAlign: 'center',
                    }}
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>

            {/* アクション */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', opacity: 0.9 }}>アクション</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: 14, opacity: 0.8 }}>ジャンプ</div>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: 18,
                      fontWeight: 'bold',
                      minWidth: '60px',
                      textAlign: 'center',
                    }}
                  >
                    {actionKeys.jump}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: 14, opacity: 0.8 }}>スニーク</div>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: 18,
                      fontWeight: 'bold',
                      minWidth: '60px',
                      textAlign: 'center',
                    }}
                  >
                    {actionKeys.sneak}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: 14, opacity: 0.8 }}>ダッシュ</div>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: 18,
                      fontWeight: 'bold',
                      minWidth: '60px',
                      textAlign: 'center',
                    }}
                  >
                    {actionKeys.sprint}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* マウス設定 */}
          <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
            {mouseSettings.dpi && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: 18, opacity: 0.8 }}>DPI:</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{mouseSettings.dpi}</div>
              </div>
            )}
            {mouseSettings.sensitivity && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: 18, opacity: 0.8 }}>感度:</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{mouseSettings.sensitivity}%</div>
              </div>
            )}
            {mouseSettings.cm360 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: 18, opacity: 0.8 }}>振り向き:</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{mouseSettings.cm360}cm</div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
