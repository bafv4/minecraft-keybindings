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

    // フォントを読み込み
    const fontBold = await readFile(join(process.cwd(), 'fonts', 'ZenKakuGothicAntique-Bold.ttf'));
    const fontRegular = await readFile(join(process.cwd(), 'fonts', 'ZenKakuGothicAntique-Regular.ttf'));

    // アイコンSVGを読み込んでPNGに変換
    let iconDataUri: string | undefined;
    try {
      const sharp = (await import('sharp')).default;
      const iconPath = join(process.cwd(), 'public', 'icon.svg');
      const iconSvg = await readFile(iconPath);
      const iconPng = await sharp(iconSvg)
        .resize(56, 56)
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
            fontFamily: 'Zen Kaku Gothic Antique',
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
                fontSize: 48,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* アイコン */}
              {iconDataUri ? (
                <div style={{ width: '56px', height: '56px', display: 'flex' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconDataUri} alt="icon" width={56} height={56} />
                </div>
              ) : (
                <span>🎮</span>
              )}
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                MCSRer Hotkeys
              </span>
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
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarDataUri}
                  alt={displayName}
                  width={96}
                  height={96}
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 56,
                }}
              >
                👤
              </div>
            )}

            {/* 名前 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 56, fontWeight: 700 }}>{displayName}</div>
              {user.displayName && user.displayName !== user.mcid && (
                <div style={{ fontSize: 28, opacity: 0.6 }}>{user.mcid}</div>
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
              <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.7, width: '130px' }}>ホットバー</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {hotbarKeys.map((key, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: 20,
                      fontWeight: 700,
                      minWidth: '40px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>

            {/* オフハンド */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.7, width: '130px' }}>オフハンド</div>
              <div
                style={{
                  background: 'rgba(100, 116, 139, 0.12)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: 20,
                  fontWeight: 700,
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {actionKeys.swapHands}
              </div>
            </div>

            {/* 移動 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.7, width: '130px' }}>移動</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.entries(movementKeys).map(([action, key]) => (
                  <div
                    key={action}
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 20,
                      fontWeight: 700,
                      minWidth: '50px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>

            {/* アクション */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.7, width: '130px' }}>アクション</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>ジャンプ</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 20,
                      fontWeight: 700,
                      minWidth: '75px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {actionKeys.jump}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>ダッシュ</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 20,
                      fontWeight: 700,
                      minWidth: '75px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {actionKeys.sprint}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>スニーク</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 20,
                      fontWeight: 700,
                      minWidth: '75px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {actionKeys.sneak}
                  </div>
                </div>
              </div>
            </div>

            {/* 設定 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.7, width: '130px' }}>設定</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>Sprint</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 18,
                      fontWeight: 700,
                      minWidth: '75px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {toggleSettings.sprint}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>Sneak</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 18,
                      fontWeight: 700,
                      minWidth: '75px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {toggleSettings.sneak}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>AutoJump</div>
                  <div
                    style={{
                      background: 'rgba(100, 116, 139, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 18,
                      fontWeight: 700,
                      minWidth: '75px',
                      textAlign: 'center',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
        fonts: [
          {
            name: 'Zen Kaku Gothic Antique',
            data: fontBold,
            style: 'normal',
            weight: 700,
          },
          {
            name: 'Zen Kaku Gothic Antique',
            data: fontRegular,
            style: 'normal',
            weight: 400,
          },
        ],
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
            fontFamily: 'Zen Kaku Gothic Antique',
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
