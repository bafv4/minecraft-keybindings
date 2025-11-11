import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.mcid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { mcid: session.user.mcid },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 設定を保存または更新
    const settings = await prisma.playerSettings.upsert({
      where: { userId: user.id },
      update: {
        // マウス設定
        mouseDpi: data.mouseDpi,
        gameSensitivity: data.gameSensitivity,
        windowsSpeed: data.windowsSpeed,
        mouseAcceleration: data.mouseAcceleration,
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

        // リマップと外部ツール
        remappings: data.remappings,
        externalTools: data.externalTools,
      },
      create: {
        userId: user.id,

        // マウス設定
        mouseDpi: data.mouseDpi,
        gameSensitivity: data.gameSensitivity,
        windowsSpeed: data.windowsSpeed,
        mouseAcceleration: data.mouseAcceleration,
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

        // リマップと外部ツール
        remappings: data.remappings,
        externalTools: data.externalTools,
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
