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
    const { pointsData, loading, error, bindWallet, isConnected } = useAirdrop();
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
        { label: 'Welcome Bonus', value: pointsData ? '10 PTS' : '--', icon: Trophy, color: 'text-amber-400' },
        { label: 'Referral Rewards', value: pointsData ? `${(pointsData.invited_count || 0) * 50} PTS` : '--', icon: Users, color: 'text-cyan-400' },
        { label: 'Banking & Betting', value: pointsData ? `${Math.max(0, pointsData.points - 10 - (pointsData.invited_count || 0) * 50)} PTS` : 'Variable', icon: TrendingUp, color: 'text-emerald-400' },
    ];

    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                {/* Header (Fixed) */}
                <div className="relative p-6 pb-4 overflow-hidden shrink-0 border-b border-zinc-800/50">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 blur-[60px] rounded-full -z-10" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Season 1</h3>
                                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Airdrop Snapshot</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {!isConnected ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                                <Info className="w-8 h-8 text-zinc-600" />
                            </div>
                            <p className="text-zinc-400 font-bold uppercase tracking-tighter">Please connect your wallet first</p>
                        </div>
                    ) : error === 'Wallet not bound' ? (
                        /* Binding UI */
                        <div className="space-y-6">
                            {/* Binding Steps */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">Binding Process</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 flex items-center space-x-3 shadow-inner">
                                        <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">1</div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-bold text-zinc-300">获取 Telegram ID</p>
                                            <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">在机器人中发送 /bind 获取 ID</p>
                                        </div>
                                        <MessageSquare className="w-4 h-4 text-zinc-600 ml-auto" />
                                    </div>
                                    <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 flex items-center space-x-3 shadow-inner">
                                        <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">2</div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-bold text-zinc-300">确认下方 ID 填充</p>
                                            <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">通过 BOT 链接进入可自动填充</p>
                                        </div>
                                        <MousePointerClick className="w-4 h-4 text-zinc-600 ml-auto" />
                                    </div>
                                    <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 flex items-center space-x-3 shadow-inner">
                                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400 border border-purple-500/30 shrink-0">3</div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-bold text-purple-300">签署消息并验证</p>
                                            <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">通过钱包签名证明所有权</p>
                                        </div>
                                        <ShieldCheck className="w-4 h-4 text-purple-500/40 ml-auto" />
                                    </div>
                                </div>
                            </div>
 
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">绑定您的账户</p>
                                <div className="space-y-2">
                                    <input 
                                        type="text"
                                        placeholder="输入 Telegram ID"
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-700"
                                        value={tgId}
                                        onChange={(e) => setTgId(e.target.value)}
                                    />
                                </div>
                                
                                {bindStatus?.error && (
                                    <p className="text-red-400 text-[10px] font-bold uppercase">{bindStatus.error}</p>
                                )}
 
                                <Button
                                    variant="neon"
                                    className="w-full h-11"
                                    onClick={handleBind}
                                    disabled={loading || !tgId}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LinkIcon className="w-4 h-4 mr-2" /> Verify & Bind</>}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Points Display */
                        <>
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center space-y-2 group hover:border-purple-500/30 transition-all duration-500">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Your Dopa Points</p>
                                <div className="flex items-center justify-center space-x-3">
                                    <Zap className="w-8 h-8 text-purple-400 fill-purple-400/20 animate-pulse" />
                                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-pink-300 tracking-tighter">
                                        {pointsData?.points?.toLocaleString() || '0'}
                                    </span>
                                    <span className="text-xl font-black text-zinc-500">PTS</span>
                                </div>
                                <div className="inline-flex items-center px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-tighter mt-2">
                                    <Target className="w-3 h-3 mr-1.5" /> Ranking: Active Degen
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">Breakdown</h4>
                                <div className="space-y-2">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                                <span className="text-sm font-bold text-zinc-300">{stat.label}</span>
                                            </div>
                                            <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Info Box & Rules */}
                    <div className="space-y-4 pt-2">
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start space-x-3">
                            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-blue-300 uppercase leading-none">Airdrop Mechanism</p>
                                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                                    Points are synced automatically from your bound Telegram account. Play on mainnet, bridge assets, or invite friends to climb the leaderboard.
                                </p>
                            </div>
                        </div>

                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center italic">How to Earn Points</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/50 space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">Joining TG</p>
                                    <p className="text-sm font-black text-amber-400">+10 PTS</p>
                                </div>
                                <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/50 space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">Per Invite</p>
                                    <p className="text-sm font-black text-cyan-400">+50 PTS</p>
                                </div>
                                <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/50 space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">Per 1 BNB Bet</p>
                                    <p className="text-sm font-black text-emerald-400">+100 PTS</p>
                                </div>
                                <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/50 space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">Per 1 BNB GLP</p>
                                    <p className="text-sm font-black text-purple-400">+50 PTS</p>
                                </div>
                                <div className="col-span-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 space-y-1 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-bold text-purple-300 uppercase">Bonding Curve Support</p>
                                        <p className="text-xs text-zinc-500 font-medium">Earn more by buying $DOPA early</p>
                                    </div>
                                    <p className="text-sm font-black text-pink-400">+200 PTS / BNB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="space-y-3 pt-2">
                        <Button
                            variant="neon"
                            className="w-full h-12 font-black shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                            onClick={() => window.open('https://t.me/dopahouse_bot', '_blank')}
                        >
                            <Rocket className="w-5 h-5 mr-2" /> OPEN TELEGRAM BOT
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
