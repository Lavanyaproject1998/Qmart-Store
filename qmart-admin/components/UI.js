'use client';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const ACCENT = '#7F1D1D';

export function TopBar({ title, sub, right }) {
  const { data: session } = useSession();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div style={{ background: ACCENT, padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 99, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>{sub}</div>}
        </div>
        {right}
        {session?.user && (
          <button onClick={() => setMenu(m => !m)} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            {session.user.name?.charAt(0) || '?'}
          </button>
        )}
      </div>
      {menu && session?.user && (
        <>
          <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
          <div style={{ position: 'fixed', top: 58, right: 14, zIndex: 200, background: 'white', borderRadius: 14, boxShadow: '0 8px 28px rgba(0,0,0,.15)', padding: '8px 0', minWidth: 195 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{session.user.name}</div>
              <div style={{ fontSize: 11, color: '#757575' }}>{session.user.email}</div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ width: '100%', padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#B71C1C', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'none' }}>🚪 Sign Out</button>
          </div>
        </>
      )}
    </>
  );
}

export function BottomNav({ active }) {
  const router = useRouter();
  const tabs = [['📊', 'Dashboard', '/admin/dashboard'], ['🛍', 'Products', '/admin/products'], ['👥', 'Users', '/admin/users'], ['🏷', 'Categories', '/admin/categories']];
  return (
    <div style={{ background: 'white', borderTop: '1px solid #F0F0F0', display: 'flex', position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, zIndex: 99, boxShadow: '0 -3px 10px rgba(0,0,0,.06)' }}>
      {tabs.map(([ic, lb, href]) => (
        <button key={href} onClick={() => router.push(href)} style={{ flex: 1, padding: '9px 4px 11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: 19 }}>{ic}</span>
          <span style={{ fontSize: 10, fontWeight: active === lb ? 700 : 500, color: active === lb ? ACCENT : '#AAAAAA' }}>{lb}</span>
          {active === lb && <span style={{ width: 4, height: 4, borderRadius: '50%', background: ACCENT, display: 'block' }} />}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', padding: 14, ...style }}>{children}</div>;
}

export function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? '#4B0082' : '#D0D0D0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
    </button>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, error, style = {} }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', border: `1.5px solid ${error ? '#E53935' : '#E0E0E0'}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#1a1a1a', ...style }} />
      {error && <div style={{ fontSize: 11, color: '#E53935', marginTop: 3 }}>{error}</div>}
    </div>
  );
}
