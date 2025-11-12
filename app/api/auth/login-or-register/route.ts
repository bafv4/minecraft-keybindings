import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';

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

      // UUIDにハイフンを追加
      uuid = uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    } catch (error) {
      console.error('Failed to fetch UUID from Mojang:', error);
      return NextResponse.json(
        { error: 'Minecraft UUIDの取得に失敗しました。MCIDが正しいか確認してください' },
        { status: 500 }
      );
    }

    // UUIDで既存ユーザーを検索
    const existingUser = await prisma.user.findUnique({
      where: { uuid },
    });

    if (existingUser) {
      // ユーザーが存在する場合: ログイン処理

      // パスフレーズが設定されている場合は検証
      if (existingUser.passphrase) {
        if (!passphrase) {
          return NextResponse.json(
            { error: 'このアカウントにはパスフレーズが設定されています' },
            { status: 401 }
          );
        }

        const isValid = await bcrypt.compare(passphrase, existingUser.passphrase);
        if (!isValid) {
          return NextResponse.json(
            { error: 'パスフレーズが正しくありません' },
            { status: 401 }
          );
        }
      }

      // MCIDが変更されている場合は更新
      if (existingUser.mcid !== mcid) {
        await prisma.user.update({
          where: { uuid },
          data: { mcid },
        });
      }

      return NextResponse.json({
        action: 'login',
        user: {
          uuid: existingUser.uuid,
          mcid,
          displayName: existingUser.displayName,
        },
      });
    } else {
      // ユーザーが存在しない場合: 新規登録

      if (!displayName) {
        return NextResponse.json(
          { error: '初回登録には表示名が必要です' },
          { status: 400 }
        );
      }

      // パスフレーズをハッシュ化（提供された場合）
      let hashedPassphrase = null;
      if (passphrase && passphrase.trim()) {
        hashedPassphrase = await bcrypt.hash(passphrase, 10);
      }

      // ユーザーを作成
      const newUser = await prisma.user.create({
        data: {
          uuid,
          mcid,
          passphrase: hashedPassphrase,
          displayName,
        },
      });

      return NextResponse.json({
        action: 'register',
        user: {
          uuid: newUser.uuid,
          mcid: newUser.mcid,
          displayName: newUser.displayName,
        },
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Login/Register error:', error);
    return NextResponse.json(
      { error: '処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
