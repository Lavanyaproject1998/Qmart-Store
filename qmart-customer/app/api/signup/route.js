import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, email: email.toLowerCase().trim(), password: hashed, phone, role: 'CUSTOMER' } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
