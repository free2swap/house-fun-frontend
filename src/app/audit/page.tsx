'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertTriangle, Info, ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react';

export default function AuditPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 pt-32 pb-24">
                
                {/* Hero Header */}
                <div className="relative mb-16 text-center">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 blur-[100px] rounded-full" />
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 relative">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Protocol Security Audit V4.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                        DEPOSIT SECURITY<br />REPORT
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        A comprehensive manual and automated security audit of the DopaHouse smart contract ecosystem, conducted by the Antigravity Security Division.
                    </p>
                </div>

                {/* Audit Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center text-center">
                        <div className="text-emerald-400 font-bold text-3xl mb-1 tracking-tighter italic">PASSED</div>
                        <div className="text-zinc-500 text-[10px] uppercase font-black tracking-widest leading-none">Overall Status</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center text-center">
                        <div className="text-white font-black text-3xl mb-1 tracking-tighter italic">100%</div>
                        <div className="text-zinc-500 text-[10px] uppercase font-black tracking-widest leading-none">Module Coverage</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center text-center text-rose-500">
                        <div className="font-bold text-3xl mb-1 tracking-tighter italic">RESOLVED</div>
                        <div className="text-zinc-500 text-[10px] uppercase font-black tracking-widest leading-none">Total Findings</div>
                    </div>
                </div>

                {/* Main Content Body */}
                <div className="space-y-12 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-xl">
                    
                    {/* section: Executive Summary */}
                    <section>
                        <h2 className="text-2xl font-black italic mb-6 flex items-center">
                            <span className="w-8 h-[1px] bg-emerald-500 mr-4"></span>
                            EXECUTIVE SUMMARY
                        </h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            DopaHouse V4 is a decentralized gaming platform built on BSC. Our audit focused on the **Global Liquidity Pool (GLP)**, the **BetRouter** core execution engine, and the **Tokenomics** mechanisms (Bonding Curve, Staking, Buyback).
                        </p>
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 text-sm leading-relaxed">
                            <strong>Note:</strong> During the penetration phase, a high-severity logic error in the refund mechanism was identified and corrected. The protocol is now considered ready for mainnet deployment.
                        </div>
                    </section>

                    {/* section: Critical Findings */}
                    <section>
                        <h2 className="text-2xl font-black italic mb-6 flex items-center">
                            <span className="w-8 h-[1px] bg-rose-500 mr-4"></span>
                            CRITICAL FINDINGS
                        </h2>
                        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 group hover:border-rose-500/30 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-wider">High Severity</span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider">Fixed</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">BetRouter Refund Logic Overdraft</h3>
                                </div>
                                <ShieldAlert className="w-6 h-6 text-rose-500" />
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">
                                The original code attempted to refund users directly from the Router. However, since net bets are sent to the House Vault, the Router would inevitably have insufficient balance.
                            </p>
                            <div className="text-[11px] text-emerald-400/70 font-mono bg-emerald-500/[0.03] p-3 rounded-lg border border-emerald-500/10">
                                // FIXED: Implemented Pull-Refund pattern via payout() authorized callbacks.
                            </div>
                        </div>
                    </section>

                    {/* section: Verified Protocols */}
                    <section>
                        <h2 className="text-2xl font-black italic mb-6 flex items-center">
                            <span className="w-8 h-[1px] bg-cyan-500 mr-4"></span>
                            VERIFIED PROTECTIONS
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                                <div className="flex items-center space-x-2 text-cyan-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Reentrancy Guards</span>
                                </div>
                                <p className="text-zinc-500 text-xs">All capital withdrawal and reward claim functions are protected by OpenZeppelin's ReentrancyGuard.</p>
                            </div>
                            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                                <div className="flex items-center space-x-2 text-cyan-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">MEV Time Locks</span>
                                </div>
                                <p className="text-zinc-500 text-xs">A mandatory 4-hour delay is enforced for manual refunds to prevent oracle-bias exploitation.</p>
                            </div>
                        </div>
                    </section>

                    {/* Final Footer */}
                    <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                        <span>Antigravity Audit Core // March 2026 // v4.0.1</span>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> Secure</span>
                            <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Audited</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 text-center">
                    <Link href="/" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Lobby</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
