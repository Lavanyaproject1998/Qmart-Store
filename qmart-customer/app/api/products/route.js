import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'asc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return NextResponse.json({ products, categories });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
