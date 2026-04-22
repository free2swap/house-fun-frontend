'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useBalance, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ADDRESSES, ABIS } from '@/abis/contracts';
import { Button } from '@/components/ui/Button';
import { Coins, Pickaxe, ArrowDownToLine, Flame, TrendingUp, HandCoins, AlertCircle, Droplets, Wallet, ShieldCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useBnbPrice } from '@/hooks/useBnbPrice';
import { useDopaPrice } from '@/hooks/useDopaPrice';
import { getFriendlyError } from '@/utils/error';
import { useBalanceGuard } from '@/components/BalanceProvider';

export default function EarnPage() {
    const { address, chain } = useAccount();
    const publicClient = usePublicClient();
    const [stakeAmount, setStakeAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [glpDepositAmount, setGlpDepositAmount] = useState('');
    const [glpWithdrawAmount, setGlpWithdrawAmount] = useState('');
    const bnbPrice = useBnbPrice();
    const { priceInUsd: dopaPriceUsd } = useDopaPrice();
    const { checkBalanceAndProceed } = useBalanceGuard();

    const { data: bnbBalanceData, refetch: refetchBnb } = useBalance({
        address,
        query: { refetchInterval: 5000 }
    });

    const { data: dopaBalanceData, refetch: refetchDopa } = useBalance({
        address,
        token: ADDRESSES.DopaToken as `0x${string}`,
        query: { refetchInterval: 5000 }
    });

    // --- DOPA Staking (Real Yield) ---
    const { data: maxSupplyData } = useReadContract({
        address: ADDRESSES.DopaToken as `0x${string}`,
        abi: ABIS.DopaToken,
        functionName: 'MAX_SUPPLY',
    });

    const { data: currentSupplyData, refetch: refetchSupply } = useReadContract({
        address: ADDRESSES.DopaToken as `0x${string}`,
        abi: ABIS.DopaToken,
        functionName: 'totalSupply',
        query: { refetchInterval: 10000 }
    });

    const { data: stakedBalance, refetch: refetchMyStaked } = useReadContract({
        address: ADDRESSES.FunStaking as `0x${string}`,
        abi: ABIS.FunStaking,
        functionName: 'balances',
        args: address ? [address] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    const { data: earnedRewards, refetch: refetchRewards } = useReadContract({
        address: ADDRESSES.FunStaking as `0x${string}`,
        abi: ABIS.FunStaking,
        functionName: 'earned',
        args: address ? [address] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
        address: ADDRESSES.FunStaking as `0x${string}`,
        abi: ABIS.FunStaking,
        functionName: 'totalStaked',
        query: { refetchInterval: 10000 }
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: ADDRESSES.DopaToken as `0x${string}`,
        abi: ABIS.DopaToken,
        functionName: 'allowance',
        args: address ? [address, ADDRESSES.FunStaking as `0x${string}`] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    // --- GLP (House Liquidity) ---
    const { data: poolStats, refetch: refetchPoolStats } = useReadContract({
        address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
        abi: ABIS.GlobalLiquidityPool,
        functionName: 'getPoolStats',
        query: { refetchInterval: 10000 }
    });

    const { data: glpBalance, refetch: refetchGlpBalance } = useReadContract({
        address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
        abi: ABIS.GlobalLiquidityPool,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    const { data: rewardPerShare } = useReadContract({
        address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
        abi: ABIS.GlobalLiquidityPool,
        functionName: 'accRewardPerShare',
    });

    // --- Buyback Manager ---
    const { data: buybackBalanceData, refetch: refetchBuybackBalance } = useBalance({
        address: ADDRESSES.BuybackManager as `0x${string}`,
        query: { refetchInterval: 10000 }
    });

    const { data: callerRewardBps } = useReadContract({
        address: ADDRESSES.BuybackManager as `0x${string}`,
        abi: ABIS.BuybackManager,
        functionName: 'callerRewardBps',
    });

    const { data: lastSwapTime } = useReadContract({
        address: ADDRESSES.BuybackManager as `0x${string}`,
        abi: ABIS.BuybackManager,
        functionName: 'lastSwapTime',
        query: { refetchInterval: 10000 }
    });

    const { data: swapCooldown } = useReadContract({
        address: ADDRESSES.BuybackManager as `0x${string}`,
        abi: ABIS.BuybackManager,
        functionName: 'swapCooldown',
    });

    const { data: userRewardDebt } = useReadContract({
        address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
        abi: ABIS.GlobalLiquidityPool,
        functionName: 'rewardDebt',
        args: address ? [address] : undefined,
    });

    const { data: lastDepositTime } = useReadContract({
        address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
        abi: ABIS.GlobalLiquidityPool,
        functionName: 'lastDepositTime',
        args: address ? [address] : undefined,
    });

    const { data: withdrawCooldown } = useReadContract({
        address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
        abi: ABIS.GlobalLiquidityPool,
        functionName: 'withdrawCooldown'
    });

    const { data: virtualFun } = useReadContract({
        address: ADDRESSES.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'virtualFunReserves',
    });

    const { data: virtualBnb } = useReadContract({
        address: ADDRESSES.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'virtualBnbReserves',
    });

    // --- GLP Reward Calculation (Simulated Pending) ---
    const [simulatedPendingDopa, setSimulatedPendingDopa] = useState<string>('0.00');

    useEffect(() => {
        if (!address || !glpBalance || !rewardPerShare || !userRewardDebt) return;
        
        const calcRewards = () => {
            const balance = glpBalance as bigint;
            const rps = rewardPerShare as bigint;
            const debt = userRewardDebt as bigint;
            
            // Simplified: (balance * rps) / 1e12 - debt
            // In a real app, we'd add the accrued since updatePool
            const pending = (balance * rps) / BigInt(1e12) - debt;
            setSimulatedPendingDopa(formatEther(pending > BigInt(0) ? pending : BigInt(0)));
        };
        
        calcRewards();
        const interval = setInterval(calcRewards, 5000);
        return () => clearInterval(interval);
    }, [address, glpBalance, rewardPerShare, userRewardDebt]);

    // --- Writes ---
    const { writeContractAsync: approveAsync, isPending: isApproving } = useWriteContract();
    const { writeContractAsync: stakeAsync, isPending: isStaking } = useWriteContract();
    const { writeContractAsync: withdrawAsync, isPending: isWithdrawing } = useWriteContract();
    const { writeContractAsync: claimStakingAsync, isPending: isClaimingStaking } = useWriteContract();

    const { writeContractAsync: glpDepositAsync, isPending: isGlpDepositing } = useWriteContract();
    const { writeContractAsync: glpWithdrawAsync, isPending: isGlpWithdrawing } = useWriteContract();
    const { writeContractAsync: glpClaimAsync, isPending: isGlpClaiming } = useWriteContract();
    const { writeContractAsync: publicBuybackAsync, isPending: isBuybackPending } = useWriteContract();

    // --- Handlers ---
    const handleStakeDopa = () => checkBalanceAndProceed('0.005', async () => {
        if (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) return toast.error("Invalid amount");
        try {
            const amountInWei = parseEther(stakeAmount);
            const currentAllowance = allowance as bigint || BigInt(0);

            if (currentAllowance < amountInWei) {
                toast.loading("Approving $DOPA...", { id: 'stake-toast' });
                const approveHash = await approveAsync({
                    address: ADDRESSES.DopaToken as `0x${string}`,
                    abi: ABIS.DopaToken,
                    functionName: 'approve',
                    args: [ADDRESSES.FunStaking as `0x${string}`, amountInWei],
                });
                toast.loading("Waiting for approval confirmation...", { id: 'stake-toast' });
                await publicClient!.waitForTransactionReceipt({ hash: approveHash });
            }

            toast.loading("Staking $DOPA...", { id: 'stake-toast' });
            await stakeAsync({
                address: ADDRESSES.FunStaking as `0x${string}`,
                abi: ABIS.FunStaking,
                functionName: 'stake',
                args: [amountInWei]
            });
            toast.success("Successfully staked $DOPA!", { id: 'stake-toast' });
            setStakeAmount('');
            refetchDopa?.(); refetchMyStaked?.(); refetchTotalStaked?.(); refetchAllowance?.();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'stake-toast' });
        }
    });

    const handleWithdrawDopa = () => checkBalanceAndProceed('0.005', async () => {
        if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) return toast.error("Invalid amount");
        try {
            toast.loading("Unstaking $DOPA...", { id: 'withdraw-toast' });
            const amountInWei = parseEther(withdrawAmount);
            await withdrawAsync({
                address: ADDRESSES.FunStaking as `0x${string}`,
                abi: ABIS.FunStaking,
                functionName: 'withdraw',
                args: [amountInWei]
            });
            toast.success("Successfully unstaked!", { id: 'withdraw-toast' });
            setWithdrawAmount('');
            refetchDopa?.(); refetchMyStaked?.(); refetchTotalStaked?.();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'withdraw-toast' });
        }
    });

    const handleClaimDividends = () => checkBalanceAndProceed('0.005', async () => {
        try {
            toast.loading("Claiming BNB Dividends...", { id: 'claim-toast' });
            await claimStakingAsync({
                address: ADDRESSES.FunStaking as `0x${string}`,
                abi: ABIS.FunStaking,
                functionName: 'getReward',
            });
            toast.success("Dividends Claimed! 💰", { id: 'claim-toast' });
            refetchBnb?.(); refetchRewards?.();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'claim-toast' });
        }
    });

    const handleGlpDeposit = () => checkBalanceAndProceed('0.005', async () => {
        if (!glpDepositAmount || isNaN(Number(glpDepositAmount)) || Number(glpDepositAmount) <= 0) return toast.error("Invalid amount");
        try {
            toast.loading("Depositing BNB to LP...", { id: 'glp-deposit' });
            const amountInWei = parseEther(glpDepositAmount);
            await glpDepositAsync({
                address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
                abi: ABIS.GlobalLiquidityPool,
                functionName: 'deposit',
                value: amountInWei
            });
            toast.success("Deposit Successful! You are now a House LP.", { id: 'glp-deposit' });
            setGlpDepositAmount('');
            refetchBnb(); refetchPoolStats(); refetchGlpBalance();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'glp-deposit' });
        }
    });

    const handleGlpWithdraw = () => checkBalanceAndProceed('0.005', async () => {
        if (!glpWithdrawAmount || isNaN(Number(glpWithdrawAmount)) || Number(glpWithdrawAmount) <= 0) return toast.error("Invalid amount");
        try {
            toast.loading("Withdrawing from LP...", { id: 'glp-withdraw' });
            const amountInWei = parseEther(glpWithdrawAmount);
            await glpWithdrawAsync({
                address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
                abi: ABIS.GlobalLiquidityPool,
                functionName: 'withdraw',
                args: [amountInWei]
            });
            toast.success("Withdrawal Complete!", { id: 'glp-withdraw' });
            setGlpWithdrawAmount('');
            refetchBnb(); refetchPoolStats(); refetchGlpBalance();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'glp-withdraw' });
        }
    });

    const handleGlpClaim = () => checkBalanceAndProceed('0.003', async () => {
        try {
            toast.loading("Claiming DOPA Rewards...", { id: 'glp-claim' });
            await glpClaimAsync({
                address: ADDRESSES.GlobalLiquidityPool as `0x${string}`,
                abi: ABIS.GlobalLiquidityPool,
                functionName: 'claimRewards',
            });
            toast.success("DOPA Rewards Claimed! ⛏️", { id: 'glp-claim' });
            refetchDopa();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'glp-claim' });
        }
    });

    const handlePublicBuyback = () => checkBalanceAndProceed('0.005', async () => {
        try {
            toast.loading('Triggering Buyback...', { id: 'buyback' });
            await publicBuybackAsync({
                address: ADDRESSES.BuybackManager as `0x${string}`,
                abi: ABIS.BuybackManager,
                functionName: 'publicBuyback',
            });
            toast.success('Buyback Successful! 🚀', { id: 'buyback' });
            refetchBuybackBalance();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'buyback-toast' });
        }
    });

    // --- Formatters ---
    const bnbBal = bnbBalanceData ? Number(formatEther(bnbBalanceData.value)).toFixed(4) : '0.0000';
    const dopaBal = dopaBalanceData ? Number(formatEther(dopaBalanceData.value)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00';
    const myStaked = stakedBalance ? Number(formatEther(stakedBalance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00';
    const pendingBnbRewards = earnedRewards ? Number(formatEther(earnedRewards as bigint)).toFixed(6) : '0.000000';
    const stakingTvl = totalStaked ? Number(formatEther(totalStaked as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';
    
    // APR Precision Calculation
    const glpTvlRaw = poolStats ? (poolStats as any)[0] as bigint : BigInt(0);
    const glpRewardRateRaw = poolStats ? (poolStats as any)[2] as bigint : BigInt(0);
    const vFunRaw = virtualFun as bigint || BigInt(1e18);
    const vBnbRaw = virtualBnb as bigint || BigInt(0);

    const annualDopaRaw = glpRewardRateRaw * BigInt(31536000);
    const annualDopaValueInBnbRaw = vFunRaw > 0 ? (annualDopaRaw * vBnbRaw) / vFunRaw : BigInt(0);
    
    // APR = (AnnualValueInBnb * 100) / TvlInBnb
    // Precision: Multiply by 10000n for 2 extra decimal places, then divide by 100
    const dopaAPR = (glpTvlRaw > 0n && vFunRaw > 0n)
        ? Number((annualDopaRaw * vBnbRaw * 10000n) / (vFunRaw * glpTvlRaw)) / 100
        : 0;

    const glpTvl = poolStats ? Number(formatEther(glpTvlRaw)).toFixed(2) : '0.00';
    const glpTvlUsd = (Number(glpTvl) * bnbPrice).toLocaleString(undefined, { maximumFractionDigits: 2 });
    
    const dailyDopa = Number(formatEther(glpRewardRateRaw * BigInt(86400)));
    const glpSharesRaw = poolStats ? (poolStats as any)[1] as bigint : BigInt(0);
    const lpShare = (glpBalance && glpSharesRaw > BigInt(0)) 
        ? (Number(glpBalance as bigint) / Number(glpSharesRaw) * 100).toFixed(4) 
        : '0.0000';

    const totalBurnedValue = (maxSupplyData && currentSupplyData)
        ? (maxSupplyData as bigint) - (currentSupplyData as bigint)
        : BigInt(0);
    const totalBurned = Number(formatEther(totalBurnedValue)).toLocaleString(undefined, { maximumFractionDigits: 0 });

    const cooldownRemaining = (lastDepositTime && withdrawCooldown) 
        ? Math.max(0, Number(lastDepositTime) + Number(withdrawCooldown) - Math.floor(Date.now() / 1000))
        : 0;

    const buybackBps = callerRewardBps ? Number(callerRewardBps) / 100 : 1;
    const buybackPoolBnb = buybackBalanceData ? Number(formatEther(buybackBalanceData.value)).toFixed(4) : '0.0000';
    const nextBuybackTime = (lastSwapTime && swapCooldown) ? Number(lastSwapTime) + Number(swapCooldown) : 0;
    const canTriggerBuyback = Math.floor(Date.now() / 1000) >= nextBuybackTime;

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Header */}
                <div className="text-center mb-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 tracking-tighter mb-4 italic drop-shadow-2xl">
                            LIQUIDITY HUB
                        </h1>
                        <p className="text-zinc-500 font-bold tracking-[0.3em] uppercase text-xs md:text-sm">Institutional Yield & GMX-Style Terminal</p>
                    </motion.div>
                </div>

                {/* Top Stats - Lux Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/60 border border-emerald-500/20 rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group shadow-[0_0_100px_rgba(16,185,129,0.03)]"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px]" />
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-4">
                                <Droplets className="w-4 h-4" />
                                <span>Global TVL</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline space-x-3">
                                    <span className="text-6xl md:text-7xl font-black text-white tracking-tighter tabular-nums italic">
                                        {glpTvl}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-zinc-600 italic leading-none">BNB</span>
                                        <span className="text-xs font-black text-emerald-500/80 mt-1">≈ ${glpTvlUsd}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-zinc-500 mt-4 font-medium">Fully collateralized protocol liquidity reservoir</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/60 border border-amber-500/20 rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group shadow-[0_0_100px_rgba(245,158,11,0.03)]"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px]" />
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 text-amber-400 font-black text-xs uppercase tracking-[0.3em] mb-4">
                                <TrendingUp className="w-4 h-4" />
                                <span>Estimated APY</span>
                            </div>
                             <div className="flex flex-col items-end">
                                <div className="flex items-baseline space-x-2">
                                    <span className={`${dopaAPR > 9999 ? 'text-4xl' : 'text-6xl md:text-7xl'} font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 italic py-3`}>
                                        {dopaAPR > 99999.9 ? '99,999.9' : dopaAPR.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                    </span>
                                    <span className={`${dopaAPR > 99999.9 ? 'text-2xl' : 'text-4xl'} font-black text-amber-500 italic`}>
                                        {dopaAPR > 99999.9 ? '%+' : '%'}
                                    </span>
                                </div>
                                {dopaAPR > 99999.9 && <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest -mt-1">Max Display Cap</span>}
                            </div>
                            <p className="text-zinc-500 mt-4 font-medium">$DOPA rewards + 50% Platform net volume share</p>
                            <div className="mt-2 text-[10px] text-zinc-600 font-bold uppercase tracking-wider flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Based on 1 DOPA ≈ {(Number(vBnbRaw) / Number(vFunRaw)).toFixed(8)} BNB</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    
                    {/* --- LEFT: HOUSE LIQUIDITY (GLP) --- */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/40 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden group transition-all duration-500 hover:border-indigo-500/60 shadow-[0_0_80px_rgba(79,70,229,0.05)]">
                           <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700" />
                           
                           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 relative z-10 gap-6">
                                <div>
                                    <div className="flex items-center space-x-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2 bg-indigo-500/10 w-fit px-3 py-1 rounded-full border border-indigo-500/20">
                                        <Droplets className="w-3.5 h-3.5" />
                                        <span>GMX Style Liquidity</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">Global Pool <span className="text-indigo-500">(GLP)</span></h2>
                                    <p className="text-zinc-500 text-xs mt-2 font-medium">Earn house edge yield in $DOPA + platform fees</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 rounded-2xl w-fit sm:ml-auto">
                                        <div className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Current APY</div>
                                        <div className="text-3xl font-mono font-black text-white">{dopaAPR.toFixed(1)}%<span className="text-indigo-400 text-sm ml-0.5">+</span></div>
                                    </div>
                                </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-800/50 group-hover:border-indigo-500/20 transition-all">
                                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center space-x-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>Total TVL</span>
                                    </div>
                                    <div className="text-2xl font-mono font-black text-white">{glpTvl} <span className="text-zinc-600 text-sm font-bold">BNB</span></div>
                                </div>
                                <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-800/50 group-hover:border-indigo-500/20 transition-all">
                                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center space-x-1">
                                        <Pickaxe className="w-3 h-3" />
                                        <span>Daily Rewards</span>
                                    </div>
                                    <div className="text-2xl font-mono font-black text-white">{dailyDopa.toFixed(0)} <span className="text-zinc-600 text-sm font-bold">DOPA</span></div>
                                </div>
                           </div>

                           {/* GLP Interaction */}
                           {!address ? (
                               <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-950/30">
                                   <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Unlock liquidity terminal</p>
                                   <Button className="mt-4 bg-white text-black font-black px-8">CONNECT WALLET</Button>
                               </div>
                           ) : (
                               <div className="space-y-6 relative z-10">
                                   <div className="bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl p-6 border border-indigo-500/20 shadow-inner">
                                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex flex-col items-end sm:items-start">
                                                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Unclaimed Mining Rewards</div>
                                                <div className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">
                                                    {Number(simulatedPendingDopa).toFixed(4)} <span className="text-indigo-400 text-sm">DOPA</span>
                                                </div>
                                                <div className="text-[10px] text-indigo-400/60 font-black mt-1 uppercase tracking-tighter">
                                                    ≈ ${(Number(simulatedPendingDopa) * dopaPriceUsd).toFixed(2)} USD
                                                </div>
                                            </div>
                                            <Button 
                                                size="lg"
                                                onClick={handleGlpClaim}
                                                disabled={isGlpClaiming || Number(simulatedPendingDopa) <= 0}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-[0_0_30px_rgba(79,70,229,0.3)] px-6 py-6 w-full sm:w-auto"
                                            >
                                                COLLECT
                                            </Button>
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-1 gap-4">
                                       <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 focus-within:border-indigo-500/50 transition-all">
                                           <div className="flex justify-between text-[10px] font-black mb-3 px-1 uppercase tracking-widest">
                                                <span className="text-zinc-500">Add Liquidity (BNB)</span>
                                                <span className="text-indigo-400/60 italic">Balance: {bnbBal}</span>
                                           </div>
                                           <div className="flex flex-col space-y-4">
                                                <div className="relative w-full">
                                                    <Input
                                                        type="number"
                                                        placeholder="Deposit BNB"
                                                        value={glpDepositAmount}
                                                        onChange={(e) => setGlpDepositAmount(e.target.value)}
                                                        className="bg-zinc-950 border-zinc-800 text-white h-14 pr-20 text-lg font-mono"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">BNB</span>
                                                        <span className="text-[9px] font-black text-emerald-500/40 leading-none">≈ ${(Number(glpDepositAmount || 0) * bnbPrice).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex space-x-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-900 w-fit">
                                                        {[25, 50, 75, 100].map(pct => (
                                                            <button 
                                                                key={pct}
                                                                onClick={() => setGlpDepositAmount((Number(bnbBal) * pct / 100).toFixed(4))}
                                                                className="text-[10px] font-black text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/5 px-3 py-1.5 rounded-lg transition-all uppercase"
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Button 
                                                        onClick={handleGlpDeposit}
                                                        disabled={isGlpDepositing}
                                                        className="bg-white text-black hover:bg-zinc-200 font-black px-10 h-12 shadow-xl w-full sm:w-auto"
                                                    >
                                                        DEPOSIT
                                                    </Button>
                                                </div>
                                            </div>
                                       </div>

                                       <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 focus-within:border-indigo-500/50 transition-all">
                                           <div className="flex justify-between text-[10px] font-black mb-3 px-1 uppercase tracking-widest">
                                                <span className="text-zinc-500">Exit Liquidity (gBNB)</span>
                                                <span className="text-indigo-400/60 italic">Your Share: {Number(glpBalance ? formatEther(glpBalance as bigint) : 0).toFixed(4)}</span>
                                           </div>
                                           <div className="flex flex-col space-y-4">
                                                <div className="relative w-full">
                                                    <Input 
                                                        type="number" 
                                                        placeholder="0.00"
                                                        value={glpWithdrawAmount}
                                                        onChange={(e) => setGlpWithdrawAmount(e.target.value)}
                                                        className="bg-zinc-950 border-zinc-800 text-white h-14 pr-20 text-lg font-mono"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">gBNB</span>
                                                        <span className="text-[9px] font-black text-indigo-500/40 leading-none">LP Shares</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex space-x-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-900 w-fit">
                                                        {[25, 50, 75, 100].map(pct => (
                                                            <button 
                                                                key={pct}
                                                                onClick={() => setGlpWithdrawAmount((Number(formatEther(glpBalance as bigint || 0n)) * pct / 100).toFixed(4))}
                                                                className="text-[10px] font-black text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/5 px-3 py-1.5 rounded-lg transition-all uppercase"
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Button 
                                                        variant="outline"
                                                        onClick={handleGlpWithdraw}
                                                        disabled={isGlpWithdrawing || cooldownRemaining > 0}
                                                        className="border-zinc-800 text-zinc-400 font-black px-10 h-12 hover:bg-zinc-800 transition-colors w-full sm:w-auto"
                                                    >
                                                        {cooldownRemaining > 0 ? `LOCKED (${Math.ceil(cooldownRemaining/3600)}h)` : 'WITHDRAW'}
                                                    </Button>
                                                </div>
                                            </div>
                                       </div>
                                   </div>
                               </div>
                           )}
                           
                           <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest relative z-10">
                               <div className="flex items-center space-x-2">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500 opacity-60" />
                                    <span>Oracle Verified Reserving</span>
                               </div>
                               <div className="text-indigo-400/60">
                                   Share: {lpShare}%
                               </div>
                           </div>
                        </div>
                    </div>

                    {/* --- RIGHT: REAL YIELD (DOPA STAKING) --- */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/40 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden group transition-all duration-500 hover:border-amber-500/60 shadow-[0_0_80px_rgba(245,158,11,0.05)]">
                           <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-all duration-700" />

                           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 relative z-10 gap-6">
                                <div>
                                    <div className="flex items-center space-x-2 text-amber-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2 bg-amber-500/10 w-fit px-3 py-1 rounded-full border border-amber-500/20">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>Deflationary Yield</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">$DOPA <span className="text-amber-500">Staking</span></h2>
                                    <p className="text-zinc-500 text-xs mt-2 font-medium">Earn protocol revenue dividends in BNB</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-2xl w-fit sm:ml-auto">
                                        <div className="text-amber-300 text-[10px] font-black uppercase tracking-widest mb-1">Fee Share</div>
                                        <div className="text-3xl font-mono font-black text-white">50%<span className="text-amber-400 text-sm ml-0.5">NET</span></div>
                                    </div>
                                </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-800/50 group-hover:border-amber-500/20 transition-all">
                                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center space-x-1">
                                        <Flame className="w-3 h-3 text-rose-500" />
                                        <span>Total Burned</span>
                                    </div>
                                    <div className="text-2xl font-mono font-black text-rose-500">{totalBurned}</div>
                                </div>
                                <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-800/50 group-hover:border-amber-500/20 transition-all">
                                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center space-x-1">
                                        <Coins className="w-3 h-3 text-amber-500" />
                                        <span>Global Staked</span>
                                    </div>
                                    <div className="text-2xl font-mono font-black text-white">{stakingTvl}</div>
                                </div>
                           </div>

                           {!address ? (
                               <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-950/30">
                                   <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Unlock Staking terminal</p>
                                   <Button className="mt-4 bg-white text-black font-black px-8">CONNECT WALLET</Button>
                               </div>
                           ) : (
                               <div className="space-y-6 relative z-10">
                                   <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl p-6 border border-amber-500/20 shadow-inner">
                                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex flex-col items-end sm:items-start">
                                                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Claimable BNB Dividends</div>
                                                <div className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                                                    {pendingBnbRewards} <span className="text-amber-400 text-sm">BNB</span>
                                                </div>
                                            </div>
                                            <Button 
                                                size="lg"
                                                onClick={handleClaimDividends}
                                                disabled={isClaimingStaking || Number(pendingBnbRewards) <= 0}
                                                className="bg-amber-600 hover:bg-amber-500 text-white font-black shadow-[0_0_30px_rgba(245,158,11,0.3)] px-6 py-6 w-full sm:w-auto"
                                            >
                                                COLLECT
                                            </Button>
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-1 gap-4">
                                       <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 focus-within:border-amber-500/50 transition-all">
                                           <div className="flex justify-between text-[10px] font-black mb-3 px-1 uppercase tracking-widest">
                                                <span className="text-zinc-500">Stake Tokens (DOPA)</span>
                                                <span className="text-amber-400/60 italic">Balance: {dopaBal}</span>
                                           </div>
                                           <div className="flex flex-col space-y-4">
                                                <div className="relative w-full">
                                                    <Input
                                                        type="number"
                                                        placeholder="Amount to stake"
                                                        value={stakeAmount}
                                                        onChange={(e) => setStakeAmount(e.target.value)}
                                                        className="bg-zinc-950 border-zinc-800 text-white h-14 pr-20 text-lg font-mono"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">DOPA</span>
                                                        <span className="text-[9px] font-black text-emerald-500/40 leading-none">≈ ${(Number(stakeAmount || 0) * dopaPriceUsd).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex space-x-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-900 w-fit">
                                                        {[25, 50, 75, 100].map(pct => (
                                                            <button 
                                                                key={pct}
                                                                onClick={() => setStakeAmount((Number(formatEther(dopaBalanceData?.value || 0n)) * pct / 100).toFixed(0))}
                                                                className="text-[10px] font-black text-zinc-500 hover:text-amber-400 hover:bg-amber-500/5 px-3 py-1.5 rounded-lg transition-all uppercase"
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Button 
                                                        onClick={handleStakeDopa}
                                                        disabled={isStaking || isApproving}
                                                        className="bg-white text-black hover:bg-zinc-200 font-black px-10 h-12 shadow-xl w-full sm:w-auto"
                                                    >
                                                        STAKE
                                                    </Button>
                                                </div>
                                            </div>
                                       </div>

                                       <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 focus-within:border-amber-500/50 transition-all">
                                           <div className="flex justify-between text-[10px] font-black mb-3 px-1 uppercase tracking-widest">
                                                <span className="text-zinc-500">Unstake Tokens (DOPA)</span>
                                                <span className="text-amber-400/60 italic">Your Staked: {myStaked}</span>
                                           </div>
                                           <div className="flex flex-col space-y-4">
                                                <div className="relative w-full">
                                                    <Input 
                                                        type="number" 
                                                        placeholder="0.00"
                                                        value={withdrawAmount}
                                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                                        className="bg-zinc-950 border-zinc-800 text-white h-14 pr-20 text-lg font-mono"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">sDOPA</span>
                                                        <span className="text-[9px] font-black text-amber-500/40 leading-none">Staked Balance</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex space-x-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-900 w-fit">
                                                        {[25, 50, 75, 100].map(pct => (
                                                            <button 
                                                                key={pct}
                                                                onClick={() => setWithdrawAmount((Number(formatEther(stakedBalance as bigint || 0n)) * pct / 100).toFixed(0))}
                                                                className="text-[10px] font-black text-zinc-500 hover:text-amber-400 hover:bg-amber-500/5 px-3 py-1.5 rounded-lg transition-all uppercase"
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Button 
                                                        variant="outline"
                                                        onClick={handleWithdrawDopa}
                                                        disabled={isWithdrawing}
                                                        className="border-zinc-800 text-zinc-400 font-black px-10 h-12 hover:bg-zinc-800 transition-colors w-full sm:w-auto"
                                                    >
                                                        UNSTAKE
                                                    </Button>
                                                </div>
                                            </div>
                                       </div>
                                   </div>
                               </div>
                           )}

                           <div className="mt-8 flex items-center space-x-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest relative z-10">
                               <Clock className="w-4 h-4 text-amber-500 opacity-60" />
                               <span>Rewards are accrued continuously and can be claimed anytime.</span>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Deflation Engine Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-20 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-amber-500/10 blur-[100px] pointer-events-none" />
                    <Card className="bg-zinc-950/80 border-rose-500/30 border-2 overflow-hidden relative z-10 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
                        <div className="md:flex">
                            <div className="md:w-1/3 bg-rose-500/5 p-8 border-r border-rose-500/20 flex flex-col justify-center items-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-rose-500/20 flex items-center justify-center mb-6 border border-rose-500/30">
                                    <Flame className="w-10 h-10 text-rose-500 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase italic">Deflation Engine</h3>
                                <p className="text-zinc-500 text-xs font-bold leading-relaxed uppercase tracking-widest max-w-[200px]">
                                    Passive buyback mechanism powered by House fees & Volume.
                                </p>
                            </div>
                            <div className="md:w-2/3 p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors flex flex-col items-end">
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center w-full justify-start">
                                            <Wallet className="w-3 h-3 mr-2 text-rose-500" /> Pending Buyback
                                        </p>
                                        <h4 className="text-3xl font-black text-white italic tracking-tight">{buybackPoolBnb} <span className="text-sm font-bold text-zinc-600 not-italic">BNB</span></h4>
                                        <p className="text-[10px] text-rose-500/60 font-black mt-2 uppercase tracking-tighter">≈ ${(Number(buybackPoolBnb) * bnbPrice).toFixed(2)} USD Ready for Burn</p>
                                    </div>
                                    <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors flex flex-col items-end">
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center w-full justify-start">
                                            <TrendingUp className="w-3 h-3 mr-2 text-emerald-500" /> Bounty Reward
                                        </p>
                                        <h4 className="text-3xl font-black text-white italic tracking-tight">{buybackBps}% <span className="text-sm font-bold text-zinc-600 not-italic">BONUS</span></h4>
                                        <p className="text-[10px] text-emerald-500/60 font-black mt-2 uppercase tracking-tighter">Earn ≈ ${(Number(buybackPoolBnb) * bnbPrice * (buybackBps/100)).toFixed(2)} for triggering</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl">
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="text-xs font-black text-white mb-1 tracking-widest uppercase">Community Trigger</div>
                                        <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tight">
                                            Help deflate $DOPA supply. Click the button to use the protocol's BNB reserves to buy back and burn $DOPA. You receive a bounty for the gas!
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handlePublicBuyback}
                                        disabled={!canTriggerBuyback || isBuybackPending}
                                        className={`h-16 px-8 rounded-2xl text-base font-black uppercase tracking-widest transition-all ${canTriggerBuyback ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-800 border'}`}
                                    >
                                        {canTriggerBuyback ? (
                                            <span className="flex items-center space-x-2">
                                                <Flame className="w-5 h-5 fill-white" />
                                                <span>EXECUTE BURN</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center space-x-2 opacity-50">
                                                <Clock className="w-5 h-5" />
                                                <span>COOLDOWN</span>
                                            </span>
                                        )}
                                    </Button>
                                </div>
                                {nextBuybackTime > 0 && !canTriggerBuyback && (
                                    <div className="mt-4 text-center">
                                        <span className="text-[10px] text-rose-500/60 font-black uppercase tracking-widest">
                                            Engine Cooling Down: Available in {Math.round((nextBuybackTime - Math.floor(Date.now() / 1000)) / 60)} minutes
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Bottom Stats Banner */}
                <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-wrap items-center justify-around text-center">
                    <div className="px-4 py-2">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Protocol Revenue</div>
                        <div className="text-xl font-mono font-black text-emerald-400">UPDATING...</div>
                    </div>
                    <div className="px-4 py-2 border-l border-white/10">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Aggregated TVL</div>
                        <div className="text-xl font-mono font-black text-white">{(Number(glpTvl) + Number(stakingTvl)/1000000).toFixed(2)} BNB+</div>
                    </div>
                    <div className="px-4 py-2 border-l border-white/10">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active Miners</div>
                        <div className="text-xl font-mono font-black text-indigo-400">LIVE</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
