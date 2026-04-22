'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { 
    Zap, Trophy, Users, Twitter, Share2, 
    ArrowRight, CheckCircle2, Loader2, Sparkles,
    TrendingUp, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAirdrop } from '@/hooks/useAirdrop';

const API_BASE = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001/api';

export default function AirdropPage() {
    const { address, isConnected } = useAccount();
    const { pointsData, loading, error, fetchPoints } = useAirdrop();
    const [claimingTask, setClaimingTask] = useState<string | null>(null);
    const [proofs, setProofs] = useState({
        follow: { handle: '', link: '' },
        retweet: { handle: '', link: '' }
    });

    const handleClaim = async (taskType: 'follow' | 'retweet') => {
        if (!address) return toast.error("Please connect wallet");
        
        const { handle, link } = proofs[taskType];
        if (!handle || !link) {
            return toast.error("Please provide your Twitter ID and Proof Link", {
                icon: '⚠️',
                style: { background: '#450a0a', color: '#fca5a5', border: '1px solid #991b1b' }
            });
        }
        
        setClaimingTask(taskType);
        try {
            await new Promise(res => setTimeout(res, 2000));
            
            const res = await fetch(`${API_BASE}/twitter/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    wallet_address: address,
                    task_type: taskType,
                    twitter_handle: handle,
                    proof_link: link
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Claim submitted for audit! 🚀`, {
                    icon: '💎',
                    style: { background: '#064e3b', color: '#fff', border: '1px solid #10b981' }
                });
                fetchPoints();
            } else {
                toast.error(data.error || "Claim failed");
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setClaimingTask(null);
        }
    };

    const copyInviteLink = () => {
        const link = `https://t.me/dopahouse_bot?start=${pointsData?.tg_id || ''}`;
        navigator.clipboard.writeText(link);
        toast.success("Invite link copied!");
    };

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Hero section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Season 1: The Genesis Airdrop</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic mb-4">
                            DOPA <span className="text-emerald-500 underline decoration-indigo-500/50 underline-offset-8">REWARDS</span>
                        </h1>
                        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest max-w-lg mx-auto">
                            Mine points by securing the house, spreading the word, and leading the degen revolution.
                        </p>
                    </motion.div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full" />
                        <Zap className="w-6 h-6 text-emerald-400 mb-4" />
                        <div className="text-3xl font-black text-white tabular-nums">
                            {pointsData?.points?.toLocaleString() || '0'}
                        </div>
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Total Points</div>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px] rounded-full" />
                        <Users className="w-6 h-6 text-indigo-400 mb-4" />
                        <div className="text-3xl font-black text-white tabular-nums">
                            {pointsData?.invited_count || '0'}
                        </div>
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Legion Size</div>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full" />
                        <Trophy className="w-6 h-6 text-amber-400 mb-4" />
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rank: <span className="text-white">Active Degen</span></div>
                        <div className="mt-2 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[65%]" />
                        </div>
                    </div>
                </div>

                {/* Active Task wall */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest ml-2 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-3 text-emerald-500" />
                        Active Bounties
                    </h2>

                    {/* Twitter Tasks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Follow Task */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[1.5rem] p-6 hover:border-emerald-500/30 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-emerald-500/50 transition-colors">
                                    <Twitter className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-emerald-500">+100 PTS</span>
                                    <p className="text-[8px] text-zinc-500 uppercase font-black">Verify Proof</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-white mb-2">Join the inner circle</h3>
                            <p className="text-xs text-zinc-500 mb-6 font-medium">Follow @DopaHouse on Twitter and submit your detail.</p>
                            
                            <div className="space-y-3 mt-auto">
                                <div className="grid grid-cols-1 gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Twitter ID (@handle)"
                                        className="bg-black/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                        value={proofs.follow.handle}
                                        onChange={(e) => setProofs({...proofs, follow: {...proofs.follow, handle: e.target.value}})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Your Profile Link"
                                        className="bg-black/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                        value={proofs.follow.link}
                                        onChange={(e) => setProofs({...proofs, follow: {...proofs.follow, link: e.target.value}})}
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <Button 
                                        variant="outline"
                                        onClick={() => window.open('https://x.com/dopahouse', '_blank')}
                                        className="flex-1 bg-zinc-950 border-zinc-800 text-[11px] font-black hover:bg-zinc-900 h-10"
                                    >
                                        FOLLOW <ExternalLink className="w-3 h-3 ml-2" />
                                    </Button>
                                    <Button 
                                        onClick={() => handleClaim('follow')}
                                        disabled={claimingTask === 'follow'}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-10 px-6 text-[11px]"
                                    >
                                        {claimingTask === 'follow' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CLAIM'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Retweet Task */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[1.5rem] p-6 hover:border-indigo-500/30 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/50 transition-colors">
                                    <Share2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-indigo-400">+200 PTS</span>
                                    <p className="text-[8px] text-zinc-500 uppercase font-black">Verify Link</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-white mb-2">Radioactive Share</h3>
                            <p className="text-xs text-zinc-500 mb-6 font-medium">Retweet the pinned post and submit the share link.</p>
                            
                            <div className="space-y-3 mt-auto">
                                <div className="grid grid-cols-1 gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Twitter ID (@handle)"
                                        className="bg-black/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                                        value={proofs.retweet.handle}
                                        onChange={(e) => setProofs({...proofs, retweet: {...proofs.retweet, handle: e.target.value}})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Retweet / Post Link"
                                        className="bg-black/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                                        value={proofs.retweet.link}
                                        onChange={(e) => setProofs({...proofs, retweet: {...proofs.retweet, link: e.target.value}})}
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <Button 
                                        variant="outline"
                                        onClick={() => window.open('https://x.com/dopahouse/status/2046911930452091117', '_blank')}
                                        className="flex-1 bg-zinc-950 border-zinc-800 text-[11px] font-black hover:bg-zinc-900 h-10"
                                    >
                                        RETWEET <ExternalLink className="w-3 h-3 ml-2" />
                                    </Button>
                                    <Button 
                                        onClick={() => handleClaim('retweet')}
                                        disabled={claimingTask === 'retweet'}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-10 px-6 text-[11px]"
                                    >
                                        {claimingTask === 'retweet' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CLAIM'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invitation Card */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Build your Legion</h3>
                                <p className="text-sm text-zinc-500 font-bold">Earn 50 PTS for every referral who joins the House.</p>
                            </div>
                            <div className="flex w-full md:w-auto space-x-2">
                                <div className="flex-1 bg-black/60 border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-400 text-xs font-mono flex items-center">
                                    t.me/dopahouse_bot?start={pointsData?.tg_id || 'ID'}
                                </div>
                                <Button 
                                    onClick={copyInviteLink}
                                    className="bg-white text-black font-black px-8 rounded-2xl hover:bg-zinc-200"
                                >
                                    COPY
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom disclaimer */}
                    <div className="pt-8 space-y-10">
                        {/* Points Earning Guide */}
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Zap className="w-48 h-48 text-white rotate-12" />
                            </div>
                            
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center italic">
                                <Sparkles className="w-5 h-5 mr-3 text-amber-500" />
                                How to Mine Points
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-5 bg-black/40 rounded-2xl border border-zinc-800/50 space-y-2 group hover:border-amber-500/30 transition-colors">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Entry Bonus</p>
                                    <p className="text-2xl font-black text-amber-400 tracking-tighter">+10 <span className="text-xs">PTS</span></p>
                                    <p className="text-[9px] text-zinc-500 font-bold leading-tight">Start your journey by joining our Telegram community.</p>
                                </div>
                                <div className="p-5 bg-black/40 rounded-2xl border border-zinc-800/50 space-y-2 group hover:border-cyan-500/30 transition-colors">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Referral Reward</p>
                                    <p className="text-2xl font-black text-cyan-400 tracking-tighter">+50 <span className="text-xs">PTS</span></p>
                                    <p className="text-[9px] text-zinc-500 font-bold leading-tight">For every OG you bring to the house via your link.</p>
                                </div>
                                <div className="p-5 bg-black/40 rounded-2xl border border-zinc-800/50 space-y-2 group hover:border-emerald-500/30 transition-colors">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Betting Power</p>
                                    <p className="text-2xl font-black text-emerald-400 tracking-tighter">+100 <span className="text-xs">PTS</span></p>
                                    <p className="text-[9px] text-zinc-500 font-bold leading-tight">Per 1 BNB volume. High stakes, higher rewards.</p>
                                </div>
                                <div className="p-5 bg-black/40 rounded-2xl border border-zinc-800/50 space-y-2 group hover:border-purple-500/30 transition-colors">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">GLP Staking</p>
                                    <p className="text-2xl font-black text-purple-400 tracking-tighter">+50 <span className="text-xs">PTS</span></p>
                                    <p className="text-[9px] text-zinc-500 font-bold leading-tight">Per 1 BNB staked. Passive points for liquidity providers.</p>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <p className="text-[11px] font-black text-purple-300 uppercase tracking-widest mb-1 italic">Early Adopter Multiplier</p>
                                    <p className="text-[10px] text-zinc-500 font-medium italic">Genesis phase users earn 2x points on all on-chain activities.</p>
                                </div>
                                <div className="px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-400 text-xs font-black italic">
                                    SOON: $DOPA FAIRLAUNCH
                                </div>
                            </div>
                        </div>

                        <p className="text-[9px] text-zinc-600 font-black text-center uppercase tracking-widest leading-relaxed">
                            Points have no monetary value yet and represent your contribution to the Genesis phase.<br/>
                            We reserve the right to audit and remove points for sybil activity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
