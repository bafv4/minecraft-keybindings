/**
 * プレイヤーリスト取得API
 * GET /api/players
 */

import { NextResponse } from 'next/server';
import { getPlayersList } from '@/lib/playerData';

export async function GET() {
  try {
    const players = await getPlayersList();

    return NextResponse.json({
      players,
      count: players.length,
    });
  } catch (error) {
    console.error('Error fetching players list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
