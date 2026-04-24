'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, ChevronRight, Coins, Landmark, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function IncentiveModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const lastShown = localStorage.getItem('dopahouse_incentive_modal_last_shown');
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (!lastShown || now - parseInt(lastShown) > twentyFourHours) {
            const timer = setTimeout(() => setIsOpen(true), 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('dopahouse_incentive_modal_last_shown', Date.now().toString());
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div key="incentive-modal-root" className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                    />

                    {/* Modal Content - Fixed with Scrolling Support */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/40 rounded-[2rem] shadow-[0_0_120px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col max-h-[88vh]"
                    >
                        {/* Header Banner - Fixed at Top */}
                        <div className="relative h-44 w-full flex-shrink-0 overflow-hidden border-b border-white/5 bg-gradient-to-br from-emerald-600/30 via-zinc-950 to-indigo-600/20">
                            {/* Removed external noise.svg for performance */}
                            <div className="absolute inset-0 opacity-20 bg-emerald-500/5" />
                            
                            <div className="absolute top-6 left-8 space-y-1">
                                <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center space-x-1.5"
                                >
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Protocol Active</span>
                                </motion.div>
                                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                                    Earn Like <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">The House</span>
                                </h2>
                            </div>

                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 transition-colors border border-white/10 z-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Body Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 space-y-6 custom-scrollbar">
                            <div className="space-y-3">
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center space-x-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <p className="text-[11px] font-bold text-zinc-300 leading-tight">
                                        Powered by <span className="text-white">Chainlink VRF</span>. 100% On-chain fairness guaranteed. No black boxes.
                                    </p>
                                </div>
                                <p className="text-sm text-zinc-400 font-medium leading-relaxed px-1">
                                    Why just bet when you can <span className="text-white font-black italic underline decoration-emerald-500 underline-offset-4">OWN THE EDGE?</span> Join 5,000+ degens sharing protocol fees.
                                </p>
                            </div>

                            {/* Incentive Cards */}
                            <div className="space-y-3">
                                {/* Be the House - Priority 1 */}
                                <Link href="/banker" onClick={handleClose} className="block group">
                                    <div className="relative p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-indigo-500/60 transition-all">
                                        <div className="absolute -top-1 -right-1">
                                            <div className="bg-indigo-500 text-white text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-tighter animate-bounce">
                                                Hot Feature
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                                                    <Landmark className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-black text-white uppercase tracking-tight">Be The House</p>
                                                    <p className="text-[11px] font-bold text-indigo-400/80">Launch Your Own Gaming Empire</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>

                                {/* Real Yield */}
                                <Link href="/earn" onClick={handleClose} className="block group">
                                    <div className="relative p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-amber-500/60 transition-all">
                                        <div className="absolute -top-1 -right-1">
                                            <div className="bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-tighter">
                                                70% APR est.
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                                                    <TrendingUp className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-black text-white uppercase tracking-tight">Earn Real Yield</p>
                                                    <p className="text-[11px] font-bold text-amber-400/80">Claim 50% Protocol Profit Share</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>

                                {/* Airdrop */}
                                <Link href="/airdrop" onClick={handleClose} className="block group">
                                    <div className="relative p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-emerald-500/60 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-black text-white uppercase tracking-tight">Airdrop Bounty</p>
                                                    <p className="text-[11px] font-bold text-emerald-400/80">Get Free $DOPA Seeds Now</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Final Call to Action */}
                            <div className="pt-4 pb-2 space-y-4">
                                <Button 
                                    onClick={handleClose}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black h-14 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 text-lg"
                                >
                                    LET'S FUCKING GO!
                                </Button>
                                <p className="text-[9px] font-bold text-zinc-600 text-center uppercase tracking-[0.3em]">
                                    Secure • Fair • Decentralized
                                </p>
                            </div>
                        </div>

                        {/* Custom Scrollbar Styles */}
                        <style jsx>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 4px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: rgba(16, 185, 129, 0.1);
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: rgba(16, 185, 129, 0.3);
                            }
                        `}</style>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
