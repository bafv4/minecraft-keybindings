import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt = 'MCSRer Hotkeys';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  try {
    // アイコンSVGを読み込んでPNGに変換
    let iconDataUri: string | undefined;
    try {
      const sharp = (await import('sharp')).default;
      const iconPath = join(process.cwd(), 'public', 'icon.svg');
      const iconSvg = await readFile(iconPath);
      const iconPng = await sharp(iconSvg)
        .resize(200, 200)
        .png()
        .toBuffer();
      iconDataUri = `data:image/png;base64,${iconPng.toString('base64')}`;
    } catch (error) {
      console.error('Failed to load icon:', error);
    }

    // フォントを読み込み
    const fontBold = await readFile(join(process.cwd(), 'fonts', 'ZenKakuGothicAntique-Bold.ttf'));

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
            background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4f8 100%)',
            color: '#1e293b',
            fontFamily: 'Zen Kaku Gothic Antique',
          }}
        >
          {/* アイコン */}
          {iconDataUri && (
            <div style={{ width: '200px', height: '200px', display: 'flex', marginBottom: '40px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconDataUri} alt="icon" width={200} height={200} />
            </div>
          )}

          {/* タイトル */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '20px',
            }}
          >
            MCSRer Hotkeys
          </div>

          {/* サブタイトル */}
          <div
            style={{
              fontSize: 32,
              opacity: 0.7,
            }}
          >
            RTA勢の設定はこうなっている！
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
            background: '#f0f4f8',
            color: '#334155',
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 'bold' }}>
            MCSRer Hotkeys
          </div>
          <div style={{ fontSize: 32, marginTop: '20px', opacity: 0.7 }}>
            RTA勢の設定はこうなっている！
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
