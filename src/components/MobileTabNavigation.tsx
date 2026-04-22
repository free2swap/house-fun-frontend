'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    LayoutGrid, 
    Zap, 
    Coins, 
    Landmark, 
    User,
    Flame
} from 'lucide-react';

const TABS = [
    { name: 'Lobby', icon: LayoutGrid, href: '/lobby', color: 'text-emerald-400' },
    { name: 'FairLaunch', icon: Flame, href: '/bonding', color: 'text-orange-400' },
    { name: 'Earn', icon: Coins, href: '/earn', color: 'text-amber-400' },
    { name: 'House', icon: Landmark, href: '/banker', color: 'text-cyan-400' },
    { name: 'Me', icon: User, href: '/airdrop', color: 'text-purple-400' },
];

export function MobileTabNavigation() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] px-4 pb-6 pt-2 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <nav className="bg-zinc-950/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex items-center justify-around p-2 relative overflow-hidden">
                    {/* Active Tab Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
                    
                    {TABS.map((tab) => {
                        const isActive = pathname === tab.href;
                        const Icon = tab.icon;

                        return (
                            <Link 
                                key={tab.href} 
                                href={tab.href}
                                className="relative flex flex-col items-center justify-center w-16 py-2 transition-all active:scale-90"
                            >
                                <div className={`relative ${isActive ? tab.color : 'text-zinc-500'} transition-colors duration-300`}>
                                    <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`} />
                                    {isActive && (
                                        <motion.div 
                                            layoutId="tab-glow"
                                            className={`absolute -inset-2 bg-current opacity-10 blur-xl rounded-full`}
                                        />
                                    )}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                    {tab.name}
                                </span>
                                
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-dot"
                                        className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
