import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/avatar?uuid={uuid}&size={size}
 * Mojang公式APIからスキンテクスチャを取得してアバター画像を生成
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get('uuid');
  const size = searchParams.get('size') || '64';

  if (!uuid) {
    return NextResponse.json(
      { error: 'UUID is required' },
      { status: 400 }
    );
  }

  try {
    // ハイフンなしのUUIDに変換
    const cleanUuid = uuid.replace(/-/g, '');

    // 1. Mojang Session Server APIでプロファイル情報を取得
    const profileUrl = `https://sessionserver.mojang.com/session/minecraft/profile/${cleanUuid}`;

    const profileResponse = await fetch(profileUrl, {
      cache: 'force-cache',
    });

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch player profile from Mojang API' },
        { status: profileResponse.status }
      );
    }

    const profileData = await profileResponse.json();

    // 2. プロパティからテクスチャ情報を取得
    const textureProperty = profileData.properties?.find((prop: { name: string }) => prop.name === 'textures');

    if (!textureProperty) {
      return NextResponse.json(
        { error: 'No textures found' },
        { status: 404 }
      );
    }

    // 3. Base64デコードしてテクスチャURLを取得
    const textureData = JSON.parse(Buffer.from(textureProperty.value, 'base64').toString());
    const skinUrl = textureData.textures?.SKIN?.url;

    if (!skinUrl) {
      return NextResponse.json(
        { error: 'No skin URL found' },
        { status: 404 }
      );
    }

    // 4. スキンテクスチャを取得
    const skinResponse = await fetch(skinUrl, {
      cache: 'force-cache',
    });

    if (!skinResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch skin texture' },
        { status: 500 }
      );
    }

    const skinBuffer = await skinResponse.arrayBuffer();

    // 5. スキンからアバター部分を切り出す
    // Minecraftスキンの頭部は 8x8x8 ピクセル（64x64テクスチャの左上）
    // オーバーレイは同じ位置の32ピクセル右側
    const avatar = await extractAvatarFromSkin(skinBuffer, parseInt(size));

    return new NextResponse(new Uint8Array(avatar), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('[Avatar API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar from Mojang API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Minecraftスキンテクスチャからアバター画像を抽出
 */
async function extractAvatarFromSkin(skinBuffer: ArrayBuffer, targetSize: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  // Minecraftスキンは64x64または64x32のテクスチャ
  // 新フォーマット(1.8+): 64x64
  // - ベース頭部: (8, 8) から 8x8 ピクセル
  // - オーバーレイ頭部（帽子レイヤー）: (40, 8) から 8x8 ピクセル
  // 旧フォーマット: 64x32（オーバーレイなし）

  const skinImage = sharp(Buffer.from(skinBuffer));
  const metadata = await skinImage.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid skin texture');
  }

  // スキンが64x64か64x32かを確認
  const hasOverlay = metadata.width >= 64 && metadata.height >= 64;

  // 8x8のベース頭部を切り出し (座標は0始まり)
  const baseHead = await skinImage
    .extract({ left: 8, top: 8, width: 8, height: 8 })
    .toBuffer();

  // 合成用の最終バッファ
  let finalHead = baseHead;

  // オーバーレイがある場合のみ処理
  if (hasOverlay) {
    try {
      // Minecraft 1.8+ スキンフォーマット: オーバーレイは (40, 8) の位置
      // 重要: 元のスキン画像から新しいsharpインスタンスを作成
      // （skinImageは既にextract操作されているため、新しいインスタンスが必要）
      const freshSkinImage = sharp(Buffer.from(skinBuffer));

      // 8x8のオーバーレイ頭部を切り出し
      const overlayHead = await freshSkinImage
        .extract({ left: 40, top: 8, width: 8, height: 8 })
        .toBuffer();

      // オーバーレイが透明でない場合のみ合成
      const overlayData = await sharp(overlayHead)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      let hasVisibleOverlay = false;

      // ピクセルデータをチェック（アルファチャンネルが0でないか確認）
      const { data } = overlayData;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
          hasVisibleOverlay = true;
          break;
        }
      }

      if (hasVisibleOverlay) {
        // ベースを少し小さめにリサイズ（オーバーレイより小さく）
        const baseSize = Math.round(targetSize * 0.925);
        const resizedBase = await sharp(baseHead)
          .resize(baseSize, baseSize, { kernel: 'nearest' })
          .png()
          .toBuffer();

        // オーバーレイをターゲットサイズにリサイズ
        const resizedOverlay = await sharp(overlayHead)
          .resize(targetSize, targetSize, { kernel: 'nearest' })
          .png()
          .toBuffer();

        // ベースを中央に配置するためのオフセット計算
        const baseOffset = Math.round((targetSize - baseSize) / 2);

        // ターゲットサイズの透明キャンバスを作成し、ベースとオーバーレイを合成
        finalHead = await sharp({
          create: {
            width: targetSize,
            height: targetSize,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
          .composite([
            {
              input: resizedBase,
              top: baseOffset,
              left: baseOffset,
            },
            {
              input: resizedOverlay,
              top: 0,
              left: 0,
            }
          ])
          .png()
          .toBuffer();
      } else {
        // オーバーレイがない場合はベースのみをリサイズ
        finalHead = await sharp(baseHead)
          .resize(targetSize, targetSize, { kernel: 'nearest' })
          .png()
          .toBuffer();
      }
    } catch {
      // オーバーレイ抽出に失敗した場合はベースのみ使用
      finalHead = await sharp(baseHead)
        .resize(targetSize, targetSize, { kernel: 'nearest' })
        .png()
        .toBuffer();
    }
  } else {
    // 旧フォーマットの場合もベースをリサイズ
    finalHead = await sharp(baseHead)
      .resize(targetSize, targetSize, { kernel: 'nearest' })
      .png()
      .toBuffer();
  }

  // finalHeadは既にPNG形式なのでそのまま返す
  return finalHead;
}
