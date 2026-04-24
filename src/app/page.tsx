'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useEffect, useState, useMemo } from 'react';
import { Flame, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadContract, useReadContracts, usePublicClient, useAccount } from 'wagmi';
import { ADDRESSES, ABIS, getAddresses } from '@/abis/contracts';
import { HouseCard } from '@/components/HouseCard';
import { HouseData } from '@/types/house';
import { BurnedTicker } from '@/components/BurnedTicker';

const LIVE_BETS = [
  "0x1A4... just won 1.92 BNB in CoinFlip! 🚀",
  "0x7F2... hit a 5.7x payout in Dice Roll! 💰",
  "0x4B9... placed a MAX BET of 2 BNB! 🎲",
  "0x9C1... just won 1.5 BNB from the House! 🏆",
  "0x2E5... joined the Game! 🔥",
];

export default function Home() {
  const { chain } = useAccount();
  const addresses = getAddresses(chain?.id);
  // Always use a valid factory address even when disconnected
  const factoryAddress = (addresses.HouseFactory || ADDRESSES.HouseFactory) as `0x${string}`;

  const [tickerIndex, setTickerIndex] = useState(0);
  const [topHouses, setTopHouses] = useState<HouseData[] | null>(null);

  const { data: totalHouses } = useReadContract({
    address: factoryAddress,
    abi: ABIS.HouseFactory,
    functionName: 'totalHouses',
  });

  const houseCount = totalHouses ? Number(totalHouses) : 0;

  const { data: houseAddressesData } = useReadContracts({
    contracts: Array.from({ length: houseCount }).map((_, i) => ({
      address: factoryAddress,
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
      address: (addresses.Multicall3 || '0xcA11bde05977b3631167028862bE2a173976CA11') as `0x${string}`,
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
      address: factoryAddress,
      abi: ABIS.HouseFactory as any,
      functionName: 'isFeatured',
      args: [addr],
    },
    {
      address: factoryAddress,
      abi: ABIS.HouseFactory as any,
      functionName: 'isCertified',
      args: [addr],
    }
  ]), [houseAddresses, multicallAbi, factoryAddress]);

  // Batch fetch all details for ALL houses to find the top ones
  const { data: allHousesMetadata } = useReadContracts({
    contracts: metaContracts,
    query: { enabled: houseAddresses.length > 0 }
  });

  // Extract bankers for VIP check
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

  useEffect(() => {
    if (!allHousesMetadata || houseAddresses.length === 0) {
      if (houseCount === 0 && totalHouses !== undefined) setTopHouses([]);
      return;
    }

    const houses: HouseData[] = [];
    const vipTier1Min = BigInt('10000000000000000000000'); // 10k DOPA
    const vipTier2Min = BigInt('100000000000000000000000'); // 100k DOPA

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
          maxBetRatio: Number(ratioRes.result),
          referrerLossFeePercent: Number(lossRes.result),
          balance: balRes.result as bigint,
          metadata: metaRes?.status === 'success' ? metaRes.result as string : '',
          banker: bankerAddr,
          isVipTier1: staked >= vipTier1Min,
          isVipTier2: staked >= vipTier2Min,
          isFeatured: !!featRes?.result,
          isCertified: !!certRes?.result
        });
      }
    }

    // Sort Logic:
    // 1. Featured first
    // 2. Then by balance
    houses.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.balance > a.balance ? 1 : -1;
    });
    setTopHouses(houses.slice(0, 3));
  }, [allHousesMetadata, bankerVipData, houseAddresses, houseCount, totalHouses]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_BETS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 50 } }
  };

  return (
    <div className="relative isolate overflow-hidden min-h-screen pb-20">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Live Bets Framer Ticker */}
      <div className="w-full bg-emerald-950/40 border-b border-emerald-900/50 py-2 overflow-hidden flex items-center justify-center backdrop-blur-md relative z-20 h-10">
        <Link href="/lobby" className="w-full h-full flex items-center justify-center">
          <div className="flex items-center justify-center text-emerald-400 font-mono text-xs sm:text-sm tracking-wide w-full h-full hover:text-emerald-300 transition-colors cursor-pointer group">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={tickerIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "anticipate" }}
                className="flex items-center space-x-2 absolute whitespace-nowrap px-4"
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[85vw] group-hover:underline decoration-emerald-500/50">{LIVE_BETS[tickerIndex]}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-6 leading-[1.1] md:leading-[1.1] break-words">
          BE THE HOUSE,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 hover:tracking-widest transition-all duration-700 cursor-default inline-flex items-center space-x-1.5 md:space-x-4 flex-wrap justify-center">
            PLAY THE HOUSE.
            <Flame className="w-6 h-6 sm:w-8 sm:h-8 md:w-16 md:h-16 text-purple-500 shrink-0" />
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="mt-6 text-xl text-zinc-300 max-w-2xl mx-auto mb-4 font-medium">
          The most degen Web3 Casino: DopaHouse.
        </motion.p>

        <motion.p variants={itemVariants} className="text-zinc-500 max-w-xl mx-auto mb-10 text-sm">
          No wallet? No problem. Use your <strong>Google or X (Twitter)</strong> account for seamless 1-click login. Bankroll your own room, set your edge, or play provably fair games powered by Chainlink VRF.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-24">
          <Link href="/lobby">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="neon" size="lg" className="w-full sm:w-auto px-8 h-14 text-lg">
                START PLAYING <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
          <Link href="/banker">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-14 text-lg border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                BECOME A BANKER
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Burned Tokens Display */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-20">
          <BurnedTicker />
        </motion.div>

        {/* Hot Rooms Top 3 Leaderboard */}
        {topHouses !== null && topHouses.length > 0 && (
          <motion.div variants={itemVariants} className="mt-20 text-left relative z-10">
            <div className="flex items-center space-x-2 mb-8 justify-center">
              <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
              <h2 className="text-2xl font-black text-white">TRENDING VAULTS</h2>
              <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 space-y-6 md:space-y-0 md:space-x-6 max-w-5xl mx-auto">
              {topHouses.map((house, idx) => (
                <motion.div
                  key={house.address}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  whileHover={{ y: -10 }}
                >
                  <HouseCard data={house} index={idx} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
