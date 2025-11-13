import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // セッションのUUIDと送信されたUUIDが一致するか確認
    if (session.user.uuid !== data.uuid) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 表示名を更新（送信されている場合）
    if (data.displayName) {
      await prisma.user.update({
        where: { uuid: data.uuid },
        data: { displayName: data.displayName },
      });
    }

    // 設定を保存または更新（UUIDを主キーとして使用）
    const settings = await prisma.playerSettings.upsert({
      where: { uuid: data.uuid },
      update: {
        // キーボード配置
        keyboardLayout: data.keyboardLayout || 'JIS',

        // マウス設定
        mouseDpi: data.mouseDpi,
        gameSensitivity: data.gameSensitivity,
        windowsSpeed: data.windowsSpeed,
        mouseAcceleration: data.mouseAcceleration,
        rawInput: data.rawInput,
        cm360: data.cm360,

        // 移動
        forward: data.forward,
        back: data.back,
        left: data.left,
        right: data.right,
        jump: data.jump,
        sneak: data.sneak,
        sprint: data.sprint,

        // アクション
        attack: data.attack,
        use: data.use,
        pickBlock: data.pickBlock,
        drop: data.drop,

        // インベントリ
        inventory: data.inventory,
        swapHands: data.swapHands,
        hotbar1: data.hotbar1,
        hotbar2: data.hotbar2,
        hotbar3: data.hotbar3,
        hotbar4: data.hotbar4,
        hotbar5: data.hotbar5,
        hotbar6: data.hotbar6,
        hotbar7: data.hotbar7,
        hotbar8: data.hotbar8,
        hotbar9: data.hotbar9,

        // ビュー・UI操作
        togglePerspective: data.togglePerspective,
        fullscreen: data.fullscreen,
        chat: data.chat,
        command: data.command,
        toggleHud: data.toggleHud,

        // リマップと外部ツール
        remappings: data.remappings,
        externalTools: data.externalTools,
        fingerAssignments: data.fingerAssignments,

        // 追加設定
        additionalSettings: data.additionalSettings,

        // プレイヤー環境設定
        gameLanguage: data.gameLanguage || null,
        mouseModel: data.mouseModel || null,
        keyboardModel: data.keyboardModel || null,
        notes: data.notes || null,
      },
      create: {
        uuid: data.uuid,

        // キーボード配置
        keyboardLayout: data.keyboardLayout || 'JIS',

        // マウス設定
        mouseDpi: data.mouseDpi,
        gameSensitivity: data.gameSensitivity,
        windowsSpeed: data.windowsSpeed,
        mouseAcceleration: data.mouseAcceleration,
        rawInput: data.rawInput,
        cm360: data.cm360,

        // 移動
        forward: data.forward,
        back: data.back,
        left: data.left,
        right: data.right,
        jump: data.jump,
        sneak: data.sneak,
        sprint: data.sprint,

        // アクション
        attack: data.attack,
        use: data.use,
        pickBlock: data.pickBlock,
        drop: data.drop,

        // インベントリ
        inventory: data.inventory,
        swapHands: data.swapHands,
        hotbar1: data.hotbar1,
        hotbar2: data.hotbar2,
        hotbar3: data.hotbar3,
        hotbar4: data.hotbar4,
        hotbar5: data.hotbar5,
        hotbar6: data.hotbar6,
        hotbar7: data.hotbar7,
        hotbar8: data.hotbar8,
        hotbar9: data.hotbar9,

        // ビュー・UI操作
        togglePerspective: data.togglePerspective,
        fullscreen: data.fullscreen,
        chat: data.chat,
        command: data.command,
        toggleHud: data.toggleHud,

        // リマップと外部ツール
        remappings: data.remappings,
        externalTools: data.externalTools,
        fingerAssignments: data.fingerAssignments,

        // 追加設定
        additionalSettings: data.additionalSettings,

        // プレイヤー環境設定
        gameLanguage: data.gameLanguage || null,
        mouseModel: data.mouseModel || null,
        keyboardModel: data.keyboardModel || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to save keybindings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    // セッションのUUIDと削除対象のUUIDが一致するか確認
    if (session.user.uuid !== uuid) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 設定を削除
    await prisma.playerSettings.delete({
      where: { uuid },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete keybindings:', error);
    return NextResponse.json(
      { error: 'Failed to delete settings' },
      { status: 500 }
    );
  }
}
