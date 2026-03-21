'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export default function Root() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    else if (status === 'authenticated') router.replace('/admin');
  }, [status, router]);
  return <div style={{ minHeight:'100vh', background:'#1A0A0A', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>Loading...</div></div>;
}
