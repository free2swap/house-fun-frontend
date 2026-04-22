'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, ExternalLink, Info, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useBalance, usePublicClient } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getAddresses, ABIS } from '@/abis/contracts';
import { getFriendlyError } from '@/utils/error';
import toast from 'react-hot-toast';

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SwapModal({ isOpen, onClose }: SwapModalProps) {
    const { address, chain } = useAccount();
    const addresses = getAddresses(chain?.id);
    const publicClient = usePublicClient();
    const [amountIn, setAmountIn] = useState('');
    const [estimatedOut, setEstimatedOut] = useState('0.00');
    const [isRefreshing] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false); // USDT -> BNB or BNB -> USDT

    const ROUTER_ADDR = addresses.PancakeRouter as Address;
    const USDT_ADDR = addresses.USDT as Address;
    const WBNB_ADDR = addresses.WBNB as Address;

    const path = isSwapped ? [WBNB_ADDR, USDT_ADDR] : [USDT_ADDR, WBNB_ADDR];

    // --- Data Fetching ---
    const { data: bnbBalance } = useBalance({ address });
    const { data: usdtBalanceData, refetch: refetchUsdtBalance } = useReadContract({
        address: USDT_ADDR,
        abi: ABIS.DopaToken, 
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address, refetchInterval: 10000 }
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDT_ADDR,
        abi: ABIS.DopaToken, 
        functionName: 'allowance',
        args: address ? [address, ROUTER_ADDR] : undefined,
        query: { enabled: !!address, refetchInterval: 10000 }
    });

    const { data: amountsOut } = useReadContract({
        address: ROUTER_ADDR,
        abi: ABIS.PancakeRouter,
        functionName: 'getAmountsOut',
        args: amountIn && !isNaN(Number(amountIn)) && Number(amountIn) > 0 
            ? [parseEther(amountIn), path] 
            : undefined,
        query: { enabled: !!amountIn && Number(amountIn) > 0 }
    });

    useEffect(() => {
        if (amountsOut && (amountsOut as any).length > 1) {
            setEstimatedOut(formatEther((amountsOut as any)[1]));
        } else {
            setEstimatedOut('0.00');
        }
    }, [amountsOut]);

    // --- Writes ---
    const { writeContractAsync: approveAsync, isPending: isApproving } = useWriteContract();
    const { writeContractAsync: swapAsync, isPending: isSwapping } = useWriteContract();

    // --- Handlers ---
    const handleSwap = async () => {
        if (!amountIn || Number(amountIn) <= 0) return toast.error("Enter an amount");
        if (!address) return toast.error("Wallet not connected");

        const valIn = parseEther(amountIn);
        const currentUsdtBal = (usdtBalanceData as bigint) || 0n;
        const currentAllowance = (allowance as bigint) || 0n;

        if (!isSwapped && valIn > currentUsdtBal) return toast.error("Insufficient USDT balance");
        if (isSwapped && bnbBalance && valIn > bnbBalance.value) return toast.error("Insufficient BNB balance");

        const tid = toast.loading("Processing swap sequence...", { id: 'swap-op' });

        try {
            // 1. Approve if needed (only for USDT -> BNB)
            if (!isSwapped && currentAllowance < valIn) {
                toast.loading("Approving USDT...", { id: 'swap-op' });
                const tx = await approveAsync({
                    address: USDT_ADDR,
                    abi: ABIS.DopaToken,
                    functionName: 'approve',
                    args: [ROUTER_ADDR, valIn * 100n], // Infinite-ish approval
                });
                await publicClient!.waitForTransactionReceipt({ hash: tx });
                refetchAllowance();
            }

            // 2. Swap
            toast.loading(isSwapped ? "Swapping BNB for USDT..." : "Swapping USDT for BNB...", { id: 'swap-op' });
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 600); // 10 mins
            const amountOutMin = (amountsOut as any)[1] * 95n / 100n; // 5% slippage

            let swapTx;
            if (isSwapped) {
                // BNB -> USDT
                swapTx = await swapAsync({
                    address: ROUTER_ADDR,
                    abi: ABIS.PancakeRouter,
                    functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
                    args: [amountOutMin, path, address, deadline],
                    value: valIn,
                } as any);
            } else {
                // USDT -> BNB
                swapTx = await swapAsync({
                    address: ROUTER_ADDR,
                    abi: ABIS.PancakeRouter,
                    functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
                    args: [valIn, amountOutMin, path, address, deadline],
                } as any);
            }

            toast.loading("Waiting for blockchain confirmation...", { id: 'swap-op' });
            await publicClient!.waitForTransactionReceipt({ hash: swapTx });
            
            toast.success("Swap Successful! 🚀", { id: 'swap-op' });
            setAmountIn('');
            refetchUsdtBalance();
        } catch (e) {
            toast.error(getFriendlyError(e), { id: 'swap-op' });
        }
    };

    const usdtBalance = usdtBalanceData ? Number(formatEther(usdtBalanceData as bigint)).toFixed(2) : '0.00';
    const explorerUrl = chain?.blockExplorers?.default.url || 'https://bscscan.com';
    const bscscanUrl = `${explorerUrl}/address/${ROUTER_ADDR}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                    />

                    {/* Modal Container - Premium Drawer Feel */}
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col max-h-[92vh] mt-auto sm:mt-0"
                    >
                        {/* Pull Handle for Mobile */}
                        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mt-3 mb-1 sm:hidden opacity-50" />
                        {/* Header - Premium Gradient */}
                        <div className="p-6 border-b border-white/5 bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-indigo-500/10 relative flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                        <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">Instant Swap</h3>
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">DEX Optimized Routing</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose} 
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 transition-all border border-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Body Content */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 custom-scrollbar">
                            {/* Input Card */}
                            <div className="bg-zinc-900/60 p-5 sm:p-6 rounded-[1.8rem] border border-zinc-800/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">You Sell</span>
                                    <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800 shadow-inner">
                                        {isSwapped ? (
                                            <>
                                                <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-black text-black">B</div>
                                                <span className="text-xs font-black text-white tracking-tight">BNB</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">$</div>
                                                <span className="text-xs font-black text-white tracking-tight">USDT</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Input 
                                        type="number"
                                        value={amountIn}
                                        onChange={(e) => setAmountIn(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-transparent border-none p-0 text-2xl sm:text-3xl font-black focus:ring-0 text-white placeholder-zinc-800 h-10 w-full"
                                    />
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <span className="text-[10px] text-zinc-600 font-bold uppercase">Balance</span>
                                        <span className="text-[10px] font-mono text-emerald-400/80 font-bold">
                                            {isSwapped ? (bnbBalance ? Number(bnbBalance.formatted).toFixed(4) : '0.00') : usdtBalance}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {[25, 50, 100].map(pct => (
                                        <button 
                                            key={pct}
                                            onClick={() => {
                                                const bal = isSwapped ? Number(bnbBalance?.formatted || 0) : Number(usdtBalance);
                                                setAmountIn((bal * pct / 100).toFixed(pct === 100 ? 6 : 2));
                                            }}
                                            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800/60 rounded-xl text-[10px] font-black text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all active:scale-95"
                                        >
                                            {pct === 100 ? 'MAX' : `${pct}%`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Swap Switcher */}
                            <div className="flex justify-center -my-8 relative z-10">
                                <button 
                                    onClick={() => {
                                        setIsSwapped(!isSwapped);
                                        setAmountIn('');
                                        setEstimatedOut('0.00');
                                    }}
                                    className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 shadow-2xl group active:scale-90 transition-transform"
                                >
                                    <RefreshCw className={`w-5 h-5 text-emerald-500 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''} group-hover:rotate-180`} />
                                </button>
                            </div>

                            {/* Output Card */}
                            <div className="bg-zinc-900/60 p-5 sm:p-6 rounded-[1.8rem] border border-zinc-800/50 pt-9 sm:pt-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">You Receive</span>
                                    <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800 shadow-inner">
                                        {!isSwapped ? (
                                            <>
                                                <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-black text-black">B</div>
                                                <span className="text-xs font-black text-white tracking-tight">BNB</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">$</div>
                                                <span className="text-xs font-black text-white tracking-tight">USDT</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between overflow-hidden">
                                    <span className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter tabular-nums truncate mr-4">
                                        {Number(estimatedOut).toFixed(6)}
                                    </span>
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <span className="text-[10px] text-zinc-600 font-bold uppercase">Estimated</span>
                                        <span className="text-[10px] text-zinc-700 font-mono">Market Rate</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions - Inside Scroll for Safety */}
                            <div className="space-y-4 pt-4 pb-2">
                                <Button
                                    onClick={handleSwap}
                                    disabled={isSwapping || isApproving || !amountIn || Number(amountIn) <= 0}
                                    className="w-full h-14 sm:h-16 text-lg font-black italic tracking-tight bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.2)] rounded-2xl transition-all active:scale-95"
                                >
                                    {isSwapping ? 'SWAPPING...' : isApproving ? 'APPROVING...' : 'CONFIRM SWAP'}
                                </Button>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
                                    <div className="flex items-center space-x-1.5 text-zinc-600">
                                        <Info className="w-3 h-3" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Slippage: 5.0% Max</span>
                                    </div>
                                    <a 
                                        href={bscscanUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 text-[9px] font-black text-zinc-600 hover:text-emerald-400 uppercase tracking-widest group"
                                    >
                                        <span>On-Chain Verified</span>
                                        <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Safety Lock - Fixed at Bottom */}
                        <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 flex items-center justify-center space-x-2 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/40" />
                            <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">Institutional Grade Security</span>
                        </div>

                        <style jsx>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 4px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: rgba(16, 185, 129, 0.1);
                                border-radius: 10px;
                            }
                        `}</style>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
