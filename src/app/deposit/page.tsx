'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { usePrivy } from '@privy-io/react-auth';
import { 
    Copy, Check, ExternalLink, ArrowLeft, Wallet, 
    ArrowDownCircle, ShieldAlert, Landmark, ArrowLeftRight, 
    ChevronRight, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { SwapModal } from '@/components/SwapModal';

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

export default function DepositPage() {
    const { user, exportWallet, authenticated, ready, login } = usePrivy();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'transfer' | 'acquire'>('transfer');
    const [view, setView] = useState<'selection' | 'tutorial'>('selection');
    const [step, setStep] = useState(0);
    const [isSwapOpen, setIsSwapOpen] = useState(false);

    // Get the embedded wallet address
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
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 flex items-center justify-center mb-8">
                    <Wallet className="w-10 h-10 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">LOG IN TO DEPOSIT</h1>
                <p className="text-zinc-500 max-w-sm mb-8 font-bold">Please connect your wallet or sign in with Socials to access your personal cashier.</p>
                <Button variant="neon" size="lg" onClick={() => login()} className="px-12 h-14 text-lg italic font-black">
                    SIGN IN NOW
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-20 pb-20 px-4 sm:px-6">
            <div className="max-w-xl mx-auto">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 group transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Return to Lobby</span>
                </Link>

                <div className="bg-zinc-900/20 border border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden relative">
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
                    <div className="p-8 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                <ArrowDownCircle className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">CASHIER</h3>
                                <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1">SECURE ASSET HUB</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="p-6 bg-zinc-900/10 border-b border-zinc-900">
                        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-1.5 flex items-center">
                            <button
                                onClick={() => { setActiveTab('transfer'); setView('selection'); }}
                                className={`flex-1 py-4 px-4 rounded-xl text-xs font-black tracking-widest transition-all ${
                                    activeTab === 'transfer' 
                                    ? 'bg-zinc-800 text-white shadow-lg' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                DIRECT DEPOSIT
                            </button>
                            <button
                                onClick={() => setActiveTab('acquire')}
                                className={`flex-1 py-4 px-4 rounded-xl text-xs font-black tracking-widest transition-all ${
                                    activeTab === 'acquire' 
                                    ? 'bg-zinc-800 text-white shadow-lg' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                BUY / SWAP
                            </button>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        {activeTab === 'transfer' ? (
                            <div className="space-y-10 flex flex-col items-center">
                                {/* QR Code Section */}
                                <div className="p-6 bg-white rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.05)] border-8 border-zinc-900 group">
                                    {walletAddress ? (
                                        <QRCodeSVG 
                                            value={walletAddress} 
                                            size={220} 
                                            level="H"
                                            includeMargin={false}
                                            imageSettings={{
                                                src: "/logo.png",
                                                x: undefined,
                                                y: undefined,
                                                height: 48,
                                                width: 48,
                                                excavate: true,
                                            }}
                                            className="transition-transform group-hover:scale-105 duration-500"
                                        />
                                    ) : (
                                        <div className="w-[220px] h-[220px] flex items-center justify-center bg-zinc-100 rounded-lg">
                                            <span className="text-zinc-400 text-xs">Generating wallet...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Address Section */}
                                <div className="w-full space-y-4">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Personal Vault Address</label>
                                    <div 
                                        className="group relative flex items-center bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 cursor-pointer hover:border-emerald-500/30 transition-all active:scale-[0.98] shadow-inner"
                                        onClick={handleCopy}
                                    >
                                        <div className="flex-1 font-mono text-sm text-zinc-300 truncate mr-4 tracking-tighter">
                                            {walletAddress || 'Detecting address...'}
                                        </div>
                                        <div className="shrink-0 p-3 bg-zinc-900 rounded-xl group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                                            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Network Info */}
                                <div className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 space-y-4">
                                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center">
                                        <ShieldAlert className="w-5 h-5 mr-3" /> BSC (BEP-20) NETWORK ONLY
                                    </p>
                                    <p className="text-sm text-zinc-500 leading-relaxed font-bold opacity-80">
                                        Send BNB or USDT (BEP-20) to this address. Assets will automatically sync to your game balance within blocks.
                                    </p>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-4 pt-4">
                                    <Button 
                                        variant="ghost" 
                                        className="w-full h-16 bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-white rounded-[1.5rem] font-black tracking-widest text-xs"
                                        onClick={() => window.open(`https://bscscan.com/address/${walletAddress}`, '_blank')}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2 opacity-50" /> BSCSCAN
                                    </Button>
                                    <Button 
                                        variant="neon" 
                                        className="w-full h-16 font-black italic rounded-[1.5rem] text-lg shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                        onClick={() => window.location.href = '/lobby'}
                                    >
                                        PLAY NOW
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[400px] flex flex-col justify-between">
                                {view === 'selection' ? (
                                    <div className="space-y-6">
                                        <button 
                                            onClick={() => setIsSwapOpen(true)}
                                            className="w-full p-8 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-[2.5rem] transition-all group relative overflow-hidden text-left shadow-lg"
                                        >
                                            <div className="flex items-center space-x-6">
                                                <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">
                                                    <ArrowLeftRight className="w-8 h-8" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-white uppercase tracking-tight text-xl">Instant Swap</h4>
                                                    <p className="text-sm text-zinc-500 mt-2 font-bold">Convert USDT to BNB (DEX)</p>
                                                </div>
                                                <ChevronRight className="w-8 h-8 text-zinc-800 group-hover:text-white transition-colors" />
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => setView('tutorial')}
                                            className="w-full p-8 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-amber-500/30 rounded-[2.5rem] transition-all group relative overflow-hidden text-left shadow-lg"
                                        >
                                            <div className="flex items-center space-x-6">
                                                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500 transition-all duration-300">
                                                    <Image src="/bnb-bnb-logo.png" alt="BNB" width={40} height={40} className="object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-white uppercase tracking-tight text-xl">Binance Guide</h4>
                                                    <p className="text-sm text-zinc-500 mt-2 font-bold">Register & Withdraw Tutorial</p>
                                                </div>
                                                <ChevronRight className="w-8 h-8 text-zinc-800 group-hover:text-white transition-colors" />
                                            </div>
                                        </button>

                                        <div className="pt-10 flex items-center justify-center space-x-3 opacity-40">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] italic">Full Self-Custody Protected</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-10 flex flex-col justify-between h-full">
                                        <div className="space-y-8">
                                            <div className="flex justify-center">
                                                <div className="w-32 h-32 bg-zinc-950 rounded-[3rem] border-2 border-zinc-800 flex items-center justify-center text-6xl shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                                                    {TUTORIAL_STEPS[step].image}
                                                </div>
                                            </div>
                                            <div className="text-center space-y-4">
                                                <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">
                                                    {TUTORIAL_STEPS[step].title}
                                                </h4>
                                                <p className="text-base text-zinc-500 font-bold leading-relaxed px-6 opacity-90">
                                                    {TUTORIAL_STEPS[step].description}
                                                </p>
                                            </div>

                                            {step === 2 && walletAddress && (
                                                <div 
                                                    className="mt-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex items-center justify-between group cursor-pointer active:scale-95 transition-all shadow-[0_0_40px_rgba(245,158,11,0.05)]" 
                                                    onClick={handleCopy}
                                                >
                                                    <div className="flex items-center space-x-4 overflow-hidden">
                                                        <Wallet className="w-7 h-7 text-amber-500 shrink-0" />
                                                        <span className="text-sm font-mono text-zinc-300 truncate tracking-tight">{walletAddress}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-amber-500 uppercase bg-amber-500/10 px-6 py-3 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all whitespace-nowrap">COPY</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 pt-10">
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => step === 0 ? setView('selection') : setStep(step - 1)}
                                                className="flex-1 h-16 font-black tracking-widest text-zinc-600 hover:text-white rounded-[1.5rem]"
                                            >
                                                {step === 0 ? 'BACK' : 'PREV'}
                                            </Button>

                                            {step < TUTORIAL_STEPS.length - 1 ? (
                                                <Button 
                                                    variant="neon" 
                                                    onClick={() => setStep(step + 1)}
                                                    className="flex-[2] h-16 font-black italic text-xl rounded-[1.5rem]"
                                                >
                                                    NEXT STEP <ChevronRight className="ml-2 w-7 h-7" />
                                                </Button>
                                            ) : (
                                                <a href={BINANCE_REF_LINK} target="_blank" rel="noopener noreferrer" className="flex-[2]">
                                                    <Button 
                                                        variant="neon" 
                                                        className="w-full h-16 font-black italic text-xl bg-amber-500 hover:bg-amber-400 border-amber-600 shadow-[0_10px_40px_rgba(245,158,11,0.3)] rounded-[1.5rem] text-black"
                                                    >
                                                        GO BINANCE <ExternalLink className="ml-2 w-6 h-6" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                             <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] italic">Real-Time Asset Protection</span>
                        </div>
                        {isEmbeddedWallet && activeTab === 'transfer' && (
                            <button 
                                onClick={() => exportWallet()}
                                className="text-[10px] font-black text-emerald-500/60 hover:text-emerald-400 uppercase flex items-center space-x-2 decoration-dotted underline underline-offset-4"
                            >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Export Private Key</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <SwapModal isOpen={isSwapOpen} onClose={() => setIsSwapOpen(false)} />
        </div>
    );
}
