'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { ADDRESSES, ABIS, getAddresses } from '@/abis/contracts';
import { getFriendlyError } from '@/utils/error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Flame, Rocket, Zap, TrendingUp, Info, ShieldCheck, Coins, Lock, Unlock, ArrowRightLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useBnbPrice } from '@/hooks/useBnbPrice';
import { useDopaPrice } from '@/hooks/useDopaPrice';
import { useBalanceGuard } from '@/components/BalanceProvider';

export default function BondingPage() {
    const { isConnected, address, chain } = useAccount();
    const { checkBalanceAndProceed } = useBalanceGuard();
    const addresses = getAddresses(chain?.id);
    const nativeSymbol = 'BNB';

    const [buyAmount, setBuyAmount] = useState('0.1');
    const [sellAmount, setSellAmount] = useState('1000000');
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const bnbPrice = useBnbPrice();
    const { priceInUsd: dopaPriceUsd } = useDopaPrice();

    // Bonding Curve State
    const { data: totalRaised, refetch: refetchTotalRaised } = useReadContract({
        address: addresses.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'totalRaisedBnb',
    });

    const { data: sellEnabled, refetch: refetchSellEnabled } = useReadContract({
        address: addresses.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'sellEnabled',
    });

    const { data: bnbReserves, refetch: refetchBnbReserves } = useReadContract({
        address: addresses.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'virtualBnbReserves',
    });

    const { data: funReserves, refetch: refetchFunReserves } = useReadContract({
        address: addresses.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'virtualFunReserves',
    });

    const { data: bnbBalance, refetch: refetchBnb } = useBalance({
        address: address,
        query: { enabled: !!address }
    });

    const { data: funBalance, refetch: refetchFunBalance } = useBalance({
        address: address,
        token: addresses.FunToken as `0x${string}`,
        query: { enabled: !!address }
    });

    // Calculate Amount Out
    const { data: estimatedTokens } = useReadContract({
        address: addresses.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'getAmountOutBuy',
        args: [buyAmount ? parseEther(buyAmount) : 0n],
        query: {
            enabled: !!buyAmount && parseFloat(buyAmount) > 0,
        }
    });

    // Amount Out Sell
    const { data: estimatedBnb } = useReadContract({
        address: addresses.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'getAmountOutSell',
        args: [sellAmount ? parseEther(sellAmount) : 0n],
        query: {
            enabled: side === 'sell' && !!sellAmount && parseFloat(sellAmount) > 0,
        }
    });

    const { data: allowance } = useReadContract({
        address: addresses.FunToken as `0x${string}`,
        abi: ABIS.FunToken,
        functionName: 'allowance',
        args: address ? [address, addresses.FunBondingCurve as `0x${string}`] : undefined,
        query: { enabled: !!address && side === 'sell' }
    });

    const { writeContract, data: hash, isPending: isWritePending, isError, error } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

    const FUNDING_GOAL = parseEther('50'); // 50 BNB
    const raisedBnb = totalRaised ? BigInt(totalRaised.toString()) : 0n;
    // Calculate progress with 2 decimal places precision
    const progress = FUNDING_GOAL > 0n ? Number(raisedBnb * 10000n / FUNDING_GOAL) / 100 : 0;

    // Calculate Price: virtualFunReserves / virtualBnbReserves (How many FUN per 1 BNB)
    const funPerBnb = (bnbReserves && funReserves && BigInt(bnbReserves.toString()) > 0n)
        ? (BigInt(funReserves.toString()) * BigInt(1e18)) / BigInt(bnbReserves.toString())
        : 0n;

    const handleBuy = () => checkBalanceAndProceed((Number(buyAmount) + 0.005).toString(), async () => {
        if (!buyAmount || parseFloat(buyAmount) <= 0) return;

        toast.loading('Purchasing $DOPA Tokens...', { id: 'bonding-toast' });
        try {
            await writeContract({
                address: addresses.FunBondingCurve as `0x${string}`,
                abi: ABIS.FunBondingCurve,
                functionName: 'buy',
                args: [0n], // minFunOut = 0 for simplicity
                value: parseEther(buyAmount),
            });
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'bonding-toast' });
        }
    });

    const handleSell = () => checkBalanceAndProceed('0.005', async () => {
        if (!sellAmount || parseFloat(sellAmount) <= 0) return;
        if (!sellEnabled) return;

        const amountToSell = parseEther(sellAmount);
        
        if (allowance !== undefined && (allowance as bigint) < amountToSell) {
            toast.loading('Approving $DOPA...', { id: 'bonding-toast' });
            try {
                await writeContract({
                    address: addresses.FunToken as `0x${string}`,
                    abi: ABIS.FunToken,
                    functionName: 'approve',
                    args: [addresses.FunBondingCurve as `0x${string}`, amountToSell],
                });
            } catch (e: any) {
                toast.error(getFriendlyError(e), { id: 'bonding-toast' });
            }
            return;
        }

        toast.loading('Selling $DOPA Tokens...', { id: 'bonding-toast' });
        try {
            await writeContract({
                address: addresses.FunBondingCurve as `0x${string}`,
                abi: ABIS.FunBondingCurve,
                functionName: 'sell',
                args: [amountToSell, 0n], // minBnbOut = 0 for simplicity
            });
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'bonding-toast' });
        }
    });

    useEffect(() => {
        if (isTxSuccess) {
            toast.success('Transaction Successful! 🚀', { id: 'bonding-toast' });
            setBuyAmount('0.1');
            refetchBnb?.();
            refetchTotalRaised?.();
            refetchFunBalance?.();
            refetchBnbReserves?.();
            refetchFunReserves?.();
            refetchSellEnabled?.();
        }
        if (isError) {
            toast.error(getFriendlyError(error), { id: 'bonding-toast' });
        }
    }, [isTxSuccess, isError, error]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-24 relative isolate overflow-x-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-2 space-y-8 lg:space-y-0 lg:space-x-12 items-start">
                {/* Left Side: Info & Progress */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3"
                    >
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            <Flame className="w-3 h-3" /> Initial Fair Launch
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase italic">
                            $DOPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Launchpad</span>
                        </h1>
                    </motion.div>

                    <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm overflow-hidden border-2 shadow-2xl">
                        <CardHeader className="bg-emerald-500/5 border-b border-zinc-800">
                            <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center space-x-2">
                                <Rocket className="w-4 h-4 text-emerald-500" /> Migration Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 md:pt-8 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <span className="text-2xl md:text-3xl font-black text-white">{progress.toFixed(2)}%</span>
                                <div className="text-right">
                                    <div className="text-zinc-500 text-xs md:sm font-mono">{formatEther(raisedBnb)} / 50.00 {nativeSymbol}</div>
                                    <div className="text-emerald-500/60 text-[10px] font-black tracking-tighter uppercase">≈ ${(Number(formatEther(raisedBnb)) * bnbPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</div>
                                </div>
                            </div>
                            <Progress value={progress} className="h-3 md:h-4" />
                            <p className="text-[10px] md:text-xs text-zinc-500 text-center italic">
                                Once the goal of 50 {nativeSymbol} is reached, internal two-way trading (Buying & Selling) will be permanently unlocked.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 md:p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Current Rate</p>
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <Zap className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                                <div className="truncate flex flex-col">
                                    <span className="text-base font-black text-white leading-none">
                                        {funPerBnb > 0n ? parseFloat(formatEther(funPerBnb)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '1,000,000'}
                                    </span>
                                    <span className="text-[8px] font-black text-emerald-500/80 uppercase mt-0.5">≈ ${dopaPriceUsd.toFixed(6)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 md:p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Status</p>
                            <p className="text-sm font-black text-white flex items-center space-x-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {sellEnabled ? 'TRADING' : 'BUY ONLY'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Buy Terminal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-zinc-950 border-emerald-900/30 border-2 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
                        <CardHeader className="p-1.5 bg-zinc-900/50 border-b border-zinc-900">
                             <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800/50">
                                <button
                                    onClick={() => setSide('buy')}
                                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${side === 'buy' ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]' : 'text-zinc-500 hover:text-emerald-400'}`}
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => setSide('sell')}
                                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-black uppercase tracking-widest transition-all relative flex items-center justify-center space-x-2 ${side === 'sell' ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-[1.02]' : 'text-zinc-500 hover:text-rose-400'}`}
                                >
                                    <span>Sell</span>
                                    {!sellEnabled && <Lock className="w-3.5 h-3.5 opacity-50" />}
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{side === 'buy' ? 'PAY' : 'SELL'}</label>
                                    <span className="text-[9px] font-bold text-zinc-500">BAL: {isConnected ? (side === 'buy' ? (bnbBalance ? `${parseFloat(bnbBalance.formatted).toFixed(3)} ${nativeSymbol}` : '...') : (funBalance ? `${parseFloat(funBalance.formatted).toLocaleString()} $DOPA` : '...')) : '---'}</span>
                                </div>
                                <div className="relative group">
                                    <Input
                                        type="number"
                                        value={side === 'buy' ? buyAmount : sellAmount}
                                        onChange={(e) => side === 'buy' ? setBuyAmount(e.target.value) : setSellAmount(e.target.value)}
                                        className="h-14 text-xl font-black bg-zinc-950 border-zinc-800 focus:border-emerald-500 transition-all pl-16 rounded-xl"
                                        placeholder="0.0"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 font-black transition-colors pointer-events-none flex flex-col items-center">
                                        <span className="text-[10px]">{side === 'buy' ? nativeSymbol : 'DOPA'}</span>
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700">
                                        {side === 'buy' 
                                            ? `≈$${(Number(buyAmount || 0) * bnbPrice).toFixed(1)}`
                                            : `≈$${(Number(sellAmount || 0) * dopaPriceUsd).toFixed(2)}`
                                        }
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {(side === 'buy' ? ['0.1', '0.5', '1.0', '5.0'] : ['1M', '10M', '50M', 'MAX']).map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => {
                                                if (side === 'buy') setBuyAmount(amt);
                                                else {
                                                    if (amt === '1M') setSellAmount('1000000');
                                                    else if (amt === '10M') setSellAmount('10000000');
                                                    else if (amt === '50M') setSellAmount('50000000');
                                                    else if (amt === 'MAX') setSellAmount(funBalance?.formatted || '0');
                                                }
                                            }}
                                            className="py-1.5 text-[9px] font-black rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all uppercase"
                                        >
                                            {amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border space-y-3 ${side === 'buy' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-zinc-500 uppercase font-black tracking-widest">{side === 'buy' ? 'RECEIVE' : 'RECEIVE BNB'}</span>
                                    <span className="text-white font-black font-mono">
                                        {side === 'buy' 
                                            ? (estimatedTokens ? parseFloat(formatEther((estimatedTokens as bigint) || 0n)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0') + ' $DOPA'
                                            : (estimatedBnb ? parseFloat(formatEther((estimatedBnb as bigint) || 0n)).toFixed(4) : '0') + ` ${nativeSymbol}`
                                        }
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-zinc-900/50">
                                    <Button
                                        variant={side === 'buy' ? "neon" : "outline"}
                                        className={`w-full h-14 text-base font-black italic tracking-tight rounded-2xl relative overflow-hidden group ${side === 'sell' && !sellEnabled && 'opacity-70 cursor-not-allowed grayscale'}`}
                                        onClick={side === 'buy' ? handleBuy : handleSell}
                                        disabled={isWritePending || isTxConfirming || !isConnected || (side === 'sell' && !sellEnabled)}
                                    >
                                        <div className="relative z-10 flex items-center justify-center space-x-3">
                                            {isWritePending || isTxConfirming ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : side === 'sell' && !sellEnabled ? (
                                                <>
                                                    <Lock className="w-4 h-4" />
                                                    <span>LOCKED</span>
                                                </>
                                            ) : !isConnected ? (
                                                'CONNECT'
                                            ) : side === 'buy' ? (
                                                'BUY $DOPA'
                                            ) : (
                                                ((allowance as bigint) !== undefined && (allowance as bigint) < parseEther(sellAmount)) ? 'APPROVE' : 'SELL'
                                            )}
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center py-4 text-[10px] text-zinc-600 font-medium">
                            <Info className="w-3 h-3 mr-1" /> {sellEnabled ? 'Two-way trading active: You can now buy or sell $DOPA.' : 'Anti-dump enabled: Selling is disabled during the funding phase.'}
                        </CardFooter>
                    </Card>

                    {/* Dopa Balance Tip */}
                    {isConnected && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 space-y-4"
                        >
                            <div className="text-center">
                                <p className="text-zinc-500 text-sm">
                                    Your balance: <span className="text-emerald-400 font-bold">{funBalance ? parseFloat(funBalance.formatted).toLocaleString() : '0'} $DOPA</span>
                                </p>
                            </div>
                            
                            <Card className="bg-amber-500/5 border-amber-500/20 border">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">Start Earning Yield</p>
                                            <p className="text-[10px] text-zinc-500">Stake your $DOPA to earn native platform dividends.</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-[10px] font-bold"
                                        onClick={() => window.location.href = '/earn'}
                                    >
                                        GO TO STAKE
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Bottom FAQ / Info */}
            <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                <div className="space-y-2 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                    <h3 className="text-white font-bold flex items-center space-x-2 text-base md:text-lg">
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Constant Buy Pressure</span>
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">Every bet placed in the DOPA Casino routes a portion of the platform rake directly into this curve, creating a continuous buy wall for holders.</p>
                </div>
                <div className="space-y-2 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                    <h3 className="text-white font-bold flex items-center space-x-2 text-base md:text-lg">
                        <Coins className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Real Yield</span>
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">Staked $DOPA tokens earn 50% of the platform's distributed fees in native {nativeSymbol}. Hold $DOPA to own a piece of the house.</p>
                </div>
                <div className="space-y-2 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                    <h3 className="text-white font-bold flex items-center space-x-2 text-base md:text-lg">
                        <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Burn Mechanism</span>
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">As the platform grows, the $DOPA supply deflates through automated fee-based buybacks and burns, increasing individual token ownership percentage over time.</p>
                </div>
            </div>
        </div>
    );
}
