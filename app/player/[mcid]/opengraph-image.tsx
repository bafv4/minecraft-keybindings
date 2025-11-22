import { ImageResponse } from 'next/og';
import { getPlayerData } from '@/lib/playerData';
import { formatKeyName } from '@/lib/utils';
import { readFile } from 'fs/promises';
import { join } from 'path';

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
  try {
    const { mcid } = await params;

    // プレイヤーデータを取得
    let playerData;
    try {
      playerData = await getPlayerData(mcid);
    } catch (error) {
      console.error('Failed to fetch player data:', error);
      playerData = null;
    }

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
              background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
              color: '#334155',
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

    const baseUrl = process.env.NEXTAUTH_URL || 'https://mchotkeys-stg.vercel.app';
    const avatarUrl = `${baseUrl}/api/avatar?uuid=${user.uuid}&size=128`;

    // アイコンSVGを読み込んでPNGに変換
    let iconDataUri: string | undefined;
    try {
      const sharp = (await import('sharp')).default;
      const iconPath = join(process.cwd(), 'public', 'icon.svg');
      const iconSvg = await readFile(iconPath);
      const iconPng = await sharp(iconSvg)
        .resize(40, 40)
        .png()
        .toBuffer();
      iconDataUri = `data:image/png;base64,${iconPng.toString('base64')}`;
    } catch (error) {
      console.error('Failed to load icon:', error);
    }

    // アバター画像を fetch して ArrayBuffer として取得
    let avatarBuffer: ArrayBuffer | null = null;
    try {
      const avatarResponse = await fetch(avatarUrl);
      if (avatarResponse.ok) {
        avatarBuffer = await avatarResponse.arrayBuffer();
      }
    } catch (error) {
      console.error('Failed to fetch avatar:', error);
    }

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
      swapHands: formatKeyName(settings?.swapHands || 'key.keyboard.f'),
    };

    // 設定
    const toggleSettings = {
      sprint: settings?.toggleSprint ? 'Toggle' : 'Hold',
      sneak: settings?.toggleSneak ? 'Toggle' : 'Hold',
      autoJump: settings?.autoJump ? 'ON' : 'OFF',
    };

    // アバター画像を Base64 に変換
    const avatarDataUri = avatarBuffer
      ? `data:image/png;base64,${Buffer.from(avatarBuffer).toString('base64')}`
      : undefined;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4f8 100%)',
            padding: '48px',
            color: '#1e293b',
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* アイコン */}
              {iconDataUri ? (
                <div style={{ width: '40px', height: '40px', display: 'flex' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconDataUri} alt="icon" width={40} height={40} />
                </div>
              ) : (
                <span>🎮</span>
              )}
              <span>MCSRer Hotkeys</span>
            </div>
          </div>

          {/* プレイヤー情報 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {/* アバター */}
            {avatarDataUri ? (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarDataUri}
                  alt={displayName}
                  width={80}
                  height={80}
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                }}
              >
                👤
              </div>
            )}

            {/* 名前 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 40, fontWeight: 700 }}>{displayName}</div>
              {user.displayName && user.displayName !== user.mcid && (
                <div style={{ fontSize: 20, opacity: 0.6 }}>{user.mcid}</div>
              )}
            </div>
          </div>

          {/* キーバインド */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              flex: 1,
            }}
          >
            {/* ホットバー */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7, width: '100px' }}>ホットバー</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {hotbarKeys.map((key, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: '32px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>

            {/* オフハンド */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7, width: '100px' }}>オフハンド</div>
              <div
                style={{
                  background: 'rgba(100, 116, 139, 0.12)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: 16,
                  fontWeight: 700,
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                }}
              >
                {actionKeys.swapHands}
              </div>
            </div>

            {/* 移動 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7, width: '100px' }}>移動</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Object.entries(movementKeys).map(([action, key]) => (
                  <div
                    key={action}
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: '40px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>

            {/* アクション */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7, width: '100px' }}>アクション</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>ジャンプ</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: '60px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {actionKeys.jump}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>ダッシュ</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: '60px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {actionKeys.sprint}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>スニーク</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: '60px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {actionKeys.sneak}
                  </div>
                </div>
              </div>
            </div>

            {/* 設定 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7, width: '100px' }}>設定</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>Sprint</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: '60px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {toggleSettings.sprint}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>Sneak</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: '60px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {toggleSettings.sneak}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>AutoJump</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: '60px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    {toggleSettings.autoJump}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);

    // エラー時のフォールバック画像（最もシンプルな形式）
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f4f8',
            color: '#334155',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold' }}>
            MCSRer Hotkeys
          </div>
          <div style={{ fontSize: 24, marginTop: '20px', opacity: 0.6 }}>
            Error generating preview
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
