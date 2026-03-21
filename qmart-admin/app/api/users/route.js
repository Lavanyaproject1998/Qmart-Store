import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, store: true, active: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ users });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, email, store } = await req.json();
  if (!name || !email || !store) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  // Generate one-time password
  const rawPassword = Math.random().toString(36).slice(2, 8).toUpperCase();
  const hashed = await bcrypt.hash(rawPassword, 12);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase().trim(), password: hashed, role: 'DARKSTORE', store, active: true },
    select: { id: true, name: true, email: true, role: true, store: true, active: true },
  });
  return NextResponse.json({ user, rawPassword });
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, active } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const user = await prisma.user.update({
    where: { id },
    data: { active },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return NextResponse.json({ user });
}
