import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const ageStr = searchParams.get('age');
  const gender = searchParams.get('gender');

  const where: any = {};

  if (startDateStr && endDateStr) {
    where.timestamp = {
      gte: startOfDay(parseISO(startDateStr)),
      lte: endOfDay(parseISO(endDateStr)),
    };
  }

  if (ageStr) {
    const [min, max] = ageStr.includes('-') ? ageStr.split('-').map(Number) : [null, null];
    if (min !== null && max !== null) {
      where.user = { age: { gte: min, lte: max } };
    } else if (ageStr === '<18') {
      where.user = { age: { lt: 18 } };
    } else if (ageStr === '>40') {
      where.user = { age: { gt: 40 } };
    }
  }

  if (gender && gender !== 'All') {
    where.user = { ...where.user, gender };
  }

  try {
    // Total Clicks per Feature
    const barData = await prisma.featureClick.groupBy({
      by: ['featureName'],
      where,
      _count: {
        id: true,
      },
    });

    // Clicks Daily (Time Trend)
    // For simplicity in SQLite/Prisma, we fetch all filtered clicks and group in JS
    // In production (Postgres), we'd use raw SQL or date_trunc
    const trendClicks = await prisma.featureClick.findMany({
      where,
      select: {
        timestamp: true,
        featureName: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    const trendDataMap: Record<string, any> = {};
    trendClicks.forEach((click) => {
      const date = click.timestamp.toISOString().split('T')[0];
      if (!trendDataMap[date]) {
        trendDataMap[date] = { date, count: 0, features: {} };
      }
      trendDataMap[date].count += 1;
      trendDataMap[date].features[click.featureName] = (trendDataMap[date].features[click.featureName] || 0) + 1;
    });

    const trendData = Object.values(trendDataMap);

    return NextResponse.json({
      barData: barData.map((b) => ({ feature: b.featureName, count: b._count.id })),
      trendData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
