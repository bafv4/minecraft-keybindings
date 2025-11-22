import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/item-layouts?uuid={uuid}
 * 指定されたUUIDのアイテム配置を全て取得
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get('uuid');

  if (!uuid) {
    return NextResponse.json(
      { error: 'UUID is required' },
      { status: 400 }
    );
  }

  try {
    const layouts = await prisma.itemLayout.findMany({
      where: { uuid },
      orderBy: { segment: 'asc' },
    });

    return NextResponse.json(layouts);
  } catch (error) {
    console.error('Failed to fetch item layouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item layouts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/item-layouts
 * アイテム配置を作成または更新
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, segment, slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, offhand, notes } = body;

    if (!uuid || !segment) {
      return NextResponse.json(
        { error: 'UUID and segment are required' },
        { status: 400 }
      );
    }

    // Upsert (create or update)
    const layout = await prisma.itemLayout.upsert({
      where: {
        uuid_segment: {
          uuid,
          segment,
        },
      },
      update: {
        slot1: slot1 || [],
        slot2: slot2 || [],
        slot3: slot3 || [],
        slot4: slot4 || [],
        slot5: slot5 || [],
        slot6: slot6 || [],
        slot7: slot7 || [],
        slot8: slot8 || [],
        slot9: slot9 || [],
        offhand: offhand || [],
        notes,
      },
      create: {
        uuid,
        segment,
        slot1: slot1 || [],
        slot2: slot2 || [],
        slot3: slot3 || [],
        slot4: slot4 || [],
        slot5: slot5 || [],
        slot6: slot6 || [],
        slot7: slot7 || [],
        slot8: slot8 || [],
        slot9: slot9 || [],
        offhand: offhand || [],
        notes,
      },
    });

    return NextResponse.json(layout);
  } catch (error) {
    console.error('Failed to save item layout:', error);
    return NextResponse.json(
      { error: 'Failed to save item layout' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/item-layouts?uuid={uuid}&segment={segment}
 * 指定されたアイテム配置を削除
 */
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get('uuid');
  const segment = searchParams.get('segment');

  if (!uuid || !segment) {
    return NextResponse.json(
      { error: 'UUID and segment are required' },
      { status: 400 }
    );
  }

  try {
    await prisma.itemLayout.delete({
      where: {
        uuid_segment: {
          uuid,
          segment,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item layout:', error);
    return NextResponse.json(
      { error: 'Failed to delete item layout' },
      { status: 500 }
    );
  }
}
