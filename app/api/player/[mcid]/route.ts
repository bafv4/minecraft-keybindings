/**
 * 個別プレイヤーデータ取得API
 * GET /api/player/[mcid]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlayerData } from '@/lib/playerData';

interface RouteParams {
  params: Promise<{
    mcid: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { mcid } = await params;

    if (!mcid) {
      return NextResponse.json(
        { error: 'MCID is required' },
        { status: 400 }
      );
    }

    const playerData = await getPlayerData(mcid);

    if (!playerData) {
      return NextResponse.json(
        { error: 'Player not found or has no settings' },
        { status: 404 }
      );
    }

    return NextResponse.json(playerData);
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
