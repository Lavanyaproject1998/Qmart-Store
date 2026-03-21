'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card, Toggle, Input } from '@/components/UI';

const P = '#4B0082', ACCENT = '#7F1D1D';

export default function AdminProducts() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', unit: '', emoji: '', fpo: '', qty: '', threshold: '10', categoryId: '', organic: false });
  const [errs, setErrs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  const load = () => fetch('/api/products').then(r => r.json()).then(d => { setProducts(d.products || []); setCategories(d.categories || []); setLoading(false); });
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.price || isNaN(form.price)) e.price = 'Valid price required';
    if (!form.unit.trim()) e.unit = 'Required';
    if (!form.emoji.trim()) e.emoji = 'Required';
    if (!form.categoryId) e.categoryId = 'Select a category';
    if (form.qty === '' || isNaN(form.qty)) e.qty = 'Required';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setSubmitting(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), qty: parseInt(form.qty), threshold: parseInt(form.threshold) || 10 }),
    });
    if (res.ok) {
      setForm({ name: '', price: '', unit: '', emoji: '', fpo: '', qty: '', threshold: '10', categoryId: '', organic: false });
      setErrs({}); setShowForm(false); load();
    }
    setSubmitting(false);
  };

  const toggleEnabled = async (p) => {
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, enabled: !x.enabled } : x));
    await fetch('/api/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, enabled: !p.enabled }) });
    load();
  };

  const updateQty = async (id, qty) => {
    const newQty = Math.max(0, parseInt(qty) || 0);
    setProducts(ps => ps.map(p => p.id === id ? { ...p, qty: newQty } : p));
    await fetch('/api/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, qty: newQty }) });
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="Products" sub={`${products.length} total · ${products.filter(p => p.enabled).length} enabled`}
        right={
          <button onClick={() => { setShowForm(s => !s); setErrs({}); }}
            style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 9, padding: '6px 11px', fontSize: 11, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            {showForm ? '✕ Cancel' : '+ Add'}
          </button>
        }
      />

      {showForm && (
        <Card style={{ margin: '11px 11px 0' }} className="fi">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 12 }}>Add New Product</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <Input label="Name" value={form.name} onChange={v => sf('name', v)} placeholder="Product name" error={errs.name} />
            <Input label="Emoji" value={form.emoji} onChange={v => sf('emoji', v)} placeholder="🥦" error={errs.emoji} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <Input label="Price ₹" value={form.price} onChange={v => sf('price', v)} type="number" placeholder="0" error={errs.price} />
            <Input label="Unit" value={form.unit} onChange={v => sf('unit', v)} placeholder="1 kg" error={errs.unit} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Category</label>
            <select value={form.categoryId} onChange={e => sf('categoryId', e.target.value)}
              style={{ width: '100%', border: `1.5px solid ${errs.categoryId ? '#E53935' : '#E0E0E0'}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#1a1a1a', background: 'white' }}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errs.categoryId && <div style={{ fontSize: 11, color: '#E53935', marginTop: 3 }}>{errs.categoryId}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <Input label="Initial Qty" value={form.qty} onChange={v => sf('qty', v)} type="number" placeholder="0" error={errs.qty} />
            <Input label="Low Threshold" value={form.threshold} onChange={v => sf('threshold', v)} type="number" placeholder="10" />
          </div>
          <Input label="FPO Source (optional)" value={form.fpo} onChange={v => sf('fpo', v)} placeholder="e.g. Ratnagiri FPO" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginBottom: 14 }}>
            <input type="checkbox" checked={form.organic} onChange={e => sf('organic', e.target.checked)} style={{ width: 16, height: 16 }} />
            🌿 Organic product
          </label>
          <button onClick={submit} disabled={submitting}
            style={{ width: '100%', background: submitting ? '#BDBDBD' : ACCENT, color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </Card>
      )}

      <div style={{ padding: '11px 11px 0' }}>
        {products.map(p => (
          <Card key={p.id} style={{ marginBottom: 10, opacity: p.enabled ? 1 : 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>{p.name}</span>
                  {!p.enabled && <span style={{ background: '#FFEBEE', color: '#B71C1C', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 18 }}>Disabled</span>}
                  {p.organic && <span style={{ background: '#E8F5E9', color: '#1B5E20', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 18 }}>Organic</span>}
                </div>
                <div style={{ fontSize: 11, color: '#757575' }}>₹{p.price} · {p.unit} · {p.category?.name}</div>
                {p.fpo && <div style={{ fontSize: 11, color: '#9E9E9E' }}>{p.fpo}</div>}
              </div>
              <Toggle on={p.enabled} onToggle={() => toggleEnabled(p)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid #F5F5F5' }}>
              <span style={{ fontSize: 12, color: '#757575' }}>Stock:</span>
              <button onClick={() => updateQty(p.id, p.qty - 1)} style={{ background: '#F5F5F5', border: 'none', borderRadius: 6, width: 26, height: 26, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>−</button>
              <input type="number" value={p.qty} onChange={e => updateQty(p.id, e.target.value)}
                style={{ width: 54, textAlign: 'center', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '4px 6px', fontSize: 14, fontWeight: 700 }} />
              <button onClick={() => updateQty(p.id, p.qty + 1)} style={{ background: P, border: 'none', borderRadius: 6, width: 26, height: 26, fontSize: 14, color: 'white', cursor: 'pointer' }}>+</button>
              <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 3, color: p.qty === 0 ? '#B71C1C' : p.qty <= p.threshold ? '#E65100' : '#1B5E20' }}>
                {p.qty === 0 ? 'Out of stock' : p.qty <= p.threshold ? 'Low stock' : 'In stock'}
              </span>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="Products" />
    </div>
  );
}
