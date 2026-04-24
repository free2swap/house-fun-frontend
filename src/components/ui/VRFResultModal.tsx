'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, X, ExternalLink, Loader2, Trophy, Skull, Share2 } from 'lucide-react';
import { Button } from './Button';
import toast from 'react-hot-toast';

export type VRFStatus = 'signing' | 'pending' | 'verifying' | 'resolved';

interface VRFResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: VRFStatus;
    result: string | null;
    won: boolean;
    txHash?: string;
    betAmount?: string;
    payoutAmount?: string;
    symbol?: string;
    bnbPrice?: number;
}

export const VRFResultModal: React.FC<VRFResultModalProps> = ({
    isOpen,
    onClose,
    status,
    result,
    won,
    txHash,
    betAmount,
    payoutAmount,
    symbol = 'BNB',
    bnbPrice = 0
}) => {
    const explorerUrl = txHash ? `https://testnet.bscscan.com/tx/${txHash}` : '#';

    // Steps configuration
    const steps = [
      { id: 'signing', label: 'Wallet Signing', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
      { id: 'pending', label: 'Blockchain Confirmation', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> },
      { id: 'verifying', label: 'Chainlink VRF Oracle', icon: <Zap className="w-3 h-3 text-emerald-400" /> },
      { id: 'resolved', label: 'Provably Fair Result', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === status);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop - Transparent and No Blur to keep animations visible */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/20"
                        onClick={status === 'resolved' ? onClose : undefined}
                    />

                    {/* Modal Content - Smaller and slightly shifted to not block center fully if possible */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-zinc-950/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-md"
                    >
                        {/* Status Header */}
                        <div className="relative z-10 p-5 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-bold leading-none">SafeBet VRF</h3>
                                    <p className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-widest font-black">Secure Randomness</p>
                                </div>
                            </div>
                            {status === 'resolved' && (
                                <button 
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white relative z-20"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="relative z-10 p-6">
                            {status !== 'resolved' ? (
                                <div className="flex flex-col items-center py-4">
                                    {/* Animated Loader */}
                                    <div className="relative w-20 h-20 mb-6">
                                        <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {status === 'signing' && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />}
                                            {status === 'pending' && <Loader2 className="w-6 h-6 text-yellow-400 animate-pulse" />}
                                            {status === 'verifying' && <Zap className="w-6 h-6 text-emerald-400 animate-bounce" />}
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-black text-white text-center mb-1 italic uppercase tracking-tighter">
                                        {status === 'signing' && 'Confirming...'}
                                        {status === 'pending' && 'Mining...'}
                                        {status === 'verifying' && 'Oracle Call...'}
                                    </h2>
                                    <p className="text-zinc-500 text-xs text-center mb-8 max-w-[200px]">
                                        {status === 'signing' && 'Check your wallet.'}
                                        {status === 'pending' && 'Confirming on-chain.'}
                                        {status === 'verifying' && 'Generating random result...'}
                                    </p>

                                    {/* Steps Progress */}
                                    <div className="w-full space-y-3">
                                        {steps.map((step, idx) => (
                                            <div key={step.id} className="flex items-center space-x-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                                    idx < currentStepIndex 
                                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                                        : idx === currentStepIndex 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white animate-pulse'
                                                            : 'bg-zinc-950 border-zinc-900 text-zinc-700'
                                                }`}>
                                                    {idx < currentStepIndex ? <span className="text-[10px]">✓</span> : <span className="scale-75">{step.icon}</span>}
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                                    idx <= currentStepIndex ? 'text-zinc-300' : 'text-zinc-700'
                                                }`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {/* Result View */}
                                    <div className="relative">
                                         {won && (
                                             <motion.div 
                                                 initial={{ scale: 0.5, opacity: 0 }}
                                                 animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
                                                 transition={{ duration: 2, repeat: Infinity }}
                                                 className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl -z-10"
                                             />
                                         )}
                                         <motion.div 
                                             initial={{ scale: 0, rotate: -20 }}
                                             animate={{ scale: 1, rotate: 0 }}
                                             className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative z-10 ${
                                                 won 
                                                     ? 'bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 shadow-yellow-500/50 border-2 border-yellow-200/50' 
                                                     : 'bg-zinc-900 border border-zinc-800'
                                             }`}
                                         >
                                             {won ? <Trophy className="w-12 h-12 text-zinc-950 drop-shadow-lg" /> : <Skull className="w-12 h-12 text-zinc-700" />}
                                         </motion.div>
                                    </div>

                                    <motion.h2 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={`text-4xl font-black mb-1 italic uppercase tracking-tighter text-center ${
                                            won ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-zinc-500'
                                        }`}
                                    >
                                        {won ? 'JACKPOT WIN!' : 'BET LOST'}
                                    </motion.h2>

                                    <p className="text-zinc-400 font-bold text-base mb-6 tracking-widest uppercase italic flex items-center space-x-2">
                                        <span>{result}</span>
                                        {won && <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />}
                                    </p>

                                    <div className="w-full grid grid-cols-2 gap-3 mb-6">
                                         <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800 text-center">
                                            <span className="block text-[9px] text-zinc-500 font-black uppercase mb-0.5">Your Bet</span>
                                            <span className="text-lg font-bold text-white leading-none">{betAmount} {symbol}</span>
                                            {bnbPrice > 0 && <span className="block text-[9px] text-zinc-600 font-bold mt-1">≈ ${(Number(betAmount) * bnbPrice).toFixed(2)}</span>}
                                        </div>
                                        <div className={`p-3 rounded-2xl border text-center ${
                                            won ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900/50 border-zinc-800'
                                        }`}>
                                            <span className="block text-[9px] text-zinc-500 font-black uppercase mb-0.5">{won ? 'Payout' : 'Outcome'}</span>
                                            <span className={`text-lg font-bold leading-none ${won ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                                {won ? `+${payoutAmount}` : `-${betAmount}`} {symbol}
                                            </span>
                                            {bnbPrice > 0 && (
                                                <span className={`block text-[9px] font-bold mt-1 ${won ? 'text-emerald-500/60' : 'text-zinc-600'}`}>
                                                    ≈ ${(Number(won ? payoutAmount : betAmount) * bnbPrice).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col w-full space-y-2">
                                        <Button 
                                            variant="neon" 
                                            className="w-full py-5 text-base font-black uppercase tracking-widest"
                                            onClick={onClose}
                                        >
                                            CONTINUE PLAYING
                                        </Button>
                                        
                                        <div className="grid grid-cols-3 gap-2">
                                          <a 
                                              href={explorerUrl} 
                                              target="_blank" 
                                              rel="noreferrer"
                                              className="flex flex-col items-center justify-center py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors group"
                                              title="Verify VRF on Explorer"
                                          >
                                              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 mb-1" />
                                              <span className="text-[8px] font-black text-zinc-600 uppercase">Verify</span>
                                          </a>
                                          
                                          <button 
                                            onClick={() => {
                                                const tweetText = won 
                                                    ? `🚀 I just won ${payoutAmount} ${symbol} on DopaHouse! 🎰\n\nProvably Fair & Instant Payouts. Join the house:`
                                                    : `💀 Just got wiped on DopaHouse... but the VRF was fair! 🎲\n\nTry your luck:`;
                                                const url = window.location.origin + '/lobby?ref=' + (txHash || '');
                                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`, '_blank');
                                            }}
                                            className="flex flex-col items-center justify-center py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors group"
                                            title="Share on X"
                                          >
                                            <Share2 className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 mb-1" />
                                            <span className="text-[8px] font-black text-zinc-600 uppercase">Share X</span>
                                          </button>

                                          <button 
                                            onClick={() => {
                                                const text = won 
                                                    ? `🚀 I just won ${payoutAmount} ${symbol} on DopaHouse! 🎰\nJoin me: ${window.location.origin}/lobby?ref=${txHash || ''}`
                                                    : `💀 Just got wiped on DopaHouse... but the VRF was fair! 🎲\nTry your luck: ${window.location.host}`;
                                                navigator.clipboard.writeText(text);
                                                toast.success('Brag text copied!');
                                            }}
                                            className="flex flex-col items-center justify-center py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors group"
                                            title="Copy Brag Link"
                                          >
                                            <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 mb-1" />
                                            <span className="text-[8px] font-black text-zinc-600 uppercase">Copy</span>
                                          </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 p-1 opacity-20 pointer-events-none">
                            <Zap className="w-32 h-32 text-emerald-500 translate-x-12 -translate-y-12 rotate-12" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
