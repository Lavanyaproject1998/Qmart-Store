import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
export const authOptions = {
  providers: [CredentialsProvider({
    name: 'credentials',
    credentials: { email: {}, password: {} },
    async authorize(c) {
      if (!c?.email || !c?.password) return null;
      const u = await prisma.user.findUnique({ where: { email: c.email.toLowerCase().trim() } });
      if (!u || u.role !== 'CUSTOMER' || !u.active) return null;
      if (!await bcrypt.compare(c.password, u.password)) return null;
      return { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone };
    },
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.id = user.id; token.role = user.role; token.phone = user.phone; } return token; },
    async session({ session, token }) { if (session.user) { session.user.id = token.id; session.user.role = token.role; session.user.phone = token.phone; } return session; },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
