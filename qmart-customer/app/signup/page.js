'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.email.includes('@')) e.email = 'Valid email required';
    if (f.phone.length < 10) e.phone = '10-digit number required';
    if (f.password.length < 6) e.password = 'Min 6 characters';
    if (f.password !== f.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handle = async (e) => {
    e.preventDefault();
    const errs2 = validate();
    if (Object.keys(errs2).length) { setErrs(errs2); return; }
    setLoading(true);
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: f.name, email: f.email, phone: f.phone, password: f.password }),
    });
    const data = await res.json();
    if (!res.ok) { setErrs({ email: data.error || 'Signup failed' }); setLoading(false); return; }
    await signIn('credentials', { email: f.email, password: f.password, callbackUrl: '/customer' });
  };

  const strength = f.password.length < 4 ? 'Weak' : f.password.length < 6 ? 'Fair' : f.password.length < 10 ? 'Good' : 'Strong';
  const sColor = f.password.length < 4 ? '#E53935' : f.password.length < 6 ? '#F9A825' : f.password.length < 10 ? '#2196F3' : '#4CAF50';

  const field = (label, key, type = 'text', ph = '') => (
    <div key={key} style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={f[key]} onChange={e => set(key, e.target.value)} placeholder={ph}
        style={{ width: '100%', border: `1.5px solid ${errs[key] ? '#E53935' : '#E0E0E0'}`, borderRadius: 10, padding: '11px 12px', fontSize: 14, color: '#1a1a1a' }} />
      {errs[key] && <div style={{ fontSize: 11, color: '#E53935', marginTop: 3 }}>{errs[key]}</div>}
    </div>
  );

  return (
    <div className="fi" style={{ minHeight: '100vh', background: '#0D0014', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ background: 'white', borderRadius: 22, padding: '22px 18px', width: '100%', maxWidth: 340 }}>
        <a href="/login" style={{ fontSize: 12, fontWeight: 700, color: '#4B0082', textDecoration: 'none', display: 'block', marginBottom: 14 }}>← Back to login</a>
        <h2 style={{ fontWeight: 800, fontSize: 17, color: '#1a1a1a', margin: '0 0 3px' }}>Create account</h2>
        <p style={{ fontSize: 12, color: '#757575', margin: '0 0 16px' }}>Join QMart for fresh farm-to-fork delivery</p>
        <form onSubmit={handle}>
          {field('Full Name', 'name', 'text', 'Your name')}
          {field('Email', 'email', 'email', 'you@example.com')}
          {field('Phone', 'phone', 'tel', '10-digit mobile number')}
          {field('Password', 'password', 'password', 'Min 6 characters')}
          {f.password.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 4, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden', marginBottom: 3 }}>
                <div style={{ height: '100%', width: f.password.length < 4 ? '25%' : f.password.length < 6 ? '50%' : f.password.length < 10 ? '75%' : '100%', background: sColor, transition: 'all .3s' }} />
              </div>
              <div style={{ fontSize: 10, color: '#757575' }}>{strength} password</div>
            </div>
          )}
          {field('Confirm Password', 'confirm', 'password', 'Repeat password')}
          <button type="submit" disabled={loading}
            style={{ background: loading ? '#BDBDBD' : '#4B0082', color: 'white', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}
