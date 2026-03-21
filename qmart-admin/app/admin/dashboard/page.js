'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card } from '@/components/UI';

const ACCENT = '#7F1D1D', P = '#4B0082', G = '#F9A825';

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState({ products: [], orders: [], users: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([p, o, u, c]) => {
      setData({ products: p.products || [], orders: o.orders || [], users: u.users || [], categories: c.categories || [] });
      setLoading(false);
    });
  }, [status]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;

  const customers  = data.users.filter(u => u.role === 'CUSTOMER').length;
  const storeOps   = data.users.filter(u => u.role === 'DARKSTORE').length;
  const activeProds = data.products.filter(p => p.enabled).length;
  const totalGMV   = data.orders.reduce((s, o) => s + o.total, 0);

  const STATUS_COLORS = {
    pending:    { bg: '#E3F2FD', c: '#1565C0' },
    picking:    { bg: '#FFF3E0', c: '#E65100' },
    dispatched: { bg: '#F3E5F5', c: '#6A1B9A' },
    delivered:  { bg: '#E8F5E9', c: '#1B5E20' },
  };

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="QMart Admin Console" sub="admin.qmart.in"
        right={<div style={{ background: 'rgba(249,168,37,.2)', borderRadius: 18, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: G }}>ADMIN</div>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, padding: '11px 11px 0' }}>
        {[
          ['📦', data.orders.length, 'Total Orders', ACCENT],
          ['💰', `₹${totalGMV.toFixed(0)}`, 'Platform GMV', '#1B5E20'],
          ['👥', customers, 'Customers', '#1565C0'],
          ['🏪', storeOps, 'Store Operators', '#E65100'],
          ['🛍', activeProds, 'Active Products', P],
          ['🏷', data.categories.length, 'Categories', '#757575'],
        ].map(([ic, v, l, c]) => (
          <Card key={l} style={{ padding: '12px 11px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{ic}</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: '#757575', marginTop: 2 }}>{l}</div>
          </Card>
        ))}
      </div>

      {data.orders.length > 0 && (
        <div style={{ padding: '13px 11px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 9 }}>Recent Orders</div>
          {data.orders.slice(0, 6).map(o => {
            const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
            return (
              <Card key={o.id} style={{ marginBottom: 8, padding: '11px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>#{o.id.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: '#9E9E9E' }}>{o.customer?.name} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: P }}>₹{o.total}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 18, background: sc.bg, color: sc.c }}>{o.status}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <BottomNav active="Dashboard" />
    </div>
  );
}
