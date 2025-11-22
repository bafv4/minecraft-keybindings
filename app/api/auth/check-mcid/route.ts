import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/auth/check-mcid?mcid={mcid}
 * MCIDが登録済みかどうかをチェック
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mcid = searchParams.get('mcid');

    if (!mcid) {
      return NextResponse.json(
        { error: 'MCIDが必要です' },
        { status: 400 }
      );
    }

    // MCIDの存在チェック
    const user = await prisma.user.findUnique({
      where: { mcid },
      select: { mcid: true },
    });

    return NextResponse.json({
      exists: !!user,
    });
  } catch (error) {
    console.error('MCID check error:', error);
    return NextResponse.json(
      { error: 'チェックに失敗しました' },
      { status: 500 }
    );
  }
}
