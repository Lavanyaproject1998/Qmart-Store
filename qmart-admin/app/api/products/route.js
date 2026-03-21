import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  return NextResponse.json({ products, categories });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, price, unit, emoji, fpo, qty, threshold, enabled, organic, categoryId } = await req.json();
  if (!name || !price || !unit || !emoji || !categoryId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const product = await prisma.product.create({
    data: { name, price: parseFloat(price), unit, emoji, fpo, qty: parseInt(qty) || 0, threshold: parseInt(threshold) || 10, enabled: enabled ?? true, organic: organic ?? false, categoryId },
    include: { category: true },
  });
  return NextResponse.json({ product });
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  if (data.price) data.price = parseFloat(data.price);
  if (data.qty !== undefined) data.qty = Math.max(0, parseInt(data.qty));
  if (data.threshold) data.threshold = parseInt(data.threshold);
  const product = await prisma.product.update({ where: { id }, data, include: { category: true } });
  return NextResponse.json({ product });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
