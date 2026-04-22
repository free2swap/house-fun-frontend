'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Send, BookOpen, Heart, Github, ShieldCheck } from 'lucide-react';

export function Footer() {
    return (
        <footer className="hidden md:block w-full bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-2 md:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center group">
                            <div className="relative w-8 h-8 mr-2 transition-transform group-hover:rotate-12">
                                <Image src="/logo.png" alt="Logo" fill className="object-contain" sizes="32px" />
                            </div>
                            <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight italic pr-2">
                                DOPAHOUSE
                            </span>
                        </Link>
                        <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed">
                            The premier decentralized gaming ecosystem. Play provably fair games, stake $DOPA for real yield, and launch your own house with zero counterparty risk.
                        </p>
                        <div className="flex items-center space-x-5 pt-2">
                            <a href="https://x.com/dopahouse" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-all">
                                <X className="w-5 h-5" />
                            </a>
                            <a href="https://t.me/dopahouse_bot" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-all">
                                <Send className="w-5 h-5" />
                            </a>
                            <a href="https://docs.dopahouse.xyz" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-all">
                                <BookOpen className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 italic">Ecosystem</h4>
                        <ul className="space-y-4">
                            <li><Link href="/lobby" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">Games Lobby</Link></li>
                            <li><Link href="/bonding" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">DOPA Presale</Link></li>
                            <li><Link href="/tokenomics" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">Tokenomics</Link></li>
                            <li><Link href="/earn" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">Earn / Staking</Link></li>
                            <li><Link href="/affiliate" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">Referrals Hub</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 italic">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="https://doc.dopahouse.xyz" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">Documentation</a></li>
                            <li>
                                <Link href="/audit" className="flex items-center group">
                                    <span className="text-zinc-500 group-hover:text-emerald-400 text-sm font-bold transition-colors">Security Audit</span>
                                    <div className="ml-2 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center">
                                        <ShieldCheck className="w-3 h-3 text-emerald-400 mr-1" />
                                        <span className="text-[9px] text-emerald-400 font-black uppercase tracking-tighter">Verified</span>
                                    </div>
                                </Link>
                            </li>
                            <li><a href="#" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">Media Kit</a></li>
                            <li><Link href="/banker" className="text-zinc-500 hover:text-emerald-400 text-sm font-bold transition-colors">House Onboarding</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                        Made with <Heart className="w-3 h-3 mx-1 text-rose-500 fill-rose-500" /> by the DOPAHOUSE DAO
                    </p>
                    <div className="flex items-center space-x-8">
                        <span className="text-[10px] text-zinc-700 font-mono tracking-tighter">BUILD: {new Date().getFullYear()}.3.19-STABLE</span>
                        <div className="flex items-center space-x-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Mainnet Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
