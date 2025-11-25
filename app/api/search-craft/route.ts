import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/search-craft?uuid={uuid}
 * サーチクラフト設定を取得
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    const searchCrafts = await prisma.searchCraft.findMany({
      where: { uuid },
      orderBy: { sequence: 'asc' },
    });

    return NextResponse.json(searchCrafts);
  } catch (error) {
    console.error('Error fetching search crafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search crafts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search-craft
 * サーチクラフト設定を作成・更新
 *
 * Body: {
 *   uuid: string,
 *   crafts: Array<{
 *     sequence: number,
 *     item1?: string,
 *     item2?: string,
 *     item3?: string,
 *     keys: string[] // 実際に押す物理キーの配列（逆リマップ適用済み、Web形式、最大4キー、例：["KeyQ", "KeyW", "KeyE", "KeyR"]）
 *     searchStr?: string // サーチ文字列（リマップ後、例：" abc", "Ctrl+Q"）
 *     comment?: string // コメント（任意）
 *   }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, crafts } = body;

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(crafts)) {
      return NextResponse.json(
        { error: 'crafts must be an array' },
        { status: 400 }
      );
    }

    // 既存のサーチクラフトを削除
    await prisma.searchCraft.deleteMany({
      where: { uuid },
    });

    // 新しいサーチクラフトを作成
    const results = [];
    for (const craft of crafts) {
      try {
        // keysを直接使用（実際に押す物理キー、逆リマップ適用済み）
        const [key1, key2, key3, key4] = craft.keys || [];

        const result = await prisma.searchCraft.create({
          data: {
            uuid,
            sequence: craft.sequence,
            item1: craft.item1 || null,
            item2: craft.item2 || null,
            item3: craft.item3 || null,
            key1: key1 || null,
            key2: key2 || null,
            key3: key3 || null,
            key4: key4 || null,
            searchStr: craft.searchStr || null,
            comment: craft.comment || null,
          },
        });

        results.push(result);
      } catch (error) {
        console.error(`Error creating search craft ${craft.sequence}:`, error);
        // 個別のエラーはスキップして続行
        continue;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error saving search crafts:', error);
    return NextResponse.json(
      { error: 'Failed to save search crafts' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/search-craft?uuid={uuid}
 * サーチクラフト設定を削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    await prisma.searchCraft.deleteMany({
      where: { uuid },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting search crafts:', error);
    return NextResponse.json(
      { error: 'Failed to delete search crafts' },
      { status: 500 }
    );
  }
}
