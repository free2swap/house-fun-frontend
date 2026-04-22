'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { TrendingUp, Zap, ShieldCheck, Coins, ArrowRight, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BankerCalculatorProps {
    nativeSymbol: string;
    bnbPrice: number;
    dopaPrice: number;
    onAction?: (action: 'whale' | 'help') => void;
}

export function BankerCalculator({ nativeSymbol, bnbPrice, dopaPrice, onAction }: BankerCalculatorProps) {
    const [dailyVolume, setDailyVolume] = useState(5); // Default 5 BNB
    const [isVip, setIsVip] = useState(false);
    const [showLearnMore, setShowLearnMore] = useState(false);

    // Protocol Constants
    const HOUSE_EDGE = 0.04;      // 4% House Edge
    const STD_REBATE = 0.005;     // 0.5% Standard
    const VIP_REBATE = 0.015;     // 1.5% VIP Tier 1
    const WHALE_SETUP_FEE = 1.0;  // 1 BNB for Whale Tier

    const effectiveRebate = isVip ? VIP_REBATE : STD_REBATE;
    const dailyGGR = dailyVolume * HOUSE_EDGE;
    const dailyRebate = dailyVolume * effectiveRebate;
    const dailyTotal = dailyGGR + dailyRebate;
    const monthlyTotal = dailyTotal * 30;
    const setupFeeSavings = WHALE_SETUP_FEE * 0.5;

    const formatUSD = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/80 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            <CardHeader className="relative">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                            Banker ROI Simulator
                        </CardTitle>
                        <CardDescription className="text-zinc-400 font-medium text-sm">
                            Project your earnings as a decentralized house with real-time USD valuations.
                        </CardDescription>
                    </div>
                    <div className="hidden sm:block">
                        <div className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            Live Projections
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-8 relative">
                {/* Inputs Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-zinc-300 uppercase tracking-tighter">
                                Est. Daily Betting Volume
                            </label>
                            <span className="text-xl font-black text-emerald-400 font-mono">
                                {dailyVolume} {nativeSymbol}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="50"
                            step="0.5"
                            value={dailyVolume}
                            onChange={(e) => setDailyVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase">
                            <span>KOL (Tiny)</span>
                            <span>Whale Target</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-zinc-300 uppercase tracking-tighter block">
                            VIP Status
                        </label>
                        <div 
                            onClick={() => setIsVip(!isVip)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${isVip ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isVip ? 'bg-purple-500/20' : 'bg-zinc-900 text-zinc-500'}`}>
                                    <Zap className={`w-5 h-5 ${isVip ? 'text-purple-400 fill-purple-400' : ''}`} />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${isVip ? 'text-white' : 'text-zinc-400'}`}>Stake 10,000 $DOPA</p>
                                    <p className="text-xs text-zinc-500">Unlock 3x Rebate & 50% Fee Discount</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${isVip ? 'bg-purple-500' : 'bg-zinc-800'}`}>
                                <motion.div 
                                    animate={{ x: isVip ? 20 : 2 }}
                                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outputs Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-emerald-500/30 transition-all">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Expected Daily GGR</p>
                        <h4 className="text-xl font-black text-white font-mono flex items-center gap-2">
                            {formatUSD(dailyGGR * bnbPrice || 0)}
                        </h4>
                        <p className="text-xs text-zinc-600 mt-2 font-medium">Approx {dailyGGR.toFixed(2)} {nativeSymbol} @ {formatUSD(bnbPrice)}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-emerald-500/30 transition-all">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Platform Rebates</p>
                        <h4 className="text-xl font-black text-emerald-400 font-mono flex items-center gap-2">
                            +{formatUSD(dailyRebate * bnbPrice || 0)}
                        </h4>
                        <p className="text-xs text-emerald-500/60 mt-2 font-medium">Direct yield from 3% protocol rake.</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-purple-500/10 border border-emerald-500/20 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Coins className="w-12 h-12 text-emerald-500" />
                        </div>
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Monthly Profit Target</p>
                        <h4 className="text-3xl font-black text-white font-mono flex items-center gap-2">
                            {formatUSD(monthlyTotal * bnbPrice || 0)}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-2 font-bold flex items-center gap-1">
                             ≈ {monthlyTotal.toFixed(2)} {nativeSymbol} <span className="text-zinc-600 font-normal">Income Projection</span>
                        </p>
                    </div>
                </div>

                {/* VIP Bonus Highlight */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h5 className="text-white font-black uppercase tracking-tight">VIP Banker Synergy</h5>
                            <p className="text-xs text-zinc-500 max-w-md">By staking DOPA, you not only triple your rebate yield but also save significant capital on setup fees.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end">
                        <div className="text-emerald-400 font-black text-xl flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-emerald-400" />
                            SAVE {formatUSD(setupFeeSavings * bnbPrice || 0)}
                        </div>
                        <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-1">On Whale Tier Setup Fee</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button 
                        variant="neon" 
                        className="flex-1 h-14 text-lg font-black tracking-widest group shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all"
                        onClick={() => onAction?.('whale')}
                    >
                        BECOME THE HOUSE NOW <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                        variant="outline" 
                        className="sm:w-48 h-14 border-zinc-700 text-zinc-300 font-bold hover:text-white transition-all text-base"
                        onClick={() => setShowLearnMore(true)}
                    >
                        LEARN MORE
                    </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-950/30 p-2 rounded-lg">
                    <Info className="w-3 h-3 shrink-0" />
                    <p>Projections are based on mathematical probabilities. Actual results depend on user variance and luck. House edge averages 4% over long time horizons.</p>
                </div>
            </CardContent>

            {/* Learn More Modal */}
            <AnimatePresence>
                {showLearnMore && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLearnMore(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl w-full relative z-10 shadow-3xl"
                        >
                            <button 
                                onClick={() => setShowLearnMore(false)}
                                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                                <Zap className="w-6 h-6 text-emerald-400" /> House Tier Comparison
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-4 gap-4 pb-4 border-b border-zinc-800 text-xs font-black text-zinc-500 uppercase tracking-widest">
                                    <span>Feature</span>
                                    <span className="text-zinc-300">Degen</span>
                                    <span className="text-emerald-400">Chad</span>
                                    <span className="text-purple-400">Whale</span>
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-sm items-center py-2">
                                    <span className="text-zinc-400 font-bold">Min Liquidity</span>
                                    <span className="text-white font-mono">0.1 BNB</span>
                                    <span className="text-white font-mono">1.0 BNB</span>
                                    <span className="text-white font-mono">5.0 BNB</span>
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-sm items-center py-2">
                                    <span className="text-zinc-400 font-bold">Setup Fee</span>
                                    <span className="text-zinc-500 font-mono">0.05 BNB</span>
                                    <span className="text-zinc-500 font-mono">0.2 BNB</span>
                                    <span className="text-zinc-500 font-mono">1.0 BNB</span>
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-sm items-center py-2">
                                    <span className="text-zinc-400 font-bold">Max Bet Limit</span>
                                    <span className="text-white">Basic</span>
                                    <span className="text-white font-bold">Priority</span>
                                    <span className="text-emerald-400 font-black">Elite Max</span>
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-sm items-center py-2">
                                    <span className="text-zinc-400 font-bold">Marketing</span>
                                    <span className="text-zinc-600">Standard</span>
                                    <span className="text-zinc-300">Featured</span>
                                    <span className="text-white decoration-emerald-500 underline font-bold">Banner Ad</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-xs text-emerald-400 font-bold leading-relaxed">
                                    Whale Tier houses get priority indexing in the lobby and are eligible for our 'Banker Burn' program where protocol fees are shared back to top liquidity providers.
                                </p>
                            </div>

                            <Button 
                                variant="neon" 
                                className="w-full mt-8 h-12 font-black tracking-widest"
                                onClick={() => {
                                    setShowLearnMore(false);
                                    onAction?.('whale');
                                }}
                            >
                                CHOOSE WHALE TIER NOW
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Card>
    );
}
