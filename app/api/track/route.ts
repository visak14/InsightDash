import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { featureName } = await request.json();

    if (!featureName) {
      return NextResponse.json({ error: 'Missing feature name' }, { status: 400 });
    }

    await prisma.featureClick.create({
      data: {
        userId: session.user.id,
        featureName,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
