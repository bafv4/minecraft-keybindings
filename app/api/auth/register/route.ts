import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { mcid, passphrase, displayName } = await request.json();

    // バリデーション
    if (!mcid) {
      return NextResponse.json(
        { error: 'MCIDは必須です' },
        { status: 400 }
      );
    }

    // 表示名が未入力の場合はMCIDを使用
    const finalDisplayName = displayName && displayName.trim() ? displayName.trim() : mcid;

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

    // UUIDの重複チェック
    const existingUserByUuid = await prisma.user.findUnique({
      where: { uuid },
    });

    if (existingUserByUuid) {
      return NextResponse.json(
        { error: 'このMinecraftアカウント（UUID）は既に登録されています' },
        { status: 400 }
      );
    }

    // MCIDの重複チェック
    const existingUserByMcid = await prisma.user.findUnique({
      where: { mcid },
    });

    if (existingUserByMcid) {
      return NextResponse.json(
        { error: 'このMCIDは既に使用されています' },
        { status: 400 }
      );
    }

    // パスフレーズをハッシュ化（提供された場合）
    let hashedPassphrase = null;
    if (passphrase && passphrase.trim()) {
      hashedPassphrase = await bcrypt.hash(passphrase, 10);
    }

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        uuid,
        mcid,
        passphrase: hashedPassphrase,
        displayName: finalDisplayName,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          uuid: user.uuid,
          mcid: user.mcid,
          displayName: user.displayName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
