'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, Trophy, Target, TrendingUp, Users, Info, Rocket, Link as LinkIcon, Loader2, MessageSquare, ShieldCheck, MousePointerClick } from 'lucide-react';
import { Button } from './ui/Button';
import { useAirdrop } from '../hooks/useAirdrop';
import { useSearchParams } from 'next/navigation';

interface AirdropModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AirdropModal({ isOpen, onClose }: AirdropModalProps) {
    const { pointsData, loading, bindWallet, isConnected } = useAirdrop();
    const searchParams = useSearchParams();
    const [tgId, setTgId] = useState('');
    const [bindStatus, setBindStatus] = useState<{ success?: boolean; error?: string } | null>(null);
 
    useEffect(() => {
        const tgidParam = searchParams.get('tgid');
        if (tgidParam && !tgId) {
            setTgId(tgidParam);
        }
    }, [searchParams, tgId]);

    if (!isOpen) return null;

    const handleBind = async () => {
        setBindStatus(null);
        const result = await bindWallet(tgId);
        if (result) setBindStatus(result);
    };

    const stats = [
        { label: 'Welcome', value: pointsData ? '10' : '--', icon: Trophy, color: 'text-amber-400' },
        { label: 'Referral', value: pointsData ? `${(pointsData.invited_count || 0) * 50}` : '--', icon: Users, color: 'text-cyan-400' },
        { label: 'Activity', value: pointsData ? `${Math.max(0, pointsData.points - 10 - (pointsData.invited_count || 0) * 50)}` : '--', icon: TrendingUp, color: 'text-emerald-400' },
    ];

    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Mobile Native Style */}
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800/60 rounded-[2.5rem] shadow-[0_0_80px_rgba(168,85,247,0.15)] flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header (Fixed) */}
                <div className="relative p-5 sm:p-6 border-b border-zinc-900 bg-zinc-950 flex-shrink-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/10 blur-[60px] rounded-full -z-10" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">Season 1</h3>
                                <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-0.5">Airdrop Snapshot</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all border border-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar overflow-x-hidden pb-8">
                    {!isConnected ? (
                        <div className="text-center py-10 space-y-4">
                            <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800">
                                <Info className="w-7 h-7 text-zinc-700" />
                            </div>
                            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Connect wallet to view</p>
                        </div>
                    ) : pointsData === null && !loading ? (
                        /* Binding UI - Simplified */
                        <div className="space-y-5">
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 text-center space-y-4 shadow-xl">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Personal Link Required</p>
                                <div className="space-y-2">
                                    <input 
                                        type="text"
                                        placeholder="Enter Telegram ID"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
                                        value={tgId}
                                        onChange={(e) => setTgId(e.target.value)}
                                    />
                                </div>
                                {bindStatus?.error && (
                                    <p className="text-red-400 text-[9px] font-bold uppercase tracking-tighter">{bindStatus.error}</p>
                                )}
                                <Button
                                    variant="neon"
                                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-black"
                                    onClick={handleBind}
                                    disabled={loading || !tgId}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Bind"}
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 opacity-60">
                                <div className="flex items-center space-x-3 px-3 py-2 bg-zinc-900/20 rounded-lg">
                                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[10px] font-bold text-zinc-400">1. /bind in bot</span>
                                </div>
                                <div className="flex items-center space-x-3 px-3 py-2 bg-zinc-900/20 rounded-lg">
                                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[10px] font-bold text-zinc-400">2. Sign message</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Points Display - Compact */
                        <>
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-6 text-center space-y-1 relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Total Points</p>
                                <div className="flex items-center justify-center space-x-2">
                                    <Zap className="w-7 h-7 text-purple-400 fill-purple-400/30 animate-pulse" />
                                    <span className="text-5xl font-black text-white tracking-tighter">
                                        {pointsData?.points?.toLocaleString() || '0'}
                                    </span>
                                </div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-black text-purple-400 uppercase mt-2">
                                    <Target className="w-3 h-3 mr-1.5" /> Active Degen
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-2xl">
                                        <stat.icon className={`w-4 h-4 mb-1.5 ${stat.color}`} />
                                        <span className={`text-xs font-black ${stat.color}`}>{stat.value}</span>
                                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Info Box - Compact */}
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start space-x-3">
                                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                                    Points sync automatically. Bridge assets or invite friends to climb Season 1.
                                </p>
                            </div>

                            {/* Rewards Guide Grid */}
                            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[1.8rem] p-5 space-y-3 shadow-inner">
                                <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center italic">Rewards Multiplier</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { l: 'Invite', v: '+50', c: 'text-cyan-400' },
                                        { l: '1 BNB Bet', v: '+100', c: 'text-emerald-400' },
                                        { l: '1 BNB GLP', v: '+50', c: 'text-purple-400' },
                                        { l: 'DOPA Presale', v: '2x Boost', c: 'text-pink-400' }
                                    ].map((r, i) => (
                                        <div key={i} className="p-3 bg-black/30 rounded-xl border border-zinc-900/50 flex flex-col items-center">
                                            <p className="text-[8px] font-black text-zinc-600 uppercase">{r.l}</p>
                                            <p className={`text-xs font-black ${r.c}`}>{r.v}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Bottom CTA */}
                    <div className="pt-2">
                        <Button
                            variant="neon"
                            className="w-full h-14 font-black shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-purple-600 hover:bg-purple-500 text-white rounded-2xl italic tracking-tight"
                            onClick={() => window.open('https://t.me/dopahouse_bot', '_blank')}
                        >
                            <Rocket className="w-5 h-5 mr-2 animate-bounce" /> GO TO BOT
                        </Button>
                    </div>
                </div>

                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(168, 85, 247, 0.1);
                        border-radius: 10px;
                    }
                `}</style>
            </div>
        </div>
    );
}
