'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, Bell, Search, User } from 'lucide-react';
import { MainnetBadge } from './MainnetBadge';

export function MobileHeader() {
    const { address } = useAccount();
    const { login, authenticated } = usePrivy();

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 z-[1000] bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 h-14 flex items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-2">
                <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                <span className="text-sm font-black text-white tracking-tighter italic">DOPA<span className="text-emerald-400">HOUSE</span></span>
            </Link>

            <div className="flex items-center space-x-3">
                <MainnetBadge />
                
                {!authenticated ? (
                    <button 
                        onClick={() => login()}
                        className="bg-emerald-500 text-zinc-950 text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] active:scale-95 transition-transform"
                    >
                        LOGIN
                    </button>
                ) : (
                    <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full pl-2 pr-1 py-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[10px] font-mono text-zinc-400 font-bold">
                            {address?.substring(0, 4)}...{address?.substring(address.length - 2)}
                         </span>
                    </div>
                )}
            </div>
        </header>
    );
}
