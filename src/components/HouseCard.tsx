'use client';

import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Activity, Users, ShieldCheck, Zap, Trophy, ChevronRight } from 'lucide-react';
import { HouseData } from '@/types/house';
import Image from 'next/image';
import { useBnbPrice } from '@/hooks/useBnbPrice';
import { motion } from 'framer-motion';

export function HouseCard({ data, index }: { data: HouseData; index?: number }) {
    const bnbPrice = useBnbPrice();
    const { chain } = useAccount();
    const nativeSymbol = 'BNB';
    const { address, balance, maxBetRatio, referrerLossFeePercent, metadata, isVipTier1, isVipTier2, isFeatured, isCertified } = data;

    const formattedTvl = (Number(balance) / 1e18).toFixed(4);
    const formattedRatio = (Number(maxBetRatio) / 100).toFixed(2);
    const formattedLossFee = (Number(referrerLossFeePercent) / 100).toFixed(2);
    const maxBetAmount = ((Number(balance) / 1e18) * (Number(maxBetRatio) / 10000)).toFixed(4);

    const isTop3 = index !== undefined && index < 3;
    const isSpecial = isTop3 || isFeatured || isCertified;

    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            className="h-full"
        >
            <Card className={`h-full transition-all duration-300 group ${isSpecial ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-zinc-900 bg-zinc-950/40 hover:border-emerald-500/30'}`}>
                <CardHeader className="p-4 sm:p-6 border-b border-zinc-900 relative overflow-hidden">
                    {isTop3 && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[30px] pointer-events-none" />
                    )}
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <CardTitle className="font-mono text-xs sm:text-sm text-zinc-400 flex items-center space-x-2">
                                <span className="opacity-60">{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
                                {isTop3 && <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />}
                                {isVipTier2 && <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1.5 flex-wrap mt-1">
                                {isFeatured && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-black uppercase border border-emerald-500/30">HOT</span>}
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                    {isTop3 ? `Rank #${index + 1}` : 'Verified'}
                                </span>
                            </CardDescription>
                        </div>
                        {metadata && (metadata.startsWith('http') || metadata.startsWith('ipfs')) ? (
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-inner">
                                <Image 
                                    src={metadata.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                                    alt="Room Logo" 
                                    fill
                                    sizes="40px"
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                    unoptimized={metadata.startsWith('ipfs')}
                                />
                            </div>
                        ) : (
                            <ShieldCheck className="w-5 h-5 text-emerald-500/20 group-hover:text-emerald-500/50 transition-colors" />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest flex items-center">
                                <Activity className="w-2.5 h-2.5 mr-1 text-emerald-500" /> TVL
                            </p>
                            <p className={`text-base sm:text-lg font-black leading-none ${isTop3 ? 'text-emerald-400' : 'text-white'}`}>{formattedTvl} <span className="text-[10px] opacity-40">BNB</span></p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">≈ ${ (Number(formattedTvl) * bnbPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }) }</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Limit</p>
                            <p className="text-base sm:text-lg font-black text-white leading-none">{formattedRatio}%</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Cap: {maxBetAmount}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900/50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Affiliate</span>
                        </div>
                        <span className="text-[11px] font-black text-emerald-400">1.0% + {formattedLossFee}%</span>
                    </div>

                    <Link href={`/play/${address}`} className="block">
                        <Button 
                            variant={isTop3 ? "neon" : "outline"} 
                            className={`w-full h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-black italic tracking-tight ${!isTop3 && 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'}`}
                        >
                            JOIN BATTLE <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    );
}
