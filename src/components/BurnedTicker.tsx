import { useReadContract, useAccount } from 'wagmi';
import { ABIS, getAddresses } from '@/abis/contracts';
import { formatEther } from 'viem';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

const TOTAL_SUPPLY = 1_000_000_000;

export function BurnedTicker() {
    const { chain } = useAccount();
    const v2Addresses = getAddresses(chain?.id);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: currentSupply } = useReadContract({
        address: v2Addresses.FunToken as `0x${string}`,
        abi: ABIS.FunToken,
        functionName: 'totalSupply',
        query: {
            refetchInterval: 10000 // refresh every 10s
        }
    });

    if (!mounted) return null;

    const current = currentSupply ? Number(formatEther(currentSupply as bigint)) : TOTAL_SUPPLY;
    const burned = TOTAL_SUPPLY - current;

    // Formatting for display
    const displayBurned = burned.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const burnPercent = ((burned / TOTAL_SUPPLY) * 100).toFixed(2);

    return (
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-950/40 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)] hover:border-rose-500/40 transition-colors group">
            <div className="flex items-center space-x-2 mb-2">
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    Total $DOPA Burned
                </span>
            </div>

            <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-rose-600 font-mono tracking-tighter">
                {displayBurned}
            </div>

            <div className="mt-2 text-xs font-medium text-rose-400/80">
                {burnPercent}% of Total Supply Destroyed
            </div>
        </div>
    );
}
