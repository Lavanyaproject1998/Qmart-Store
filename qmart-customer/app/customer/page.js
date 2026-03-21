'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/UI';

const P = '#4B0082', PM = '#7B1FA2', G = '#F9A825';

function useCart() {
  const [cart, setCart] = useState({});
  useEffect(() => { try { const s = sessionStorage.getItem('qmart_cart'); if (s) setCart(JSON.parse(s)); } catch {} }, []);
  const update = (newCart) => { setCart(newCart); sessionStorage.setItem('qmart_cart', JSON.stringify(newCart)); };
  const add = (id) => update({ ...cart, [id]: (cart[id] || 0) + 1 });
  const rm  = (id) => { const n = { ...cart }; n[id] > 1 ? n[id]-- : delete n[id]; update(n); };
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  return { cart, add, rm, count };
}

export default function CustomerHome() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const { cart, add, rm, count } = useCart();

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      setProducts(d.products || []);
      setCategories(d.categories || []);
      setLoading(false);
    });
  }, []);

  const cartTotal = Object.entries(cart).reduce((s, [id, q]) => { const p = products.find(x => x.id === id); return s + (p ? p.price * q : 0); }, 0);
  const cats = ['All', ...categories.map(c => c.name)];
  const visible = products.filter(p => p.enabled
    && (activeCat === 'All' || p.category?.name === activeCat)
    && p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ background: P, padding: '13px 13px 15px', position: 'sticky', top: 0, zIndex: 90 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11 }}>Delivering to</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Indiranagar, BLR 📍</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => router.push('/customer/tracking')} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 9, padding: '7px 11px', fontSize: 12, fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer' }}>📦 Track</button>
            {count > 0 && <button onClick={() => router.push('/customer/cart')} style={{ background: G, borderRadius: 18, padding: '7px 12px', fontSize: 12, fontWeight: 700, color: '#1a1a1a', border: 'none', cursor: 'pointer' }}>🛒 {count}</button>}
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', padding: '8px 11px', gap: 7 }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ flex: 1, border: 'none', fontSize: 13, color: '#1a1a1a', background: 'transparent' }} />
          {search && <button onClick={() => setSearch('')} style={{ color: '#757575', fontSize: 15, border: 'none', background: 'none', cursor: 'pointer' }}>×</button>}
        </div>
      </div>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg,#FFF9E5,#FFF3CD)', margin: '10px 10px 0', borderRadius: 12, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(249,168,37,.3)' }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <div><div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>10–30 Min Delivery</div><div style={{ fontSize: 11, color: '#757575' }}>Fresh, direct from farmers</div></div>
      </div>

      {/* Categories */}
      <div style={{ padding: '13px 0 0 12px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingRight: 12, paddingBottom: 3 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setActiveCat(c)} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 18, fontWeight: 600, fontSize: 11, background: activeCat === c ? P : '#F0EDF8', color: activeCat === c ? 'white' : P, border: 'none', cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div style={{ padding: '13px 10px 0' }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 9, color: '#1a1a1a' }}>
          {search ? `"${search}"` : activeCat === 'All' ? 'All Products' : activeCat}
          <span style={{ color: '#757575', fontWeight: 400, fontSize: 11 }}> ({visible.length})</span>
        </div>
        {visible.length === 0 && <div style={{ textAlign: 'center', padding: '32px 0', color: '#757575', fontSize: 13 }}>No products found</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {visible.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: 13, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
              <div onClick={() => router.push(`/customer/product/${p.id}`)} style={{ background: 'linear-gradient(135deg,#EDE7F6,#F3E5F5)', padding: '14px 10px 12px', textAlign: 'center', position: 'relative', cursor: 'pointer' }}>
                <span style={{ fontSize: 42 }}>{p.emoji}</span>
                {p.organic && <div style={{ position: 'absolute', top: 6, right: 6, background: '#2E7D32', color: 'white', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 14 }}>ORG</div>}
                {p.qty === 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: 'white', color: '#B71C1C', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 5 }}>Out of Stock</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '9px 10px 11px' }}>
                <div onClick={() => router.push(`/customer/product/${p.id}`)} style={{ fontWeight: 600, fontSize: 12, color: '#1a1a1a', marginBottom: 2, lineHeight: 1.3, cursor: 'pointer' }}>{p.name}</div>
                <div style={{ fontSize: 10, color: '#9E9E9E', marginBottom: 6 }}>{p.unit}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: P }}>₹{p.price}</span>
                  {p.qty === 0 ? <span style={{ fontSize: 10, color: '#B71C1C' }}>—</span>
                    : cart[p.id] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => rm(p.id)} style={{ background: '#F5F5F5', border: 'none', borderRadius: 6, width: 22, height: 22, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: 12, minWidth: 14, textAlign: 'center' }}>{cart[p.id]}</span>
                        <button onClick={() => add(p.id)} style={{ background: P, border: 'none', borderRadius: 6, width: 22, height: 22, fontSize: 13, color: 'white', cursor: 'pointer' }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => add(p.id)} style={{ background: P, border: 'none', borderRadius: 6, width: 24, height: 24, fontSize: 15, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart bar */}
      {count > 0 && (
        <div style={{ padding: '12px 10px 0' }}>
          <button onClick={() => router.push('/customer/cart')} className="su"
            style={{ background: `linear-gradient(135deg,${P},${PM})`, borderRadius: 14, padding: '13px 17px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 7px 24px rgba(75,0,130,.4)' }}>
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 7, padding: '2px 9px' }}><span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{count} items</span></div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Go to Cart →</span>
            <span style={{ color: G, fontWeight: 800, fontSize: 13 }}>₹{cartTotal}</span>
          </button>
        </div>
      )}
      <BottomNav active="Home" />
    </div>
  );
}
