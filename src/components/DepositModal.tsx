'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Check, ExternalLink, X, Wallet, ArrowDownCircle, ShieldAlert, Landmark, ArrowLeftRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSwap?: () => void;
}

const BINANCE_REF_LINK = process.env.NEXT_PUBLIC_BINANCE_REF_LINK || "https://accounts.binance.com/register?ref=82468388";

const TUTORIAL_STEPS = [
    {
        title: "1. Buy BNB on Binance",
        description: "Log in to your Binance account. Go to 'Buy Crypto' and select 'Credit/Debit Card' or 'P2P Trading' to purchase BNB.",
        image: "💳"
    },
    {
        title: "2. Withdraw to BSC",
        description: "Go to your Spot Wallet, click 'Withdraw' on BNB. Select 'BNB Smart Chain (BEP20)' as the network. **DO NOT use other networks.**",
        image: "📤"
    },
    {
        title: "3. Paste Your Address",
        description: "Copy your DopaHouse wallet address below and paste it as the destination address on Binance.",
        image: "📋"
    }
];

export function DepositModal({ isOpen, onClose, onOpenSwap }: DepositModalProps) {
    const { user, exportWallet, authenticated } = usePrivy();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'transfer' | 'acquire'>('transfer');
    const [view, setView] = useState<'selection' | 'tutorial'>('selection');
    const [step, setStep] = useState(0);

    // Get the embedded wallet address
    const walletAddress = user?.wallet?.address;
    const isEmbeddedWallet = user?.linkedAccounts.find(
        (account: any) => account.type === 'wallet' && account.walletClientType === 'privy'
    );

    if (!isOpen) return null;

    const handleCopy = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            toast.success('Wallet address copied!', {
                id: 'copy-wallet-deposit',
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

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Progress Bar (Tutorial) */}
                {activeTab === 'acquire' && view === 'tutorial' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 overflow-hidden">
                        <div 
                            className="h-full bg-amber-500 transition-all duration-300"
                            style={{ width: `${((step + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                        />
                    </div>
                )}

                {/* Header */}
                <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">CASHIER</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="p-4 bg-zinc-900/10 border-b border-zinc-900">
                    <div className="bg-zinc-900 rounded-2xl p-1.5 flex items-center">
                        <button
                            onClick={() => { setActiveTab('transfer'); setView('selection'); }}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-widest transition-all ${
                                activeTab === 'transfer' 
                                ? 'bg-zinc-800 text-white shadow-lg' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            DIRECT DEPOSIT
                        </button>
                        <button
                            onClick={() => setActiveTab('acquire')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-widest transition-all ${
                                activeTab === 'acquire' 
                                ? 'bg-zinc-800 text-white shadow-lg' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            BUY / SWAP
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {activeTab === 'transfer' ? (
                        /* Direct Deposit View */
                        <div className="space-y-6 flex flex-col items-center">
                            {/* QR Code Section */}
                            <div className="p-4 bg-white rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.05)] border-4 border-zinc-900">
                                {walletAddress ? (
                                    <QRCodeSVG 
                                        value={walletAddress} 
                                        size={180} 
                                        level="H"
                                        includeMargin={false}
                                        imageSettings={{
                                            src: "/logo.png",
                                            x: undefined,
                                            y: undefined,
                                            height: 36,
                                            width: 36,
                                            excavate: true,
                                        }}
                                    />
                                ) : (
                                    <div className="w-[180px] h-[180px] flex items-center justify-center bg-zinc-100 rounded-lg">
                                        <span className="text-zinc-400 text-xs">No wallet found</span>
                                    </div>
                                )}
                            </div>

                            {/* Address Section */}
                            <div className="w-full space-y-3">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Personal Vault Address</label>
                                <div 
                                    className="group relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/30 transition-all active:scale-[0.98]"
                                    onClick={handleCopy}
                                >
                                    <div className="flex-1 font-mono text-xs text-zinc-300 truncate mr-3 tracking-tighter">
                                        {walletAddress || 'Generating wallet...'}
                                    </div>
                                    <div className="shrink-0 text-zinc-600 group-hover:text-emerald-400 transition-colors">
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>

                            {/* Network Info */}
                            <div className="w-full bg-zinc-900/50 border border-zinc-900 rounded-3xl p-6 space-y-3">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                                    <ShieldAlert className="w-4 h-4 mr-2" /> BSC (BEP-20) NETWORK ONLY
                                </p>
                                <p className="text-[11px] text-zinc-500 leading-relaxed font-bold">
                                    Send BNB or USDT to this address. Assets will automatically sync to your game balance.
                                </p>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-4 pt-2">
                                <Button 
                                    variant="ghost" 
                                    className="w-full h-14 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-2xl font-black tracking-widest text-xs"
                                    onClick={() => window.open(`https://bscscan.com/address/${walletAddress}`, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2 opacity-50" /> BSCSCAN
                                </Button>
                                <Button 
                                    variant="neon" 
                                    className="w-full h-14 font-black italic rounded-2xl text-base shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                    onClick={onClose}
                                >
                                    DONE
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Acquire / Buy View */
                        <div className="min-h-[360px] flex flex-col justify-between">
                            {view === 'selection' ? (
                                <div className="space-y-4">
                                    {/* Option 1: Swap */}
                                    {onOpenSwap && (
                                        <button 
                                            onClick={onOpenSwap}
                                            className="w-full p-6 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-[2rem] transition-all group relative overflow-hidden text-left"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                                    <ArrowLeftRight className="w-7 h-7" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-white uppercase tracking-tight text-lg">Instant Swap</h4>
                                                    <p className="text-xs text-zinc-500 mt-1">Convert USDT to BNB (DEX)</p>
                                                </div>
                                                <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" />
                                            </div>
                                        </button>
                                    )}

                                    {/* Option 2: Binance */}
                                    <button 
                                        onClick={() => setView('tutorial')}
                                        className="w-full p-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/30 rounded-[2rem] transition-all group relative overflow-hidden text-left"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500 transition-all">
                                                <Image src="/bnb-bnb-logo.png" alt="BNB" width={36} height={36} className="object-contain" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-white uppercase tracking-tight text-lg">Binance Guide</h4>
                                                <p className="text-xs text-zinc-500 mt-1">Register & Withdraw Tutorial</p>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" />
                                        </div>
                                    </button>

                                    <div className="pt-6 flex items-center justify-center space-x-2 opacity-30">
                                        <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Secure Funding Path</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 flex flex-col justify-between h-full">
                                    <div className="space-y-6">
                                        <div className="flex justify-center">
                                            <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 flex items-center justify-center text-5xl shadow-2xl">
                                                {TUTORIAL_STEPS[step].image}
                                            </div>
                                        </div>
                                        <div className="text-center space-y-3">
                                            <h4 className="text-xl font-black text-white italic tracking-tight uppercase">
                                                {TUTORIAL_STEPS[step].title}
                                            </h4>
                                            <p className="text-sm text-zinc-500 font-bold leading-relaxed px-4 opacity-80">
                                                {TUTORIAL_STEPS[step].description}
                                            </p>
                                        </div>

                                        {step === 2 && walletAddress && (
                                            <div 
                                                className="mt-8 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between group cursor-pointer active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                                                onClick={handleCopy}
                                            >
                                                <div className="flex items-center space-x-3 overflow-hidden">
                                                    <Wallet className="w-6 h-6 text-amber-500 shrink-0" />
                                                    <span className="text-xs font-mono text-zinc-300 truncate tracking-tight">{walletAddress}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-amber-500 uppercase bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-colors whitespace-nowrap">COPY</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => step === 0 ? setView('selection') : setStep(step - 1)}
                                            className="flex-1 h-16 font-black tracking-widest text-zinc-500 rounded-2xl"
                                        >
                                            {step === 0 ? 'BACK' : 'PREV'}
                                        </Button>

                                        {step < TUTORIAL_STEPS.length - 1 ? (
                                            <Button 
                                                variant="neon" 
                                                onClick={() => setStep(step + 1)}
                                                className="flex-[2] h-16 font-black italic text-lg rounded-2xl"
                                            >
                                                NEXT STEP <ChevronRight className="ml-2 w-6 h-6" />
                                            </Button>
                                        ) : (
                                            <a href={BINANCE_REF_LINK} target="_blank" rel="noopener noreferrer" className="flex-[2]">
                                                <Button 
                                                    variant="neon" 
                                                    className="w-full h-16 font-black italic text-lg bg-amber-500 hover:bg-amber-400 border-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.3)] rounded-2xl"
                                                >
                                                    GO BINANCE <ExternalLink className="ml-2 w-5 h-5" />
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Self-Custody Footer */}
                <div className="p-5 bg-zinc-950/80 border-t border-zinc-900 flex items-center justify-between">
                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] italic">
                        Real-Time Asset Protection Active
                    </p>
                    {isEmbeddedWallet && activeTab === 'transfer' && (
                        <button 
                            onClick={() => exportWallet()}
                            className="text-[10px] font-black text-emerald-500/40 hover:text-emerald-400 uppercase flex items-center space-x-1 decoration-dotted underline underline-offset-4"
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Backup Keys</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
