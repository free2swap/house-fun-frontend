'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, X, AlertTriangle, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface BalanceGuidanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAddress: string;
    currentBalance: string;
    requiredAmount?: string;
    onRefresh?: () => void;
}

export const BalanceGuidanceModal: React.FC<BalanceGuidanceModalProps> = ({
    isOpen,
    onClose,
    userAddress,
    currentBalance,
    requiredAmount,
    onRefresh
}) => {
    const copyAddress = () => {
        navigator.clipboard.writeText(userAddress);
        toast.success('Wallet address copied!', {
            icon: '📋',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[85vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-white text-lg font-bold">Top-up Required</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                            {/* Balance Info */}
                            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 mb-8">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Current Balance</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Low</span>
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                                    {Number(currentBalance).toFixed(4)} <span className="text-zinc-600">BNB</span>
                                </div>
                                {requiredAmount && (
                                    <div className="mt-2 text-[10px] text-zinc-500">
                                        Estimated min. required: <span className="text-zinc-300">{requiredAmount} BNB</span>
                                    </div>
                                )}
                            </div>

                            {/* Address Copy Area */}
                            <div className="mb-8">
                                <label className="block text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-3 ml-1">
                                    Send BNB to your Wallet Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all rounded-2xl opacity-50" />
                                    <div className="relative flex items-center gap-3 p-4 bg-zinc-900 border-2 border-emerald-500/30 rounded-2xl group-hover:border-emerald-500/50 transition-all shadow-xl">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10">
                                            <Wallet className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mb-0.5">Your Personal Address</div>
                                            <div className="text-zinc-200 font-mono text-xs break-all leading-tight pr-2">
                                                {userAddress}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={copyAddress}
                                            className="p-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl transition-all shadow-lg active:scale-95 group/btn overflow-hidden"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Safety Warning */}
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-3 items-start mb-8">
                                <div className="mt-0.5 text-red-500">
                                    <AlertTriangle className="w-4 h-4 fill-red-500/10" />
                                </div>
                                <div className="text-[10px] leading-relaxed">
                                    <span className="text-red-400 font-black uppercase block mb-1 tracking-tighter underline decoration-red-500/50 underline-offset-2">Safety Warning</span>
                                    <span className="text-zinc-400 font-medium">Please verify you are sending to the correct address. <strong className="text-zinc-200">Do NOT send funds to the platform's contract address</strong> or they will be unrecoverable.</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <Button 
                                    variant="neon" 
                                    className="w-full py-4 text-xs font-black tracking-[0.2em] uppercase relative overflow-hidden group"
                                    onClick={onRefresh || onClose}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {onRefresh ? <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> : <CheckCircle2 className="w-4 h-4" />}
                                        <span>{onRefresh ? 'REFRESH BALANCE' : 'I UNDERSTAND'}</span>
                                    </div>
                                </Button>
                                <Link href="/deposit" onClick={onClose} className="w-full">
                                    <Button 
                                        variant="outline" 
                                        className="w-full py-4 text-xs font-black tracking-[0.2em] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" /> VISIT FULL CASHIER
                                    </Button>
                                </Link>
                                <button 
                                    onClick={onClose}
                                    className="w-full py-2 text-[10px] text-zinc-600 hover:text-zinc-400 font-bold uppercase transition-colors"
                                >
                                    Cancel Transaction
                                </button>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Wallet className="w-32 h-32 text-white -rotate-12 translate-x-12 translate-y-12" />
                        </div>

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
};
