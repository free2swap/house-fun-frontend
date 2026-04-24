'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReadContract, useReadContracts, useBalance, useAccount, usePublicClient } from 'wagmi';
import { ADDRESSES, ABIS, getAddresses } from '@/abis/contracts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Activity, Users, ShieldCheck, Flame, Trophy, Zap } from 'lucide-react';
import { parseEther } from 'viem';
import { HouseData } from '@/types/house';
import { HouseCard } from '@/components/HouseCard';


export default function LobbyPage() {
    const { chain } = useAccount();
    const addresses = getAddresses(chain?.id);

    const { data: totalHouses } = useReadContract({
        address: addresses.HouseFactory as `0x${string}`,
        abi: ABIS.HouseFactory,
        functionName: 'totalHouses',
    });

    const houseCount = totalHouses ? Number(totalHouses) : 0;

    const { data: houseAddressesData } = useReadContracts({
        contracts: Array.from({ length: houseCount }).map((_, i) => ({
            address: addresses.HouseFactory as `0x${string}`,
            abi: ABIS.HouseFactory as any,
            functionName: 'allHouses',
            args: [BigInt(i)]
        })),
        query: { enabled: houseCount > 0 }
    });

    const houseAddresses = useMemo(() => houseAddressesData
        ?.filter(res => res.status === 'success' && res.result)
        .map(res => res.result as `0x${string}`) || [], [houseAddressesData]);

    // Multicall3 ABI for fetching ETH balances
    const multicallAbi = useMemo(() => [{
        inputs: [{ internalType: "address", name: "addr", type: "address" }],
        name: "getEthBalance",
        outputs: [{ internalType: "uint256", name: "balance", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    }] as const, []);

    const metaContracts = useMemo(() => houseAddresses.flatMap(addr => [
        {
            address: addr,
            abi: ABIS.HouseVault as any,
            functionName: 'maxBetRatio',
        },
        {
            address: addr,
            abi: ABIS.HouseVault as any,
            functionName: 'referrerLossFeePercent',
        },
        {
            address: (addresses.Multicall3 || '0xcA11bde05977b3631167028862bE2a173976CA11') as `0x${string}`, // Standard Multicall3 address
            abi: multicallAbi,
            functionName: 'getEthBalance',
            args: [addr],
        },
        {
            address: addr,
            abi: ABIS.HouseVault as any,
            functionName: 'banker',
        },
        {
            address: addr,
            abi: ABIS.HouseVault as any,
            functionName: 'metadata',
        },
        {
            address: addresses.HouseFactory as `0x${string}`,
            abi: ABIS.HouseFactory as any,
            functionName: 'isFeatured',
            args: [addr],
        },
        {
            address: addresses.HouseFactory as `0x${string}`,
            abi: ABIS.HouseFactory as any,
            functionName: 'isCertified',
            args: [addr],
        }
    ]), [houseAddresses, multicallAbi, addresses.HouseFactory]);

    // Batch fetch all metadata, balances, and banker info
    const { data: allHousesMetadata, isLoading: isMetadataLoading } = useReadContracts({
        contracts: metaContracts,
        query: { enabled: houseAddresses.length > 0 }
    });


    // Sub-fetch VIP status for all bankers found
    const bankers = useMemo(() => Array.from(new Set(
        allHousesMetadata
            ?.filter((_, i) => i % 7 === 3)
            .map(res => res.status === 'success' ? res.result as `0x${string}` : undefined)
            .filter(Boolean)
    )) as `0x${string}`[], [allHousesMetadata]);

    const vipContracts = useMemo(() => bankers.map(banker => ({
        address: addresses.FunStaking as `0x${string}`,
        abi: ABIS.FunStaking as any,
        functionName: 'stakedBalance',
        args: [banker]
    })), [bankers, addresses.FunStaking]);

    const { data: bankerVipData } = useReadContracts({
        contracts: vipContracts,
        query: { enabled: bankers.length > 0 }
    });

    const bankerVipMap = useMemo(() => new Map(bankers.map((b, i) => [b, bankerVipData?.[i]?.status === 'success' ? BigInt(bankerVipData[i].result as string) : 0n])), [bankers, bankerVipData]);

    const sortedHouses = useMemo(() => {
        if (!allHousesMetadata || houseAddresses.length === 0) {
            return (houseCount === 0 && totalHouses !== undefined) ? [] : null;
        }

        const houses: HouseData[] = [];
        const vipTier1Min = parseEther('10000');
        const vipTier2Min = parseEther('100000');

        for (let i = 0; i < houseAddresses.length; i++) {
            const baseIdx = i * 7;
            const ratioRes = allHousesMetadata[baseIdx];
            const lossRes = allHousesMetadata[baseIdx + 1];
            const balRes = allHousesMetadata[baseIdx + 2];
            const ownerRes = allHousesMetadata[baseIdx + 3];
            const metaRes = allHousesMetadata[baseIdx + 4];
            const featRes = allHousesMetadata[baseIdx + 5];
            const certRes = allHousesMetadata[baseIdx + 6];

            if (ratioRes?.status === 'success' && lossRes?.status === 'success' && balRes?.status === 'success' && ownerRes?.status === 'success') {
                const bankerAddr = ownerRes.result as `0x${string}`;
                const staked = bankerVipMap.get(bankerAddr) || 0n;

                houses.push({
                    address: houseAddresses[i],
                    banker: bankerAddr,
                    maxBetRatio: Number(ratioRes.result),
                    referrerLossFeePercent: Number(lossRes.result),
                    balance: balRes.result as bigint,
                    metadata: metaRes?.status === 'success' ? metaRes.result as string : '',
                    isVipTier1: staked >= vipTier1Min,
                    isVipTier2: staked >= vipTier2Min,
                    isFeatured: !!featRes?.result,
                    isCertified: !!certRes?.result
                });
            }
        }

        // Sorting Logic:
        // 1. Featured Rooms first (by balance)
        // 2. Then others (by balance)
        return houses.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.balance > a.balance ? 1 : -1;
        });
    }, [allHousesMetadata, bankerVipData, houseAddresses, houseCount, totalHouses]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-12 pb-12">
            <div className="mb-8 md:mb-12 text-center">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2 uppercase break-words leading-none">
                    GAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">LOBBY</span>
                </h1>
                <p className="text-sm md:text-xl text-zinc-500 max-w-2xl mx-auto font-bold uppercase tracking-widest opacity-60">
                    Provably Fair Liquidity Pools
                </p>
            </div>

            {/* Leaderboard Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* Top Bankers Card */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy className="w-24 h-24 text-yellow-500" />
                    </div>
                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                        <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Top Bankers</h2>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {sortedHouses === null ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-12 bg-zinc-800/50 animate-pulse rounded-xl" />)
                        ) : sortedHouses.slice(0, 3).map((house, idx) => (
                            <div key={house.address} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:border-emerald-500/30 transition-all">
                                <div className="flex items-center space-x-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-zinc-300 text-black' : 'bg-amber-700 text-white'}`}>
                                        {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white font-mono">{house.address.substring(0, 6)}...{house.address.substring(38)}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{house.isFeatured ? '⭐ Featured' : 'Vault'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-emerald-400 font-black text-sm">{(Number(house.balance) / 1e18).toFixed(2)} BNB</span>
                                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">TVL</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Big Wins Card (Simulated/Real-time) */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Zap className="w-5 h-5 text-purple-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Recent Jackpots</h2>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {/* Mocking recent wins for visual proof, in production these would be fetched via getLogs or a subgraph */}
                        {[
                            { user: "0x7F2...4B9", amount: "1.92", game: "CoinFlip", time: "2m ago", color: "text-emerald-400" },
                            { user: "0x1A4...9C1", amount: "5.70", game: "Dice Roll", time: "5m ago", color: "text-purple-400" },
                            { user: "0x2E5...3D8", amount: "0.96", game: "Lucky Roll", time: "12m ago", color: "text-amber-400" },
                        ].map((win, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                        <Activity className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white font-mono">{win.user}</span>
                                        <span className={`text-[10px] uppercase font-black tracking-widest ${win.color}`}>{win.game}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-black text-sm">+{win.amount} BNB</span>
                                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{win.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {sortedHouses === null ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 space-x-6 space-y-6 md:space-x-0 md:space-y-0 md:gap-6">
                    {[...Array(Math.max(houseCount, 4))].map((_, i) => (
                        <Card key={i} className="animate-pulse border-zinc-800 bg-zinc-900/50">
                            <CardContent className="h-64"></CardContent>
                        </Card>
                    ))}
                </div>
            ) : sortedHouses.length === 0 ? (
                <div className="text-center py-24 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
                    <p className="text-zinc-500 text-lg">No houses have been created yet. Be the first Banker!</p>
                    <Link href="/banker" className="inline-block mt-4">
                        <Button variant="outline">Create a House</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 space-x-6 space-y-6 md:space-x-0 md:space-y-0 md:gap-6">
                    {sortedHouses.map((house, idx) => (
                        <HouseCard key={house.address} data={house} index={idx} />
                    ))}
                </div>
            )}
        </div>
    );
}
