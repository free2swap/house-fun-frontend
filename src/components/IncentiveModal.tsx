'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, Users, Sparkles, ChevronRight, Coins, Landmark } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function IncentiveModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // 检查上一次显示的时间
        const lastShown = localStorage.getItem('dopahouse_incentive_modal_last_shown');
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (!lastShown || now - parseInt(lastShown) > twentyFourHours) {
            // 延迟 2.5 秒弹出
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
                <div key="incentive-modal-root" className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-zinc-950 border border-emerald-500/30 rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.15)] overflow-hidden"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -z-10" />
                        
                        {/* Top Banner Image */}
                        <div className="relative h-48 w-full overflow-hidden border-b border-zinc-800/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-zinc-950 to-indigo-500/20" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-32 h-32 border-2 border-emerald-500/20 rounded-full flex items-center justify-center"
                                >
                                    <Sparkles className="w-12 h-12 text-emerald-400 opacity-80" />
                                </motion.div>
                            </div>
                            <div className="absolute bottom-6 left-8">
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                                    Legendary <br /> <span className="text-emerald-500">Entrance</span>
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 bg-zinc-950/50 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors border border-zinc-800 z-50"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 pt-6 space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Joined by 5,000+ Proto-Degens</span>
                                </div>
                                <p className="text-sm text-zinc-400 font-bold leading-relaxed">
                                    The house always wins, unless <span className="text-white italic underline underline-offset-4 decoration-emerald-500">YOU are the house</span>. Join the Genesis phase and claim your share of the legend.
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="grid grid-cols-1 gap-3">
                                <Link href="/airdrop" onClick={handleClose}>
                                    <div className="group relative p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 transition-all flex items-center justify-between overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center space-x-4 relative z-10">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Claim Airdrop Points</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Follow X & Get Rewards</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                </Link>

                                <Link href="/earn" onClick={handleClose}>
                                    <div className="group relative p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-amber-500/50 transition-all flex items-center justify-between overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center space-x-4 relative z-10">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Earn Real Yield</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Liquid Staking & High APR</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-amber-400 transition-colors" />
                                    </div>
                                </Link>

                                <Link href="/banker" onClick={handleClose}>
                                    <div className="group relative p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-all flex items-center justify-between overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center space-x-4 relative z-10">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                <Landmark className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Be the House</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Launch Your Own Gaming Room</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                </Link>
                            </div>

                            {/* Footer Banner */}
                            <div className="pt-2 text-center">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Powered by Chainlink VRF & Dopa Engine</div>
                                <Button 
                                    onClick={handleClose}
                                    className="w-full bg-white text-black hover:bg-zinc-200 font-black h-12 rounded-2xl shadow-2xl transition-transform active:scale-95"
                                >
                                    LET'S FUCKING GO!
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
