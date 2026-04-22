'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { usePrivy } from '@privy-io/react-auth';
import { 
    Copy, Check, ExternalLink, ArrowLeft, Wallet, 
    ArrowDownCircle, ShieldAlert, ArrowLeftRight, 
    ChevronRight, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { SwapModal } from '@/components/SwapModal';

const BINANCE_REF_LINK = process.env.NEXT_PUBLIC_BINANCE_REF_LINK || "https://accounts.binance.com/register?ref=82468388";

const TUTORIAL_STEPS = [
    {
        title: "1. Buy BNB",
        description: "Log in to Binance. Select 'Buy Crypto' via Card or P2P to purchase BNB.",
        image: "💳"
    },
    {
        title: "2. Withdraw",
        description: "Select 'BNB Smart Chain (BEP20)' as the network. **DO NOT use other networks.**",
        image: "📤"
    },
    {
        title: "3. Paste Address",
        description: "Copy your DopaHouse address below and paste it as the destination on Binance.",
        image: "📋"
    }
];

export default function DepositPage() {
    const { user, exportWallet, authenticated, ready, login } = usePrivy();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'transfer' | 'acquire'>('transfer');
    const [view, setView] = useState<'selection' | 'tutorial'>('selection');
    const [step, setStep] = useState(0);
    const [isSwapOpen, setIsSwapOpen] = useState(false);

    const walletAddress = user?.wallet?.address;
    const isEmbeddedWallet = user?.linkedAccounts.find(
        (account: any) => account.type === 'wallet' && account.walletClientType === 'privy'
    );

    const handleCopy = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            toast.success('Wallet address copied!', {
                id: 'copy-wallet-deposit-page',
                position: 'top-center',
                style: {
                    background: '#064e3b',
                    color: '#fff',
                    border: '1px solid #10b981',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!ready) return null;

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-6">
                    <Wallet className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Login to Cashier</h1>
                <p className="text-zinc-500 text-sm mb-8 font-bold">Connect your wallet to access your personal vault.</p>
                <Button variant="neon" size="lg" onClick={() => login()} className="px-10 h-14 text-lg italic font-black">
                    SIGN IN NOW
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-16 pb-24 px-3 sm:px-6 overflow-x-hidden">
            <div className="max-w-md mx-auto">
                {/* Compact Back Button */}
                <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-5 group transition-colors px-2">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Lobby</span>
                </Link>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative backdrop-blur-xl">
                    {/* Progress Bar (Tutorial) */}
                    {activeTab === 'acquire' && view === 'tutorial' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 overflow-hidden">
                            <div 
                                className="h-full bg-amber-500 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                style={{ width: `${((step + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                            />
                        </div>
                    )}

                    {/* Header - More Compact */}
                    <div className="p-5 sm:p-6 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">CASHIER</h3>
                                <p className="text-[9px] text-zinc-500 font-bold tracking-widest mt-0.5 uppercase opacity-60">Secure Asset Hub</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Switcher - Optimized for Touch */}
                    <div className="p-4 bg-zinc-900/10 border-b border-zinc-900">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-1 flex items-center shadow-inner">
                            <button
                                onClick={() => { setActiveTab('transfer'); setView('selection'); }}
                                className={`flex-1 py-3 px-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                                    activeTab === 'transfer' 
                                    ? 'bg-zinc-800 text-white shadow-xl' 
                                    : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                            >
                                DIRECT DEPOSIT
                            </button>
                            <button
                                onClick={() => setActiveTab('acquire')}
                                className={`flex-1 py-3 px-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                                    activeTab === 'acquire' 
                                    ? 'bg-zinc-800 text-white shadow-xl' 
                                    : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                            >
                                BUY / SWAP
                            </button>
                        </div>
                    </div>

                    {/* Content Area - Responsive Spacing */}
                    <div className="p-6 sm:p-8">
                        {activeTab === 'transfer' ? (
                            <div className="space-y-6 flex flex-col items-center">
                                {/* QR Code Section - Scaled Down for Mobile */}
                                <div className="p-4 sm:p-6 bg-white rounded-[2.5rem] shadow-2xl border-4 border-zinc-900 group">
                                    {walletAddress ? (
                                        <QRCodeSVG 
                                            value={walletAddress} 
                                            size={160} 
                                            level="H"
                                            includeMargin={false}
                                            imageSettings={{
                                                src: "/logo.png",
                                                height: 36,
                                                width: 36,
                                                excavate: true,
                                            }}
                                            className="transition-transform group-hover:scale-105 duration-500"
                                        />
                                    ) : (
                                        <div className="w-[160px] h-[160px] flex items-center justify-center bg-zinc-100 rounded-lg">
                                            <span className="text-zinc-400 text-[10px]">Syncing...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Address Section - More Robust Layout */}
                                <div className="w-full space-y-3">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Personal Vault Address</label>
                                    <div 
                                        className="group relative flex items-center bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/30 transition-all active:scale-[0.98] shadow-inner"
                                        onClick={handleCopy}
                                    >
                                        <div className="flex-1 font-mono text-xs text-zinc-300 truncate mr-3 tracking-tighter">
                                            {walletAddress || 'Syncing...'}
                                        </div>
                                        <div className="shrink-0 p-2 bg-zinc-900 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-600" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Compact Network Info */}
                                <div className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-2">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center">
                                        <ShieldAlert className="w-4 h-4 mr-2" /> BSC (BEP-20) ONLY
                                    </p>
                                    <p className="text-[11px] text-zinc-500 leading-tight font-bold opacity-80">
                                        Send BNB or USDT (BEP-20) to this address. Sync is automatic.
                                    </p>
                                </div>

                                {/* Action Grid */}
                                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                                    <Button 
                                        variant="ghost" 
                                        className="w-full h-12 bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-white rounded-xl font-black tracking-widest text-[10px]"
                                        onClick={() => window.open(`https://bscscan.com/address/${walletAddress}`, '_blank')}
                                    >
                                        BSCSCAN
                                    </Button>
                                    <Button 
                                        variant="neon" 
                                        className="w-full h-12 font-black italic rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                        onClick={() => window.location.href = '/lobby'}
                                    >
                                        PLAY ROOM
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {view === 'selection' ? (
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setIsSwapOpen(true)}
                                            className="w-full p-6 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl transition-all group relative overflow-hidden text-left"
                                        >
                                            <div className="flex items-center space-x-5">
                                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                                    <ArrowLeftRight className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-white uppercase tracking-tight text-base">Instant Swap</h4>
                                                    <p className="text-[10px] text-zinc-500 mt-1 font-bold">USDT to BNB (DEX)</p>
                                                </div>
                                                <ChevronRight className="w-6 h-6 text-zinc-800 group-hover:text-white" />
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => setView('tutorial')}
                                            className="w-full p-6 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-2xl transition-all group relative overflow-hidden text-left"
                                        >
                                            <div className="flex items-center space-x-5">
                                                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:bg-amber-500 transition-all">
                                                    <Image src="/bnb-bnb-logo.png" alt="BNB" width={24} height={24} className="object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-white uppercase tracking-tight text-base">Binance Guide</h4>
                                                    <p className="text-[10px] text-zinc-500 mt-1 font-bold">Withdrawal Tutorial</p>
                                                </div>
                                                <ChevronRight className="w-6 h-6 text-zinc-800 group-hover:text-white" />
                                            </div>
                                        </button>

                                        <div className="pt-6 flex items-center justify-center space-x-2 opacity-30">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Secure Custody</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 flex flex-col justify-between h-full py-2">
                                        <div className="space-y-6">
                                            <div className="flex justify-center">
                                                <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] border-2 border-zinc-800 flex items-center justify-center text-4xl shadow-2xl relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                                                    {TUTORIAL_STEPS[step].image}
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h4 className="text-xl font-black text-white italic tracking-tight uppercase">
                                                    {TUTORIAL_STEPS[step].title}
                                                </h4>
                                                <p className="text-xs text-zinc-500 font-bold leading-relaxed px-4 opacity-80">
                                                    {TUTORIAL_STEPS[step].description}
                                                </p>
                                            </div>

                                            {step === 2 && walletAddress && (
                                                <div 
                                                    className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-between group cursor-pointer active:scale-95 transition-all" 
                                                    onClick={handleCopy}
                                                >
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <Wallet className="w-5 h-5 text-amber-500 shrink-0" />
                                                        <span className="text-[10px] font-mono text-zinc-300 truncate">{walletAddress}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-amber-500 uppercase bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">COPY</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-3 pt-4">
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => step === 0 ? setView('selection') : setStep(step - 1)}
                                                className="flex-1 h-12 font-black tracking-widest text-zinc-700 hover:text-white rounded-xl text-[10px]"
                                            >
                                                {step === 0 ? 'BACK' : 'PREV'}
                                            </Button>

                                            {step < TUTORIAL_STEPS.length - 1 ? (
                                                <Button 
                                                    variant="neon" 
                                                    onClick={() => setStep(step + 1)}
                                                    className="flex-[2] h-12 font-black italic text-base rounded-xl"
                                                >
                                                    NEXT <ChevronRight className="ml-1 w-5 h-5" />
                                                </Button>
                                            ) : (
                                                <a href={BINANCE_REF_LINK} target="_blank" rel="noopener noreferrer" className="flex-[2]">
                                                    <Button 
                                                        variant="neon" 
                                                        className="w-full h-12 font-black italic text-base bg-amber-500 hover:bg-amber-400 border-amber-600 shadow-[0_5px_20px_rgba(245,158,11,0.2)] rounded-xl text-black"
                                                    >
                                                        GO BINANCE <ExternalLink className="ml-1 w-4 h-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer - Even more compact */}
                    <div className="p-4 bg-zinc-950/80 border-t border-zinc-900 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-1.5">
                             <CheckCircle2 className="w-3 h-3 text-emerald-500/40" />
                             <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.2em]">Asset Protection Active</span>
                        </div>
                        {isEmbeddedWallet && activeTab === 'transfer' && (
                            <button 
                                onClick={() => exportWallet()}
                                className="text-[8px] font-black text-emerald-500/40 hover:text-emerald-400 uppercase flex items-center space-x-1 underline underline-offset-2"
                            >
                                <ShieldAlert className="w-3 h-3" />
                                <span>Export Key</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <SwapModal isOpen={isSwapOpen} onClose={() => setIsSwapOpen(false)} />
        </div>
    );
}
