import { NextRequest, NextResponse } from 'next/server';
import { generateAvatar, STEVE_UUID } from '@bafv4/mcavatar';

/**
 * GET /api/avatar?uuid={uuid}&size={size}
 * Mojang公式APIからスキンテクスチャを取得してアバター画像を生成
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get('uuid');
  const size = parseInt(searchParams.get('size') || '64', 10);

  if (!uuid) {
    return NextResponse.json(
      { error: 'UUID is required' },
      { status: 400 }
    );
  }

  try {
    const result = await generateAvatar(uuid, {
      size,
      includeOverlay: true,
      fallbackUuid: STEVE_UUID,
    });

    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        'Content-Type': result.contentType,
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
