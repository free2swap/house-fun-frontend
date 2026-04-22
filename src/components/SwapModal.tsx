'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, ExternalLink, Info, Wallet, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false); // USDT -> BNB or BNB -> USDT

    const ROUTER_ADDR = addresses.PancakeRouter as Address;
    const USDT_ADDR = addresses.USDT as Address;
    const WBNB_ADDR = addresses.WBNB as Address;

    const path = isSwapped ? [WBNB_ADDR, USDT_ADDR] : [USDT_ADDR, WBNB_ADDR];

    // --- Data Fetching ---
    const { data: bnbBalance } = useBalance({ address });
    const { data: usdtBalanceData, refetch: refetchUsdtBalance } = useReadContract({
        address: USDT_ADDR,
        abi: ABIS.DopaToken, // Standard ERC20 balanceOf
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address, refetchInterval: 10000 }
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDT_ADDR,
        abi: ABIS.DopaToken, // Standard ERC20 allowance
        functionName: 'allowance',
        args: address ? [address, ROUTER_ADDR] : undefined,
        query: { enabled: !!address, refetchInterval: 10000 }
    });

    const { data: amountsOut, refetch: refetchAmountsOut } = useReadContract({
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

        if (valIn > currentUsdtBal) return toast.error("Insufficient USDT balance");

        const tid = toast.loading("Processing swap sequence...", { id: 'swap-op' });

        try {
            // 1. Approve if needed
            if (currentAllowance < valIn) {
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
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-zinc-900 bg-zinc-900/40 relative">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                        <ArrowLeftRight className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white italic tracking-tighter">INSTANT SWAP</h3>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Direct DEX Routing</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Swap Body */}
                        <div className="p-8 space-y-6">
                            {/* Input Card */}
                            <div className="bg-zinc-900/60 p-6 rounded-[1.8rem] border border-zinc-800/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{isSwapped ? 'You Sell' : 'You Sell'}</span>
                                    <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                                        {isSwapped ? (
                                            <>
                                                <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-black text-black">B</div>
                                                <span className="text-xs font-black text-white">BNB</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">$</div>
                                                <span className="text-xs font-black text-white">USDT</span>
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
                                        className="bg-transparent border-none p-0 text-3xl font-black focus:ring-0 text-white placeholder-zinc-800 h-10"
                                    />
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-zinc-500 font-bold">Balance</span>
                                        <span className="text-[10px] font-mono text-zinc-400">
                                            {isSwapped ? (bnbBalance ? Number(bnbBalance.formatted).toFixed(4) : '0.00') : usdtBalance}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex space-x-2">
                                    {[25, 50, 100].map(pct => (
                                        <button 
                                            key={pct}
                                            onClick={() => {
                                                const bal = isSwapped ? Number(bnbBalance?.formatted || 0) : Number(usdtBalance);
                                                setAmountIn((bal * pct / 100).toFixed(pct === 100 ? 6 : 2));
                                            }}
                                            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all uppercase"
                                        >
                                            {pct === 100 ? 'MAX' : `${pct}%`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Separator / Switch Icon */}
                            <div className="flex justify-center -my-9 relative z-10">
                                <button 
                                    onClick={() => {
                                        setIsSwapped(!isSwapped);
                                        setAmountIn('');
                                        setEstimatedOut('0.00');
                                    }}
                                    className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 shadow-xl group cursor-pointer hover:border-emerald-500/50 transition-all active:scale-95"
                                >
                                    <RefreshCw className={`w-5 h-5 text-emerald-500 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''} group-hover:rotate-180`} />
                                </button>
                            </div>

                            {/* Output Card */}
                            <div className="bg-zinc-900/60 p-6 rounded-[1.8rem] border border-zinc-800/50 pt-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">You Receive</span>
                                    <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                                        {!isSwapped ? (
                                            <>
                                                <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-black text-black">B</div>
                                                <span className="text-xs font-black text-white">BNB</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">$</div>
                                                <span className="text-xs font-black text-white">USDT</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-white italic tracking-tighter tabular-nums">
                                        {Number(estimatedOut).toFixed(6)}
                                    </span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-zinc-500 font-bold">Native Token</span>
                                        <span className="text-[10px] text-zinc-600 font-mono tracking-tighter">Est. Value</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 pt-4">
                                <Button
                                    onClick={handleSwap}
                                    disabled={isSwapping || isApproving || !amountIn || Number(amountIn) <= 0}
                                    variant="neon"
                                    className="w-full h-16 text-lg font-black italic tracking-tight"
                                >
                                    {isSwapping ? 'SWAPPING...' : isApproving ? 'APPROVING...' : 'CONFIRM SWAP'}
                                </Button>
                                
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center space-x-1.5 text-zinc-500">
                                        <Info className="w-3 h-3" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Slippage: 5.0%</span>
                                    </div>
                                    <a 
                                        href={bscscanUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 text-[9px] font-black text-zinc-600 hover:text-emerald-400 uppercase tracking-widest group"
                                    >
                                        <span>Verified Router</span>
                                        <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Safety Footer */}
                        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-center space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">PancakeSwap V2 Secure Route</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
