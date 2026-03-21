'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card } from '@/components/UI';

const P = '#4B0082', G = '#F9A825';

export default function WalletPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
  }, [status]);

  const totalTokens = orders.reduce((s, o) => s + (o.tokens || 0), 0);
  const totalSpend  = orders.reduce((s, o) => s + o.total, 0);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="Wallet" />
      <div style={{ background: `linear-gradient(135deg,${P},#7B1FA2)`, margin: 11, borderRadius: 18, padding: 20, boxShadow: '0 6px 24px rgba(75,0,130,.3)' }}>
        <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 12, marginBottom: 4 }}>Loyalty Tokens</div>
        <div style={{ color: G, fontSize: 38, fontWeight: 800, margin: '2px 0 4px' }}>🪙 {totalTokens}</div>
        <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 12 }}>≈ ₹{totalTokens} redeemable value</div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {[['📦', orders.length, 'Total Orders'], ['💰', `₹${totalSpend.toFixed(0)}`, 'Total Spend']].map(([ic, v, l]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{ic}</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{v}</div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 11px' }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 11, color: '#1a1a1a' }}>Order History</div>
          {orders.length === 0 && <div style={{ color: '#757575', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No orders yet</div>}
          {orders.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>#{o.id.slice(-8).toUpperCase()}</div>
                <div style={{ fontSize: 11, color: '#9E9E9E' }}>{o.items?.length} items · {new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: P }}>₹{o.total}</div>
                <div style={{ fontSize: 10, color: G }}>+{o.tokens} 🪙</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <BottomNav active="Wallet" />
    </div>
  );
}
