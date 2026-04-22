'use client';

import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Activity, Users, ShieldCheck, Zap, Trophy } from 'lucide-react';
import { HouseData } from '@/types/house';
import Image from 'next/image';
import { useBnbPrice } from '@/hooks/useBnbPrice';

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
        <Card className={`transition-all duration-300 group ${isSpecial ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'hover:border-emerald-500/50'}`}>
            <CardHeader className="pb-4 border-b border-zinc-900 relative overflow-hidden">
                {isTop3 && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] pointer-events-none" />
                )}
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <CardTitle className="font-mono text-sm text-zinc-300 flex items-center space-x-2">
                            {address.substring(0, 6)}...{address.substring(address.length - 4)}
                            {isTop3 && <Trophy className="w-4 h-4 text-emerald-400" />}
                            {isVipTier2 && <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />}
                            {isVipTier1 && !isVipTier2 && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 flex-wrap">
                            {isFeatured && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30">Featured</span>}
                            {isCertified && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase border border-blue-500/30">Certified</span>}
                            {isTop3 ? `Rank #${index + 1} Vault` : !isFeatured && !isCertified && 'Verified Pool'}
                            {isVipTier2 && <span className="text-[10px] text-purple-400 font-bold uppercase tracking-tighter">Rainmaker</span>}
                        </CardDescription>
                    </div>
                    {metadata && (metadata.startsWith('http') || metadata.startsWith('ipfs')) ? (
                        <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-zinc-800">
                            <Image 
                                src={metadata.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                                alt="Room Logo" 
                                fill
                                sizes="40px"
                                className="object-cover" 
                                unoptimized={metadata.startsWith('ipfs')} // IPFS can be slow, handle carefully
                            />
                        </div>
                    ) : (
                        <ShieldCheck className="w-5 h-5 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 space-x-4">
                    <div>
                        <p className="text-xs text-zinc-500 font-medium mb-1 flex items-center space-x-1">
                            <Activity className="w-3 h-3" /> TVL (Liquidity)
                        </p>
                        <p className={`text-lg font-bold leading-none ${isTop3 ? 'text-emerald-400' : 'text-white'}`}>{formattedTvl} {nativeSymbol}</p>
                        <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mt-1">≈ ${(Number(formattedTvl) * bnbPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 font-medium mb-1">Max Bet Limit</p>
                        <p className="text-lg font-bold text-white leading-none">{formattedRatio}%</p>
                        <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mt-1">Cap: {maxBetAmount} {nativeSymbol}</p>
                    </div>
                </div>

                <div className="bg-zinc-950 rounded-md p-3 border border-zinc-900/50">
                    <p className="text-xs text-zinc-500 font-medium mb-1 flex items-center space-x-1">
                        <Users className="w-3 h-3" /> Referral Commission
                    </p>
                    <div className="flex justify-between items-baseline">
                        <p className="text-sm text-white">Base: 1.0%</p>
                        <p className="text-sm text-purple-400 font-medium">+ {formattedLossFee}% (Loss)</p>
                    </div>
                </div>

                <Link href={`/play/${address}`} className="block mt-4">
                    <Button variant={isTop3 ? "neon" : "outline"} className={`w-full ${!isTop3 && 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                        Join Table
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
