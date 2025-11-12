import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();

    // 認証チェック
    if (!session?.user?.uuid) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { mcid, uuid } = await request.json();

    // バリデーション
    if (!mcid || !mcid.trim()) {
      return NextResponse.json(
        { error: 'MCIDは必須です' },
        { status: 400 }
      );
    }

    // 既にMCIDが設定されているかチェック
    const currentUser = await prisma.user.findUnique({
      where: { uuid: session.user.uuid },
      select: { mcid: true },
    });

    if (currentUser?.mcid) {
      return NextResponse.json(
        { error: 'MCIDは既に設定されています' },
        { status: 400 }
      );
    }

    // MCIDの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { mcid: mcid.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このMCIDは既に使用されています' },
        { status: 400 }
      );
    }

    // UUIDの重複チェック（UUIDが提供された場合）
    if (uuid && uuid.trim()) {
      const existingUserByUuid = await prisma.user.findUnique({
        where: { uuid: uuid.trim() },
      });

      if (existingUserByUuid) {
        return NextResponse.json(
          { error: 'このUUIDは既に使用されています' },
          { status: 400 }
        );
      }
    }

    // ユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: { uuid: session.user.uuid },
      data: {
        mcid: mcid.trim(),
        displayName: mcid.trim(), // 表示名もMCIDに設定
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        uuid: updatedUser.uuid,
        mcid: updatedUser.mcid,
      },
    });
  } catch (error) {
    console.error('Update MCID error:', error);
    return NextResponse.json(
      { error: '設定中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
