'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card } from '@/components/UI';

const P = '#4B0082', G = '#F9A825';

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [placing, setPlacing] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    try { const s = sessionStorage.getItem('qmart_cart'); if (s) setCart(JSON.parse(s)); } catch {}
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []));
  }, []);

  const update = (newCart) => { setCart(newCart); sessionStorage.setItem('qmart_cart', JSON.stringify(newCart)); };
  const add = (id) => update({ ...cart, [id]: (cart[id] || 0) + 1 });
  const rm  = (id) => { const n = { ...cart }; n[id] > 1 ? n[id]-- : delete n[id]; update(n); };

  const items = Object.entries(cart).map(([id, qty]) => ({ product: products.find(p => p.id === id), qty })).filter(i => i.product);
  const total = items.reduce((s, { product: p, qty }) => s + p.price * qty, 0);
  const tokens = Math.round(total * 0.05);

  const placeOrder = async () => {
    setPlacing(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(i => ({ productId: i.product.id, qty: i.qty })) }),
    });
    const data = await res.json();
    setPlacing(false);
    if (res.ok) {
      sessionStorage.removeItem('qmart_cart');
      router.push('/customer/tracking');
    }
  };

  if (items.length === 0 && products.length > 0) return (
    <div className="fi">
      <TopBar title="Your Cart" backHref="/customer" />
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#757575' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Your cart is empty</div>
        <div style={{ fontSize: 13, marginBottom: 20 }}>Add items from the store to get started</div>
        <button onClick={() => router.push('/customer')} style={{ background: P, color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Browse Products</button>
      </div>
    </div>
  );

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="Your Cart" sub={`${items.length} item${items.length !== 1 ? 's' : ''}`} backHref="/customer" />
      <div style={{ padding: '12px 12px 0' }}>
        {items.map(({ product: p, qty }) => (
          <Card key={p.id} style={{ marginBottom: 9, padding: '11px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#9E9E9E' }}>{p.unit}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => rm(p.id)} style={{ background: '#F5F5F5', border: 'none', borderRadius: 7, width: 26, height: 26, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => add(p.id)} style={{ background: P, border: 'none', borderRadius: 7, width: 26, height: 26, fontSize: 14, color: 'white', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: P, minWidth: 52, textAlign: 'right' }}>₹{p.price * qty}</div>
            </div>
          </Card>
        ))}

        <Card style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ fontSize: 13, color: '#757575' }}>Subtotal</span><span style={{ fontSize: 13 }}>₹{total}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ fontSize: 13, color: '#757575' }}>Delivery</span><span style={{ fontSize: 13, color: '#2E7D32', fontWeight: 600 }}>FREE</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ fontSize: 13, color: '#757575' }}>Loyalty tokens</span><span style={{ fontSize: 13, color: G, fontWeight: 700 }}>🪙 +{tokens}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 9, borderTop: '1px solid #F5F5F5', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: P }}>₹{total}</span>
          </div>
          <button onClick={placeOrder} disabled={placing}
            style={{ background: placing ? '#BDBDBD' : P, color: 'white', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 15, border: 'none', cursor: placing ? 'not-allowed' : 'pointer', width: '100%' }}>
            {placing ? 'Placing Order...' : `Place Order · ₹${total}`}
          </button>
        </Card>
      </div>
      <BottomNav active="Home" />
    </div>
  );
}
