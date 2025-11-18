import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { UpdateKeybindingsRequest, PlayerData } from '@/types/keybinding';

/**
 * GET /api/keybindings
 * プレイヤーの全設定を取得
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const uuid = session.user.uuid;

    // 並列で全データ取得
    const [user, settings, keybindings, keyRemaps, externalTools] = await Promise.all([
      prisma.user.findUnique({ where: { uuid } }),
      prisma.playerSettings.findUnique({ where: { uuid } }),
      prisma.keybinding.findMany({
        where: { uuid },
        orderBy: [
          { category: 'asc' },
          { action: 'asc' }
        ]
      }),
      prisma.keyRemap.findMany({ where: { uuid } }),
      prisma.externalTool.findMany({ where: { uuid } }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const response: PlayerData = {
      uuid: user.uuid,
      mcid: user.mcid,
      displayName: user.displayName || undefined,
      settings: settings ? {
        keyboardLayout: settings.keyboardLayout,
        mouseDpi: settings.mouseDpi ?? undefined,
        gameSensitivity: settings.gameSensitivity ?? undefined,
        windowsSpeed: settings.windowsSpeed ?? undefined,
        mouseAcceleration: settings.mouseAcceleration,
        rawInput: settings.rawInput,
        cm360: settings.cm360 ?? undefined,
        gameLanguage: settings.gameLanguage ?? undefined,
        mouseModel: settings.mouseModel ?? undefined,
        keyboardModel: settings.keyboardModel ?? undefined,
        notes: settings.notes ?? undefined,
      } : {
        keyboardLayout: 'JIS',
        mouseAcceleration: false,
        rawInput: true,
      },
      keybindings: keybindings.map(kb => ({
        action: kb.action,
        keyCode: kb.keyCode,
        category: kb.category as any,
        isCustom: kb.isCustom,
        fingers: kb.fingers as any[],
      })),
      keyRemaps: keyRemaps.map(remap => ({
        sourceKey: remap.sourceKey,
        targetKey: remap.targetKey,
      })),
      externalTools: externalTools.map(tool => ({
        triggerKey: tool.triggerKey,
        toolName: tool.toolName,
        actionName: tool.actionName,
        description: tool.description || undefined,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch keybindings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/keybindings
 * プレイヤーの全設定を更新
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const uuid = session.user.uuid;
    const data: UpdateKeybindingsRequest = await request.json();

    // トランザクションで全更新
    await prisma.$transaction(async (tx) => {
      // 1. 表示名更新（送信されている場合）
      if (data.settings && 'displayName' in data.settings) {
        await tx.user.update({
          where: { uuid },
          data: { displayName: (data.settings as any).displayName || null },
        });
      }

      // 2. PlayerSettings更新
      if (data.settings) {
        await tx.playerSettings.upsert({
          where: { uuid },
          update: {
            keyboardLayout: data.settings.keyboardLayout,
            mouseDpi: data.settings.mouseDpi,
            gameSensitivity: data.settings.gameSensitivity,
            windowsSpeed: data.settings.windowsSpeed,
            mouseAcceleration: data.settings.mouseAcceleration,
            rawInput: data.settings.rawInput,
            cm360: data.settings.cm360,
            gameLanguage: data.settings.gameLanguage,
            mouseModel: data.settings.mouseModel,
            keyboardModel: data.settings.keyboardModel,
            notes: data.settings.notes,
          },
          create: {
            uuid,
            keyboardLayout: data.settings.keyboardLayout || 'JIS',
            mouseDpi: data.settings.mouseDpi,
            gameSensitivity: data.settings.gameSensitivity,
            windowsSpeed: data.settings.windowsSpeed,
            mouseAcceleration: data.settings.mouseAcceleration ?? false,
            rawInput: data.settings.rawInput ?? true,
            cm360: data.settings.cm360,
            gameLanguage: data.settings.gameLanguage,
            mouseModel: data.settings.mouseModel,
            keyboardModel: data.settings.keyboardModel,
            notes: data.settings.notes,
          },
        });
      }

      // 3. Keybinding更新（全削除 → 再作成）
      if (data.keybindings && data.keybindings.length > 0) {
        await tx.keybinding.deleteMany({ where: { uuid } });
        await tx.keybinding.createMany({
          data: data.keybindings.map(kb => ({
            uuid,
            action: kb.action,
            keyCode: kb.keyCode,
            category: kb.category,
            isCustom: kb.isCustom,
            fingers: kb.fingers || [],
          })),
        });
      }

      // 4. KeyRemap更新（全削除 → 再作成）
      if (data.keyRemaps !== undefined) {
        await tx.keyRemap.deleteMany({ where: { uuid } });
        if (data.keyRemaps.length > 0) {
          await tx.keyRemap.createMany({
            data: data.keyRemaps.map(remap => ({
              uuid,
              sourceKey: remap.sourceKey,
              targetKey: remap.targetKey,
            })),
          });
        }
      }

      // 5. ExternalTool更新（全削除 → 再作成）
      if (data.externalTools !== undefined) {
        await tx.externalTool.deleteMany({ where: { uuid } });
        if (data.externalTools.length > 0) {
          await tx.externalTool.createMany({
            data: data.externalTools.map(tool => ({
              uuid,
              triggerKey: tool.triggerKey,
              toolName: tool.toolName,
              actionName: tool.actionName,
              description: tool.description,
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save keybindings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/keybindings
 * プレイヤーの全設定を削除
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const uuid = session.user.uuid;

    // カスケード削除により、関連データも自動削除される
    await prisma.playerSettings.delete({
      where: { uuid },
    });

    // 念のため明示的に削除
    await Promise.all([
      prisma.keybinding.deleteMany({ where: { uuid } }),
      prisma.keyRemap.deleteMany({ where: { uuid } }),
      prisma.externalTool.deleteMany({ where: { uuid } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete keybindings:', error);
    return NextResponse.json(
      { error: 'Failed to delete settings' },
      { status: 500 }
    );
  }
}
