import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { items, address } = await req.json();
    const prods = await prisma.product.findMany({ where: { id: { in: items.map(i => i.productId) } } });
    const total = items.reduce((s, i) => {
      const p = prods.find(x => x.id === i.productId);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        customerAddr: address || 'Indiranagar, Bengaluru',
        total,
        tokens: Math.round(total * 0.05),
        items: {
          create: items.map(i => {
            const p = prods.find(x => x.id === i.productId);
            return { productId: i.productId, qty: i.qty, price: p?.price || 0 };
          }),
        },
      },
      include: { items: { include: { product: true } } },
    });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { qty: { decrement: item.qty } },
      });
    }
    return NextResponse.json({ order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
