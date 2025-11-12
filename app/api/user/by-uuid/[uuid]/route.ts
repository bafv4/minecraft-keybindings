import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    uuid: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { uuid } = await params;

    const user = await prisma.user.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        mcid: true,
        displayName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
