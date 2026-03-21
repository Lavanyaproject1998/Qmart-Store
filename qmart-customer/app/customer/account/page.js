'use client';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card } from '@/components/UI';

const P = '#4B0082';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);
  if (!session) return null;
  const user = session.user;
  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="My Account" />
      <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: P, margin: '0 auto 10px' }}>{user.name?.charAt(0)}</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a1a' }}>{user.name}</div>
        <div style={{ fontSize: 13, color: '#757575' }}>{user.email}</div>
      </div>
      <div style={{ padding: '0 12px' }}>
        <Card style={{ marginBottom: 11 }}>
          {[['📱', 'Phone', user.phone || '—'], ['📧', 'Email', user.email], ['🏠', 'Default Address', 'Indiranagar, Bengaluru']].map(([ic, lb, val]) => (
            <div key={lb} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
              <span style={{ fontSize: 18 }}>{ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#757575' }}>{lb}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
              </div>
            </div>
          ))}
        </Card>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ width: '100%', background: '#B71C1C', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
      <BottomNav active="Account" />
    </div>
  );
}
