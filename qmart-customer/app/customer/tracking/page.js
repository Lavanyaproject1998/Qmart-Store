'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card } from '@/components/UI';

const P = '#4B0082', PL = '#EDE7F6', G = '#F9A825';
const STEPS = [
  { label: 'Order Placed',    icon: '📝', desc: 'Confirmed & sent to dark store' },
  { label: 'Preparing',       icon: '🏪', desc: 'Store is picking your items'    },
  { label: 'Out for Delivery',icon: '🛵', desc: 'Rider is on the way'            },
  { label: 'Delivered',       icon: '✅', desc: 'Enjoy your fresh groceries!'    },
];
const STATUS_TO_STEP = { pending: 0, picking: 1, dispatched: 2, delivered: 3 };

export default function TrackingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const load = () => fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
    load();
    const iv = setInterval(load, 5000); // poll every 5s for live updates
    return () => clearInterval(iv);
  }, [status]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;

  const activeOrder = orders[0];
  const step = activeOrder ? (STATUS_TO_STEP[activeOrder.status] ?? 0) : null;

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="Order Tracking" sub={activeOrder ? `#${activeOrder.id.slice(-8).toUpperCase()}` : undefined} />

      {!activeOrder ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#757575' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No active orders</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Place an order to track it here</div>
          <button onClick={() => router.push('/customer')} style={{ background: P, color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Shop Now</button>
        </div>
      ) : (
        <>
          {/* Status card */}
          <div style={{ background: `linear-gradient(135deg,${P},#7B1FA2)`, margin: 11, borderRadius: 18, padding: 17, boxShadow: '0 6px 24px rgba(75,0,130,.3)' }}>
            <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 11, marginBottom: 2 }}>Status</div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 3 }}>
              {step === 3 ? 'Delivered! 🎉' : step === 2 ? 'On the Way 🛵' : step === 1 ? 'Being Prepared 🏪' : 'Order Confirmed ✅'}
            </div>
            <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 12 }}>
              {step < 3 ? '~10–30 min · Indiranagar, Bengaluru' : 'Successfully delivered'}
            </div>
            {step < 3 && (
              <div style={{ marginTop: 11, background: 'rgba(255,255,255,.15)', borderRadius: 9, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🛵</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>Suresh D.</div>
                  <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 10 }}>⭐ 4.9 · Your rider</div>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <Card style={{ margin: '0 11px 10px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1a1a1a' }}>Order Progress</div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 18, top: 18, bottom: 18, width: 2, background: '#F0F0F0' }} />
              <div style={{ position: 'absolute', left: 18, top: 18, width: 2, background: P, height: `${(step / (STEPS.length - 1)) * 100}%`, transition: 'height .6s ease' }} />
              {STEPS.map((s, i) => {
                const done = i < step, cur = i === step;
                return (
                  <div key={i} style={{ display: 'flex', gap: 11, marginBottom: 13, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: done ? P : cur ? PL : '#F5F5F5', border: `2px solid ${done || cur ? P : '#E0E0E0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all .3s' }}>{s.icon}</div>
                    <div style={{ flex: 1, paddingTop: 6 }}>
                      <div style={{ fontWeight: cur ? 700 : 600, fontSize: 13, color: done || cur ? '#1a1a1a' : '#BDBDBD' }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: cur ? '#555' : '#BDBDBD' }}>{s.desc}</div>
                      {cur && step < 3 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: P, background: PL, borderRadius: 18, padding: '2px 8px', marginTop: 4 }}>
                          <span className="pu" style={{ width: 5, height: 5, borderRadius: '50%', background: P, display: 'inline-block' }} />
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Order summary */}
          <Card style={{ margin: '0 11px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#1a1a1a' }}>Order Summary</div>
            {activeOrder.items?.map((item, i) => item.product && (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.product.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{item.product.name}</div>
                  <div style={{ fontSize: 10, color: '#9E9E9E' }}>x{item.qty}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: P }}>₹{item.price * item.qty}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Total</div>
                {step === 3 && <div style={{ fontSize: 11, color: G }}>🪙 +{activeOrder.tokens} tokens earned</div>}
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: P }}>₹{activeOrder.total}</span>
            </div>
          </Card>
        </>
      )}
      <BottomNav active="Orders" />
    </div>
  );
}
