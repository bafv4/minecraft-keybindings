import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// UUIDからMCIDを取得するMojang API
async function fetchMcidFromUuid(uuid: string): Promise<string | null> {
  try {
    // UUIDからハイフンを削除
    const cleanUuid = uuid.replace(/-/g, '');

    const response = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${cleanUuid}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch MCID for UUID ${uuid}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.error(`Error fetching MCID for UUID ${uuid}:`, error);
    return null;
  }
}

// 全ユーザーのMCIDを同期
export async function POST(request: Request) {
  try {
    // セキュリティ: Cron-Secretヘッダーをチェック（Vercel Cronジョブ用）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // すべてのユーザーを取得
    const users = await prisma.user.findMany({
      select: { uuid: true, mcid: true },
    });

    let updatedCount = 0;
    let errorCount = 0;
    const updates: { uuid: string; oldMcid: string; newMcid: string }[] = [];

    // 各ユーザーのMCIDを同期
    for (const user of users) {
      const latestMcid = await fetchMcidFromUuid(user.uuid);

      if (!latestMcid) {
        errorCount++;
        continue;
      }

      // MCIDが変更されている場合のみ更新
      if (latestMcid !== user.mcid) {
        await prisma.user.update({
          where: { uuid: user.uuid },
          data: { mcid: latestMcid },
        });

        updates.push({
          uuid: user.uuid,
          oldMcid: user.mcid,
          newMcid: latestMcid,
        });

        updatedCount++;
      }

      // Mojang APIのレート制限を考慮して少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      updatedCount,
      errorCount,
      updates,
    });
  } catch (error) {
    console.error('Failed to sync MCIDs:', error);
    return NextResponse.json(
      { error: 'Failed to sync MCIDs' },
      { status: 500 }
    );
  }
}

// 特定のユーザーのMCIDを同期（手動同期用）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid },
      select: { uuid: true, mcid: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const latestMcid = await fetchMcidFromUuid(user.uuid);

    if (!latestMcid) {
      return NextResponse.json(
        { error: 'Failed to fetch MCID from Mojang API' },
        { status: 500 }
      );
    }

    // MCIDが変更されている場合のみ更新
    if (latestMcid !== user.mcid) {
      await prisma.user.update({
        where: { uuid: user.uuid },
        data: { mcid: latestMcid },
      });

      return NextResponse.json({
        success: true,
        updated: true,
        oldMcid: user.mcid,
        newMcid: latestMcid,
      });
    }

    return NextResponse.json({
      success: true,
      updated: false,
      mcid: user.mcid,
    });
  } catch (error) {
    console.error('Failed to sync MCID:', error);
    return NextResponse.json(
      { error: 'Failed to sync MCID' },
      { status: 500 }
    );
  }
}
