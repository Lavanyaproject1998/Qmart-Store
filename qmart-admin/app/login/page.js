'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (status === 'authenticated') router.replace('/admin'); }, [status, router]);

  const handle = async (e) => {
    e?.preventDefault();
    if (!email || !pw) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const res = await signIn('credentials', { email, password: pw, redirect: false });
    setLoading(false);
    if (res?.error) setError('Invalid admin credentials.');
  };

  return (
    <div className="fi" style={{ minHeight: '100vh', background: '#1A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#F9A825,#FFD54F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 14 }}>⚙️</div>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 3px' }}>QMart Admin</h1>
      <p style={{ color: '#F9A825', fontSize: 12, fontWeight: 600, margin: '0 0 24px' }}>admin.qmart.in · Authorised Access Only</p>

      <div style={{ background: 'white', borderRadius: 22, padding: '22px 18px', width: '100%', maxWidth: 340 }}>
        <h2 style={{ fontWeight: 800, fontSize: 17, color: '#1a1a1a', margin: '0 0 3px' }}>Admin Access</h2>
        <p style={{ fontSize: 12, color: '#757575', margin: '0 0 18px' }}>Authorised personnel only</p>

        {error && <div style={{ background: '#FFEBEE', borderRadius: 9, padding: '9px 12px', marginBottom: 13, fontSize: 12, color: '#B71C1C' }}>🔒 {error}</div>}

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@qmart.in"
              style={{ width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 12px', fontSize: 14, color: '#1a1a1a' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••"
              style={{ width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 12px', fontSize: 14 }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ background: loading ? '#BDBDBD' : '#7F1D1D', color: 'white', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Verifying...' : 'Access Admin Panel →'}
          </button>
        </form>

        <div style={{ marginTop: 14, padding: 10, background: '#FFF8F0', borderRadius: 10, border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>DEMO ACCOUNT</div>
          <button onClick={() => { setEmail('admin@qmart.in'); setPw('qmart123'); setError(''); }}
            style={{ width: '100%', background: 'white', border: '1px solid #FDE68A', borderRadius: 9, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>⚙️</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Meera Nair</div>
              <div style={{ fontSize: 10, color: '#757575' }}>admin@qmart.in · qmart123</div>
            </div>
            <span style={{ fontSize: 10, background: '#F0F0F0', color: '#9E9E9E', borderRadius: 18, padding: '2px 7px' }}>Fill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
