'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { LogOut, User, Menu, X, Zap, Flame, ShieldAlert, BookOpen, Send, Copy, Check } from 'lucide-react';
import { ABIS, getAddresses } from '@/abis/contracts';
import toast from 'react-hot-toast';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useTelegramInit } from '@/hooks/useTelegramInit';
import { ArrowLeftRight, Landmark, ShieldCheck, Mail } from 'lucide-react';
import { MainnetBadge } from './MainnetBadge';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';


const AirdropModal = dynamic(() => import('@/components/AirdropModal').then((mod) => mod.AirdropModal), { ssr: false });
const SwapModal = dynamic(() => import('@/components/SwapModal').then((mod) => mod.SwapModal), { ssr: false });

export function Navbar() {
    const { login, logout, ready, authenticated } = usePrivy();
    const { address, chain } = useAccount();
    const addresses = getAddresses(chain?.id);
    const [isAirdropOpen, setIsAirdropOpen] = useState(false);
    const [isSwapOpen, setIsSwapOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const { disconnect } = useDisconnect();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user: tgUser } = useTelegramInit();
    const searchParams = useSearchParams();
 
    // Auto-open Airdrop Modal if tgid is present (Deep link from bot)
    useEffect(() => {
        if (searchParams.get('tgid')) {
            setIsAirdropOpen(true);
        }
    }, [searchParams]);

    const { data: owner } = useReadContract({
        address: addresses.HouseFactory as `0x${string}`,
        abi: ABIS.HouseFactory,
        functionName: 'owner',
    });

    const isAdmin = owner && address && (owner as string).toLowerCase() === address.toLowerCase();

    const handleLogout = () => {
        disconnect();
        logout();
    };

    const closeMenu = () => setIsMobileMenuOpen(false);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            toast.success('Wallet address copied!', {
                id: 'copy-wallet',
                position: 'top-center',
                style: {
                    background: '#064e3b',
                    color: '#fff',
                    border: '1px solid #10b981',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }
            });
        }
    };

    return (
        <>
            <nav className="hidden md:block w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-[1000]">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center shrink-0 mr-8 group" onClick={closeMenu}>
                            <div className="relative w-8 h-8 mr-2 sm:w-10 sm:h-10 transition-transform group-hover:scale-110">
                                <Image
                                    src="/logo.png"
                                    alt="DOPAHOUSE Logo"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 640px) 32px, 40px"
                                    priority
                                />
                            </div>
                            <span className="hidden sm:inline text-[16px] sm:text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition-opacity">
                                DOPAHOUSE
                            </span>
                        </Link>

                        {/* Navigation Links (Desktop) */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/lobby" className="text-zinc-400 hover:text-white transition-colors font-medium">
                                Play
                            </Link>
                            <Link href="/bonding" className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold flex items-center space-x-1">
                                <Flame className="w-4 h-4" /> FairLaunch
                            </Link>
                            <Link href="/banker" className="text-zinc-400 hover:text-white transition-colors font-medium">
                                Be the House
                            </Link>
                            <Link href="/tokenomics" className="text-zinc-400 hover:text-white transition-colors font-medium">
                                Tokenomics
                            </Link>
                            <Link href="/affiliate" className="text-zinc-400 hover:text-white transition-colors font-medium">
                                Referrals
                            </Link>
                            <Link href="/airdrop" className="text-zinc-400 hover:text-white transition-colors font-medium flex items-center space-x-1">
                                <Zap className="w-4 h-4 text-purple-400" /> <span>Airdrop</span>
                            </Link>
                            <Link href="/earn" className="text-amber-400 hover:text-amber-300 transition-colors font-bold drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">
                                EARN 🚀
                            </Link>
                            {isAdmin ? (
                                <Link href="/admin" className="text-rose-500 hover:text-rose-400 transition-colors font-black flex items-center space-x-1">
                                    <ShieldAlert className="w-4 h-4" /> <span>ADMIN</span>
                                </Link>
                            ) : null}
                        </div>

                        <div className="hidden lg:flex items-center mr-4">
                            <MainnetBadge />
                        </div>

                        <div className="hidden lg:flex items-center space-x-4 border-l border-zinc-800 ml-2 pl-6">
                        {/* Desktop Points & Wallet Connect */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/deposit">
                                <Button
                                    variant="neon"
                                    size="sm"
                                    className="h-9 px-4 text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center space-x-2 rounded-full"
                                >
                                    <Image src="/bnb-bnb-logo.png" alt="BNB" width={16} height={16} className="object-contain brightness-0 invert" />
                                    <span>DEPOSIT</span>
                                </Button>
                            </Link>

                            {authenticated && address && (
                                <div
                                    onClick={() => setIsAirdropOpen(true)}
                                    className="flex items-center space-x-1.5 bg-purple-950/40 border border-purple-500/30 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(168,85,247,0.15)] group cursor-pointer transition-all hover:border-purple-500/60 active:scale-95"
                                >
                                    <Zap className="w-4 h-4 text-purple-400 fill-purple-400/50 group-hover:animate-pulse" />
                                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm">
                                        REWARDS 🎁
                                    </span>
                                </div>
                            )}

                            {!ready ? (
                                <div className="h-10 w-32 bg-zinc-800 animate-pulse rounded-md"></div>
                            ) : authenticated && address ? (
                                <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full pl-4 pr-1 py-1">
                                    <div
                                        onClick={handleCopyAddress}
                                        className="flex items-center space-x-2 cursor-pointer group/address"
                                        title="Copy Wallet Address"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-sm font-mono text-emerald-400 font-bold group-hover/address:text-white transition-colors">
                                            {address.substring(0, 6)}...{address.substring(address.length - 4)}
                                        </span>
                                        {copied ? (
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3 h-3 text-zinc-500 group-hover/address:text-emerald-400 transition-colors" />
                                        )}
                                    </div>
                                    <div className="w-[1px] h-4 bg-zinc-800 mx-1"></div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="h-8 w-8 p-0 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : tgUser ? (
                                <div className="hidden lg:flex flex-col items-end mr-2">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">TMA Verified</span>
                                    <span className="text-zinc-200 font-black text-sm">@{tgUser.username || tgUser.first_name}</span>
                                </div>
                            ) : (
                                <Button
                                    variant="neon"
                                    onClick={() => tgUser ? login({ loginMethods: ['telegram'] }) : login()}
                                    className="font-bold flex items-center space-x-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                >
                                    <User className="w-4 h-4" />
                                    LOGIN / PLAY
                                </Button>
                            )}
                        </div>
                        </div>

                        {/* Mobile Flex Elements (Compact Wallet + Hamburger) */}
                        <div className="flex md:hidden items-center space-x-2 sm:space-x-4">
                            <Link href="/deposit">
                                <Button
                                    variant="neon"
                                    size="sm"
                                    className="h-7 px-2 text-[9px] font-black flex items-center"
                                >
                                    <span>DEPOSIT</span>
                                </Button>
                            </Link>

                            {authenticated && address && (
                                <div
                                    onClick={() => setIsAirdropOpen(true)}
                                    className="flex items-center space-x-1 bg-purple-950/40 border border-purple-500/30 rounded-full px-2 py-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
                                >
                                    <Zap className="w-3 h-3 text-purple-400 fill-purple-400/50" />
                                    <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 leading-none">
                                        REWARDS
                                    </span>
                                </div>
                            )}

                            {!ready ? (
                                <div className="h-6 w-12 bg-zinc-800 animate-pulse rounded-md shrink-0"></div>
                            ) : authenticated && address ? (
                                <div
                                    onClick={handleCopyAddress}
                                    className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
                                    title="Copy Wallet Address"
                                >
                                    <span className="text-[9px] sm:text-xs font-mono text-emerald-400 font-bold flex items-center space-x-1 tracking-tighter leading-none">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                                        {address.substring(0, 4)}..{address.substring(address.length - 3)}
                                    </span>
                                    {copied ? (
                                        <Check className="w-2.5 h-2.5 ml-1 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-2.5 h-2.5 ml-1 text-zinc-500" />
                                    )}
                                </div>
                            ) : tgUser ? (
                                <div className="hidden sm:flex flex-col items-end scale-90 origin-right">
                                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-tighter leading-none mb-1">TMA Verified</span>
                                    <span className="text-zinc-200 font-black text-xs leading-none">@{tgUser.username || tgUser.first_name}</span>
                                </div>
                            ) : (
                                <Button
                                    variant="neon"
                                    size="sm"
                                    onClick={() => tgUser ? login({ loginMethods: ['telegram'] }) : login()}
                                    className="h-7 px-3 text-[10px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                >
                                    LOGIN
                                </Button>
                            )}

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-1 px-2 border border-zinc-800 rounded-md bg-zinc-900 shadow-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    <div className="flex justify-center py-2 border-b border-zinc-800 bg-zinc-950/20 md:hidden">
                        <MainnetBadge />
                </div>
                </div>
                </div>
            </nav>


            {/* Mobile Dropdown Menu Container (Outside nav to avoid backdrop-blur clipping) */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-zinc-950 fixed inset-x-0 top-[64px] bottom-0 z-[999] overflow-y-auto shadow-2xl border-t border-zinc-800">
                    <div className="px-4 pt-4 pb-24 space-y-2 flex flex-col min-h-full bg-zinc-950">
                        <Link href="/lobby" onClick={closeMenu} className="px-3 py-4 text-zinc-300 font-medium text-lg border-b border-zinc-800/50 hover:text-emerald-400 hover:bg-zinc-900/50 rounded-md transition-colors">
                            Play Room Lobby
                        </Link>
                        <Link href="/bonding" onClick={closeMenu} className="px-3 py-4 text-emerald-400 font-bold text-lg border-b border-zinc-800/50 hover:bg-zinc-900/50 rounded-md transition-colors flex items-center space-x-2">
                            <Flame className="w-5 h-5" /> <span>$DOPA FairLaunch</span>
                        </Link>
                        <Link href="/banker" onClick={closeMenu} className="px-3 py-4 text-zinc-300 font-medium text-lg border-b border-zinc-800/50 hover:text-emerald-400 hover:bg-zinc-900/50 rounded-md transition-colors">
                            Be the House (Banker)
                        </Link>
                        <Link href="/tokenomics" onClick={closeMenu} className="px-3 py-4 text-zinc-300 font-medium text-lg border-b border-zinc-800/50 hover:text-emerald-400 hover:bg-zinc-900/50 rounded-md transition-colors">
                            Tokenomics
                        </Link>
                        <Link href="/affiliate" onClick={closeMenu} className="px-3 py-4 text-zinc-300 font-medium text-lg border-b border-zinc-800/50 hover:text-emerald-400 hover:bg-zinc-900/50 rounded-md transition-colors">
                            Referrals Hub
                        </Link>
                        <Link href="/airdrop" onClick={closeMenu} className="px-3 py-4 text-purple-400 font-bold text-lg border-b border-zinc-800/50 hover:bg-zinc-900/50 rounded-md transition-colors flex items-center justify-between">
                            <span>Airdrop & Tasks</span>
                            <Zap className="w-5 h-5" />
                        </Link>
                        <Link href="/earn" onClick={closeMenu} className="px-3 py-4 text-amber-400 font-bold text-lg hover:bg-zinc-900/50 rounded-md transition-colors flex items-center justify-between">
                            <span>EARN (Staking)</span>
                            <span className="text-xs bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">Live!</span>
                        </Link>
                        {isAdmin ? (
                            <Link href="/admin" onClick={closeMenu} className="px-3 py-4 text-rose-500 font-black text-lg hover:bg-zinc-900/50 rounded-md transition-colors flex items-center space-x-2">
                                <ShieldAlert className="w-5 h-5" /> ADMINISTRATIVE
                            </Link>
                        ) : null}

                        <div className="pt-2 px-3">
                            <Button
                                variant="outline"
                                className="w-full h-14 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                onClick={() => { setIsSwapOpen(true); closeMenu(); }}
                            >
                                <ArrowLeftRight className="w-5 h-5 mr-3" /> INSTANT SWAP (BNB)
                            </Button>
                        </div>

                        <div className="flex items-center space-x-6 px-3 py-6 border-t border-zinc-800 mt-4">
                            <a href="https://x.com/dopahouse" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-zinc-400 hover:text-white font-bold text-sm">
                                <X className="w-5 h-5" /> <span>Twitter</span>
                            </a>
                            <a href="https://t.me/dopahouse" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-zinc-400 hover:text-white font-bold text-sm">
                                <Send className="w-5 h-5" /> <span>Telegram</span>
                            </a>
                        </div>

                        {authenticated ? (
                            <div className="pt-4 px-3">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold"
                                    onClick={() => { handleLogout(); closeMenu(); }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" /> Disconnect User
                                </Button>
                            </div>
                        ) : null}

                    </div>
                </div>
            )}

            <AirdropModal
                isOpen={isAirdropOpen}
                onClose={() => setIsAirdropOpen(false)}
            />

            <SwapModal
                isOpen={isSwapOpen}
                onClose={() => setIsSwapOpen(false)}
            />
        </>
    );
}
