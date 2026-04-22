'use client';

import React from 'react';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { bsc, bscTestnet, base, opBNB } from 'viem/chains';
import { ShieldCheck, ShieldAlert, Globe, Zap } from 'lucide-react';

export const MainnetBadge = () => {
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { isConnected } = useAccount();

    const getNetworkInfo = () => {
        switch (chainId) {
            case bsc.id:
                return { name: 'BSC Mainnet', color: 'text-emerald-400', isTestnet: false, icon: <ShieldCheck className="w-3 h-3" /> };
            case bscTestnet.id:
                return { name: 'BSC Testnet', color: 'text-amber-400', isTestnet: true, icon: <ShieldAlert className="w-3 h-3" /> };
            case base.id:
                return { name: 'Base Mainnet', color: 'text-blue-400', isTestnet: false, icon: <Globe className="w-3 h-3" /> };
            case opBNB.id:
                return { name: 'opBNB Mainnet', color: 'text-yellow-500', isTestnet: false, icon: <ShieldCheck className="w-3 h-3" /> };
            default:
                return { name: 'Unknown', color: 'text-rose-500', isTestnet: false, icon: <ShieldAlert className="w-3 h-3" /> };
        }
    };

    const info = getNetworkInfo();

    if (!isConnected) return null;

    return (
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm shadow-inner group transition-all hover:bg-zinc-800">
            <div className={`flex items-center justify-center p-0.5 rounded-full ${info.isTestnet ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {info.icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tighter sm:tracking-widest ${info.color}`}>
                {info.name}
            </span>
            {info.isTestnet && (
                <button 
                    onClick={() => switchChain({ chainId: bsc.id })}
                    className="ml-1 text-[9px] bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-md font-bold transition-all border border-emerald-500/20 active:scale-95"
                >
                    FIX
                </button>
            )}
        </div>
    );
};
