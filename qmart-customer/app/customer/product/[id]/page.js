'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card } from '@/components/UI';

const P = '#4B0082', PL = '#EDE7F6', G = '#F9A825';

export default function ProductDetail({ params }) {
  const { status } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      setProduct((d.products || []).find(p => p.id === params.id) || null);
      setLoading(false);
    });
  }, [params.id]);

  const addToCart = () => {
    try {
      const cart = JSON.parse(sessionStorage.getItem('qmart_cart') || '{}');
      cart[product.id] = (cart[product.id] || 0) + qty;
      sessionStorage.setItem('qmart_cart', JSON.stringify(cart));
    } catch {}
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;
  if (!product) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Product not found.</div>;

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title={product.name} backHref="/customer" />

      <div style={{ background: `linear-gradient(135deg,${PL},#F3E5F5)`, padding: '32px 0', textAlign: 'center' }}>
        <span style={{ fontSize: 88 }}>{product.emoji}</span>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 11 }}>
          {product.organic && <span style={{ background: '#2E7D32', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>🌿 Organic</span>}
          {product.fpo && <span style={{ background: PL, color: P, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>🌾 {product.fpo}</span>}
        </div>
      </div>

      <div style={{ padding: '14px 13px 0' }}>
        <Card style={{ marginBottom: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 19, color: '#1a1a1a', margin: '0 0 3px' }}>{product.name}</h2>
              <div style={{ fontSize: 12, color: '#757575' }}>📦 {product.unit}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 23, color: P }}>₹{product.price}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 8 }}>Fresh produce sourced directly from verified FPO farmers. Quality checked and delivered within hours.</div>
          <div style={{ fontSize: 13 }}>⭐⭐⭐⭐⭐ <span style={{ fontSize: 11, color: '#757575' }}>4.9 · 1.2k reviews</span></div>
        </Card>

        {product.fpo && (
          <Card style={{ marginBottom: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🌾</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>Sourced from {product.fpo}</div>
                <div style={{ fontSize: 11, color: '#757575', marginTop: 2 }}>Verified farmer producer organisation · Direct from farm</div>
              </div>
            </div>
          </Card>
        )}

        {product.qty === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '8px 0', color: '#B71C1C', fontWeight: 700, fontSize: 15 }}>Out of Stock</div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#757575', marginTop: 4 }}>Check back soon — we restock regularly</div>
          </Card>
        ) : (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: '#F5F5F5', border: 'none', borderRadius: 9, width: 34, height: 34, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span style={{ fontWeight: 700, fontSize: 18, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ background: P, border: 'none', borderRadius: 9, width: 34, height: 34, fontSize: 18, color: 'white', cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <button onClick={addToCart} style={{ background: added ? '#2E7D32' : P, color: 'white', borderRadius: 12, padding: '14px 16px', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'space-between', transition: 'background .2s' }}>
              <span>{added ? '✅ Added to Cart!' : '🛒 Add to Cart'}</span>
              <span>₹{product.price * qty}</span>
            </button>
          </Card>
        )}
      </div>
      <BottomNav active="Home" />
    </div>
  );
}
