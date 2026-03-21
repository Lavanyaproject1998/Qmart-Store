'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const P = '#4B0082';

export function TopBar({ title, sub, backHref, accent = P, right }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div style={{ background: accent, padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 99, borderBottom: '1px solid rgba(255,255,255,.1)', flexShrink: 0 }}>
        {backHref && (
          <button onClick={() => router.push(backHref)} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white', cursor: 'pointer' }}>‹</button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'white', lineHeight: 1.2 }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>{sub}</div>}
        </div>
        {right}
        {session?.user && (
          <button onClick={() => setMenu(m => !m)} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', flexShrink: 0 }}>
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
  const tabs = [['🏠', 'Home', '/customer'], ['📦', 'Orders', '/customer/tracking'], ['💰', 'Wallet', '/customer/wallet'], ['👤', 'Account', '/customer/account']];
  return (
    <div style={{ background: 'white', borderTop: '1px solid #F0F0F0', display: 'flex', position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, zIndex: 99, boxShadow: '0 -3px 10px rgba(0,0,0,.06)' }}>
      {tabs.map(([ic, lb, href]) => (
        <button key={href} onClick={() => router.push(href)} style={{ flex: 1, padding: '9px 4px 11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: 19 }}>{ic}</span>
          <span style={{ fontSize: 10, fontWeight: active === lb ? 700 : 500, color: active === lb ? P : '#AAAAAA' }}>{lb}</span>
          {active === lb && <span style={{ width: 4, height: 4, borderRadius: '50%', background: P, display: 'block' }} />}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', padding: 14, ...style }}>{children}</div>;
}

export function Spinner() {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575', fontSize: 14 }}>Loading...</div>;
}
