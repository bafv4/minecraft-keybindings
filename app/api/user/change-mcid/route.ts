import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { newMcid, passphrase } = await request.json();

    // バリデーション
    if (!newMcid) {
      return NextResponse.json(
        { error: '新しいMCIDを入力してください' },
        { status: 400 }
      );
    }

    // 現在のユーザー情報を取得
    const currentUser = await prisma.user.findUnique({
      where: { uuid: session.user.uuid },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // パスフレーズが設定されている場合は検証
    if (currentUser.passphrase) {
      if (!passphrase) {
        return NextResponse.json(
          { error: 'パスフレーズが必要です' },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(passphrase, currentUser.passphrase);
      if (!isValid) {
        return NextResponse.json(
          { error: 'パスフレーズが正しくありません' },
          { status: 403 }
        );
      }
    }

    // 新しいMCIDの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { mcid: newMcid },
    });

    if (existingUser && existingUser.uuid !== session.user.uuid) {
      return NextResponse.json(
        { error: 'このMCIDは既に使用されています' },
        { status: 400 }
      );
    }

    // MCIDを更新
    const updatedUser = await prisma.user.update({
      where: { uuid: session.user.uuid },
      data: { mcid: newMcid },
    });

    return NextResponse.json({
      success: true,
      user: {
        uuid: updatedUser.uuid,
        mcid: updatedUser.mcid,
        displayName: updatedUser.displayName,
      },
    });
  } catch (error) {
    console.error('MCID change error:', error);
    return NextResponse.json(
      { error: 'MCID変更中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
