import { ImageResponse } from 'next/og';
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
  try {
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
    const iconUrl = `${baseUrl}/icon.svg`;

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

    // Noto Sans JP フォントを読み込む（Zen Kaku Gothic の代替）
    const fontData = await fetch(
      'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEi75vY0rw-oME.woff',
    ).then((res) => res.arrayBuffer());

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
            fontFamily: '"Noto Sans JP", sans-serif',
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
              <div style={{ width: '40px', height: '40px', display: 'flex' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconUrl} alt="icon" width={40} height={40} />
              </div>
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
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                background: 'rgba(100, 116, 139, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid rgba(100, 116, 139, 0.2)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                width={80}
                height={80}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

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
        fonts: [
          {
            name: 'Noto Sans JP',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);

    // エラー時のフォールバック画像
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
            background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
            color: '#334155',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: '20px' }}>
            MCSRer Hotkeys
          </div>
          <div style={{ fontSize: 24, opacity: 0.6 }}>
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
