'use client';

import { useState, useEffect } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { getAddresses, ABIS } from '@/abis/contracts';
import { formatEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

export default function FOMOBanner() {
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const addresses = getAddresses(chainId);
    const [notifications, setNotifications] = useState<{ id: string; text: string }[]>([]);

    useEffect(() => {
        if (!publicClient || !addresses.BetRouter) return;

        const unwatch = publicClient.watchContractEvent({
            address: addresses.BetRouter as `0x${string}`,
            abi: ABIS.BetRouter,
            eventName: 'BetResolved',
            onLogs: (logs) => {
                logs.forEach((log) => {
                    const { user, won, payout } = (log as any).args;
                    if (won && payout > 0n) {
                        const shortAddr = `${user.slice(0, 6)}...${user.slice(-4)}`;
                        const amount = formatEther(payout);
                        const newId = Math.random().toString(36).substr(2, 9);
                        const text = `🎉 Address ${shortAddr} just WON ${parseFloat(amount).toFixed(4)} BNB!`;
                        
                        setNotifications(prev => [...prev, { id: newId, text }].slice(-3));
                    }
                });
            }
        });

        return () => {
            if (unwatch) unwatch();
        };
    }, [publicClient, addresses.BetRouter]);

    if (notifications.length === 0) return null;

    return (
        <div className="w-full marquee-track py-2 h-10 overflow-hidden relative z-50 backdrop-blur-md">
            <div className="flex items-center absolute whitespace-nowrap animate-marquee">
                {notifications.map((n, i) => (
                    <div key={n.id} className="flex items-center mx-8 text-neon-emerald font-black text-[10px] uppercase tracking-[0.2em] italic">
                        <Trophy className="w-3.5 h-3.5 mr-2 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] animate-pulse" />
                        {n.text}
                        <TrendingUp className="w-3 h-3 ml-2 text-white/30" />
                    </div>
                ))}
                {/* 镜像音道确保无缝衔接 */}
                {notifications.map((n, i) => (
                    <div key={`${n.id}-dup`} className="flex items-center mx-8 text-neon-emerald font-black text-[10px] uppercase tracking-[0.2em] italic">
                        <Trophy className="w-3.5 h-3.5 mr-2 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] animate-pulse" />
                        {n.text}
                        <TrendingUp className="w-3 h-3 ml-2 text-white/30" />
                    </div>
                ))}
            </div>
            
            <style jsx>{`
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
