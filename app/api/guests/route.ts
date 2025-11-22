import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/guests
 * ゲストユーザー一覧を取得（管理者のみ）
 */
export async function GET() {
  try {
    const session = await auth();

    if (!isAdmin(session?.user?.uuid)) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const guests = await prisma.user.findMany({
      where: { isGuest: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error('Failed to fetch guests:', error);
    return NextResponse.json(
      { error: 'ゲストユーザーの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guests
 * ゲストユーザーを作成（管理者のみ）
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!isAdmin(session?.user?.uuid)) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { mcid, displayName } = data;

    if (!mcid) {
      return NextResponse.json(
        { error: 'MCIDは必須です' },
        { status: 400 }
      );
    }

    // Mojang APIからUUIDを取得
    let uuid: string;
    try {
      const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mcid}`);

      if (!mojangResponse.ok) {
        if (mojangResponse.status === 404) {
          return NextResponse.json(
            { error: 'このMCIDは存在しません。正しいMinecraft Java版のユーザー名を入力してください' },
            { status: 400 }
          );
        }
        throw new Error('Mojang API error');
      }

      const mojangData = await mojangResponse.json();
      uuid = mojangData.id;

      // UUIDにハイフンを追加（Mojang APIはハイフンなしで返す）
      uuid = uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    } catch (error) {
      console.error('Failed to fetch UUID from Mojang:', error);
      return NextResponse.json(
        { error: 'Minecraft UUIDの取得に失敗しました。MCIDが正しいか確認してください' },
        { status: 500 }
      );
    }

    // ゲストユーザーを作成
    const guest = await prisma.user.create({
      data: {
        uuid,
        mcid,
        displayName: displayName || null,
        isGuest: true,
      },
    });

    return NextResponse.json(guest);
  } catch (error: any) {
    console.error('Failed to create guest:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'このMCIDまたはUUIDは既に存在します' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ゲストユーザーの作成に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/guests?uuid={uuid}
 * ゲストユーザーを削除（管理者のみ）
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!isAdmin(session?.user?.uuid)) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUIDは必須です' },
        { status: 400 }
      );
    }

    // ゲストユーザーのみ削除可能
    const user = await prisma.user.findUnique({
      where: { uuid },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (!user.isGuest) {
      return NextResponse.json(
        { error: 'ゲストユーザーのみ削除できます' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { uuid },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete guest:', error);
    return NextResponse.json(
      { error: 'ゲストユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
}
