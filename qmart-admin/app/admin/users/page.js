'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, BottomNav, Card, Toggle, Input } from '@/components/UI';

const ACCENT = '#7F1D1D', P = '#4B0082';

export default function AdminUsers() {
  const { status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [otp, setOtp] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', store: '' });
  const [errs, setErrs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  const load = () => fetch('/api/users').then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false); });
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (users.find(u => u.email === form.email)) e.email = 'Email already exists';
    if (!form.store.trim()) e.store = 'Required';
    return e;
  };

  const createOperator = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setSubmitting(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setOtp({ name: form.name, email: form.email, password: data.rawPassword });
      setForm({ name: '', email: '', store: '' });
      setErrs({}); setShowForm(false);
      load();
    } else {
      setErrs({ email: data.error || 'Failed to create account' });
    }
  };

  const toggleUser = async (id, active) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, active: !u.active } : u));
    await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active: !active }) });
    load();
  };

  const customers = users.filter(u => u.role === 'CUSTOMER');
  const storeOps  = users.filter(u => u.role === 'DARKSTORE');

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>Loading...</div>;

  return (
    <div className="fi" style={{ paddingBottom: 80 }}>
      <TopBar title="User Management" sub={`${users.length} total users`}
        right={
          <button onClick={() => { setShowForm(s => !s); setOtp(null); setErrs({}); }}
            style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 9, padding: '6px 11px', fontSize: 11, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            {showForm ? '✕ Cancel' : '+ Store Operator'}
          </button>
        }
      />

      {otp && (
        <div className="fi" style={{ margin: '11px 11px 0', background: '#E8F5E9', borderRadius: 14, padding: 14, border: '1px solid rgba(27,94,32,.2)' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1B5E20', marginBottom: 8 }}>✅ Account Created!</div>
          <div style={{ fontSize: 12, color: '#1a1a1a', marginBottom: 10 }}>{otp.name} can now log in at <strong>store.qmart.in</strong></div>
          <div style={{ background: 'white', borderRadius: 10, padding: '11px 13px' }}>
            <div style={{ fontSize: 11, color: '#757575', marginBottom: 5 }}>One-time credentials — share with operator:</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}><strong>Email:</strong> {otp.email}</div>
            <div style={{ fontSize: 13 }}><strong>Password:</strong> <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: P, background: '#EDE7F6', padding: '2px 8px', borderRadius: 6 }}>{otp.password}</span></div>
          </div>
          <button onClick={() => setOtp(null)} style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: '#757575', background: 'none', border: 'none', cursor: 'pointer' }}>Dismiss ×</button>
        </div>
      )}

      {showForm && (
        <Card style={{ margin: '11px 11px 0' }} className="fi">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 12 }}>Create Dark Store Operator</div>
          <Input label="Full Name" value={form.name} onChange={v => sf('name', v)} placeholder="Operator name" error={errs.name} />
          <Input label="Email" value={form.email} onChange={v => sf('email', v)} type="email" placeholder="operator@qmart.in" error={errs.email} />
          <Input label="Store Name" value={form.store} onChange={v => sf('store', v)} placeholder="e.g. Koramangala Dark Store" error={errs.store} />
          <div style={{ background: '#FFF9E5', borderRadius: 9, padding: '9px 12px', marginBottom: 13, fontSize: 11, color: '#7a5c00' }}>
            🔐 A one-time password will be generated and shown after creation.
          </div>
          <button onClick={createOperator} disabled={submitting}
            style={{ width: '100%', background: submitting ? '#BDBDBD' : ACCENT, color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Creating...' : 'Create Account & Generate Password'}
          </button>
        </Card>
      )}

      <div style={{ padding: '12px 11px 0' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 9 }}>Dark Store Operators ({storeOps.length})</div>
        {storeOps.map(u => (
          <Card key={u.id} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#1A237E', flexShrink: 0 }}>{u.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#757575' }}>{u.email}</div>
                <div style={{ fontSize: 11, color: '#9E9E9E' }}>{u.store}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 18, background: u.active ? '#E8F5E9' : '#FFEBEE', color: u.active ? '#1B5E20' : '#B71C1C' }}>{u.active ? 'Active' : 'Inactive'}</span>
                <Toggle on={u.active} onToggle={() => toggleUser(u.id, u.active)} />
              </div>
            </div>
          </Card>
        ))}

        <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', margin: '14px 0 9px' }}>Customers ({customers.length})</div>
        {customers.map(u => (
          <Card key={u.id} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: P, flexShrink: 0 }}>{u.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#757575' }}>{u.email}</div>
                {u.phone && <div style={{ fontSize: 11, color: '#9E9E9E' }}>📱 {u.phone}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 18, background: u.active ? '#E8F5E9' : '#FFEBEE', color: u.active ? '#1B5E20' : '#B71C1C' }}>{u.active ? 'Active' : 'Inactive'}</span>
                <Toggle on={u.active} onToggle={() => toggleUser(u.id, u.active)} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="Users" />
    </div>
  );
}
