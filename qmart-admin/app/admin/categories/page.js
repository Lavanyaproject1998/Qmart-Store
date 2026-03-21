'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card } from '@/components/UI';

const ACCENT = '#7F1D1D', P = '#4B0082';

export default function AdminCategories() {
  const { status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  const load = () => fetch('/api/categories').then(r => r.json()).then(d => { setCategories(d.categories || []); setLoading(false); });
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const addCategory = async () => {
    const name = newCat.trim();
    if (!name) { setError('Enter a category name.'); return; }
    setAdding(true); setError('');
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok) { setNewCat(''); load(); }
    else setError(data.error || 'Failed to add category');
  };

  const deleteCategory = async (id) => {
    setDeleting(id); setError('');
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setDeleting(null);
    if (res.ok) load();
    else setError(data.error || 'Failed to delete');
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="Categories" sub={`${categories.length} categories`} />

      <div style={{ padding: '11px 11px 0' }}>
        <Card style={{ marginBottom: 11 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 11 }}>Add New Category</div>
          <div style={{ display: 'flex', gap: 9 }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="e.g. Bakery, Beverages..."
              style={{ flex: 1, border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#1a1a1a' }} />
            <button onClick={addCategory} disabled={adding}
              style={{ background: adding ? '#BDBDBD' : P, color: 'white', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: adding ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
              {adding ? '...' : 'Add'}
            </button>
          </div>
          {error && <div style={{ fontSize: 11, color: '#B71C1C', marginTop: 7 }}>{error}</div>}
        </Card>

        <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 9 }}>All Categories</div>

        {categories.map(cat => (
          <Card key={cat.id} style={{ marginBottom: 8, padding: '11px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: '#757575' }}>{cat._count?.products || 0} product{cat._count?.products !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => deleteCategory(cat.id)} disabled={deleting === cat.id}
                style={{ background: '#FFEBEE', color: '#B71C1C', border: 'none', borderRadius: 9, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: deleting === cat.id ? .5 : 1 }}>
                {deleting === cat.id ? '...' : 'Remove'}
              </button>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="Categories" />
    </div>
  );
}
