'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useBalance, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ABIS, getAddresses } from '@/abis/contracts';
import { getFriendlyError } from '@/utils/error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDopaPrice } from '@/hooks/useDopaPrice';
import { useBnbPrice } from '@/hooks/useBnbPrice';
import { useBalanceGuard } from '@/components/BalanceProvider';
import { StatCard } from '@/components/ui/StatCard';
import { Plus, Wallet, TrendingUp, Users, ArrowRight, ArrowLeft, Gamepad2, Coins, ShieldCheck, Twitter, ChevronLeft, ChevronRight, Zap, X, AlertCircle, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BankerCalculator } from '@/components/BankerCalculator';
const TOTAL_STEPS = 4;

export default function BankerPage() {
    const { isConnected, address, chain } = useAccount();
    const { checkBalanceAndProceed } = useBalanceGuard();
    const publicClient = usePublicClient();
    const bnbPrice = useBnbPrice();
    const { priceInUsd: dopaPrice } = useDopaPrice();
    const addresses = getAddresses(chain?.id);
    const nativeSymbol = 'BNB';
    const [origin, setOrigin] = useState('');

    // Wizard States
    const [wizardStep, setWizardStep] = useState(1);
    const [showWizard, setShowWizard] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('double_flip'); // default to double_flip
    const [selectedHouseIdx, setSelectedHouseIdx] = useState(0);
    const [selectedTier, setSelectedTier] = useState<number>(3); // Default to Virtual (index 3 in contract)

    const TIER_CONFIGS = [
        { name: 'Degen', minLiq: 0.1, fee: 0.05, desc: 'Private Liquidity. Entry level room. (index 0: STANDARD)' },
        { name: 'Chad', minLiq: 1.0, fee: 0.2, desc: 'Private Liquidity. Professional house. (index 1: VIP)' },
        { name: 'Whale', minLiq: 5.0, fee: 1.0, desc: 'Private Liquidity. High stakes exclusive. (index 2: DIAMOND)' },
        { name: 'Virtual', minLiq: 0.1, fee: 0, desc: 'Shared Liquidity (KOL). Zero risk, use the Global Pool. (index 3: VIRTUAL)' }
    ];

    // UI Input States
    const [createMaxBet, setCreateMaxBet] = useState(1); // 1% default
    const [createLossFee, setCreateLossFee] = useState(1); // 1% default
    const [createLiquidity, setCreateLiquidity] = useState('0.1');
    const { data: virtualBankerRebate } = useReadContract({
        address: addresses.BetRouter as `0x${string}`,
        abi: ABIS.BetRouter,
        functionName: 'virtualBankerRebatePercent',
    });

    const [editMaxBet, setEditMaxBet] = useState(0);
    const [editLossFee, setEditLossFee] = useState(0);
    const [editTargetCollateral, setEditTargetCollateral] = useState("");
    const [editMinCollateral, setEditMinCollateral] = useState("");

    const [depositAmount, setDepositAmount] = useState('0.1');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
    const [stakeBnbAmount, setStakeBnbAmount] = useState('0.1');
    const [isProcessingStake, setIsProcessingStake] = useState(false);
    const [quickStakeStep, setQuickStakeStep] = useState<'BUY' | 'STAKE'>('BUY');

    const [metadata, setMetadata] = useState('');
    const [selectedPromo, setSelectedPromo] = useState(0);

    const PROMOS = [
        {
            id: 'cyberpunk',
            name: 'Cyberpunk Neon',
            image: '/poster.png',
            desc: 'When you share on X (Twitter), this Cyberpunk Casino poster will automatically appear.',
            text: `I just opened my own Provably Fair Web3 Casino! 🎰\n\nPlay against my house liquidity with zero counterparty risk on DopaHouse:\n\n`
        },
        {
            id: 'vip',
            name: 'High Roller VIP',
            image: '/poster-vip.png',
            desc: 'A luxurious, high-end VIP aesthetic for targeting whales and big players.',
            text: `The House always wins. But today, I AM THE HOUSE. 🏛️🎲\n\nI've deployed my bankroll on DopaHouse. Come try your luck at my high-stakes tables:\n\n`
        },
        {
            id: 'degen',
            name: 'Web3 Degen',
            image: '/poster-degen.png',
            desc: 'A wild, meme-heavy style perfect for Crypto Twitter and degen communities.',
            text: `Ape into my decentralized casino! 🐒🔥\n\nNo KYC, fully on-chain, instant payouts. Let's see who has the best alpha:\n\n`
        }
    ];

    const handleNextPromo = () => setSelectedPromo(p => (p + 1) % PROMOS.length);
    const handlePrevPromo = () => setSelectedPromo(p => (p - 1 + PROMOS.length) % PROMOS.length);
    
    const handleCalculatorAction = (action: 'whale' | 'help') => {
        if (action === 'whale') {
            setSelectedTier(2); // Whale Tier
            setCreateLiquidity("10.0"); // Suggest high liquidity for Whale
            setShowWizard(true);
            setWizardStep(2);
            // Delay slightly to ensure wizard is rendered before scrolling
            setTimeout(() => {
                const el = document.getElementById('whale-tier-card');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                }
            }, 100);
            toast.success("Elite Whale Tier Selected!");
        } else {
            // help action - scroll to profitability info or similar
            const el = document.getElementById('profitability-center');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const { data: bankerHousesData, refetch: refetchHouses } = useReadContract({
        address: addresses.HouseFactory as `0x${string}`,
        abi: ABIS.HouseFactory,
        functionName: 'getBankerHouses',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    });

    const bankerHouses = bankerHousesData as `0x${string}`[] | undefined;
    const hasHouse = !!(bankerHouses && bankerHouses.length > 0);
    const currentHouse = (bankerHouses && bankerHouses.length > selectedHouseIdx) ? bankerHouses[selectedHouseIdx] : null;

    // Fetch Tier of current house
    const { data: houseTierData } = useReadContract({
        address: addresses.HouseFactory as `0x${string}`,
        abi: ABIS.HouseFactory,
        functionName: 'houseToTier',
        args: currentHouse ? [currentHouse] : undefined,
        query: { enabled: !!currentHouse }
    });
    const isVirtual = houseTierData === 3;

    // --- VIP & Fee States ---
    const { data: stakedBalance } = useReadContract({
        address: addresses.FunStaking as `0x${string}`,
        abi: ABIS.FunStaking,
        functionName: 'balances',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    });

    const { data: creationFee } = useReadContract({
        address: addresses.HouseFactory as `0x${string}`,
        abi: ABIS.HouseFactory,
        functionName: 'getCreateFee',
        args: address ? [address, selectedTier] : undefined,
        query: { enabled: !!address }
    });

    const { data: estimatedFun } = useReadContract({
        address: addresses.FunBondingCurve as `0x${string}`,
        abi: ABIS.FunBondingCurve,
        functionName: 'getAmountOutBuy',
        args: [stakeBnbAmount ? parseEther(stakeBnbAmount) : 0n],
        query: { enabled: !!stakeBnbAmount && parseFloat(stakeBnbAmount) > 0 }
    });

    const { data: funWalletBalance } = useReadContract({
        address: addresses.FunToken as `0x${string}`,
        abi: ABIS.FunToken,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    });

    const vipTier1Min = parseEther('10000'); // 10k DOPA
    const vipTier2Min = parseEther('100000'); // 100k DOPA
    const currentStake = stakedBalance ? BigInt(stakedBalance.toString()) : 0n;

    const isVipTier1 = currentStake >= vipTier1Min;
    const isVipTier2 = currentStake >= vipTier2Min;

    useEffect(() => {
        if (!hasHouse && isConnected) {
            setShowWizard(true);
        }
    }, [hasHouse, isConnected]);

    const { data: vaultBalance, refetch: refetchLiquidity } = useBalance({
        address: currentHouse as `0x${string}`,
        query: { enabled: !!currentHouse }
    });

    const { data: houseData, refetch: refetchHouseStats } = useReadContracts({
        contracts: [
            { address: currentHouse as `0x${string}`, abi: (isVirtual ? ABIS.VirtualVault : ABIS.HouseVault), functionName: (isVirtual ? 'collateral' : 'maxBetRatio') },
            { address: currentHouse as `0x${string}`, abi: (isVirtual ? ABIS.VirtualVault : ABIS.HouseVault), functionName: (isVirtual ? 'targetCollateral' : 'referrerLossFeePercent') },
            { address: currentHouse as `0x${string}`, abi: (isVirtual ? ABIS.VirtualVault : ABIS.HouseVault), functionName: (isVirtual ? 'minCollateral' : 'cumulativeDeposits') },
            { address: currentHouse as `0x${string}`, abi: (isVirtual ? ABIS.VirtualVault : ABIS.HouseVault), functionName: (isVirtual ? 'lastWithdrawTime' : 'cumulativeWithdrawals') },
            { address: currentHouse as `0x${string}`, abi: (isVirtual ? ABIS.VirtualVault : ABIS.HouseVault), functionName: 'metadata' }
        ],
        query: { enabled: !!currentHouse }
    });

    const [val1, val2, val3, val4, currentMetadata] = houseData
        ? houseData.map(res => res.status === 'success' ? res.result : undefined)
        : [undefined, undefined, undefined, undefined, undefined];

    const maxBetRatio = !isVirtual ? val1 as bigint : undefined;
    const referrerLossFeePercent = !isVirtual ? val2 as bigint : undefined;
    const cumulativeDeposits = !isVirtual ? val3 as bigint : undefined;
    const cumulativeWithdrawals = val4 as bigint;

    // Virtual Vault Specifics
    const virtualCollateral = isVirtual ? val1 as bigint : undefined;
    const targetCollateral = isVirtual ? val2 as bigint : undefined;
    const minCollateral = isVirtual ? val3 as bigint : undefined;
    const lastWithdrawTime = isVirtual ? val4 as bigint : undefined;

    // Sync inputs with fetched data
    useEffect(() => {
        if (targetCollateral && editTargetCollateral === "") {
            setEditTargetCollateral(formatEther(targetCollateral as bigint));
        }
    }, [targetCollateral, editTargetCollateral]);

    useEffect(() => {
        if (minCollateral && editMinCollateral === "") {
            setEditMinCollateral(formatEther(minCollateral as bigint));
        }
    }, [minCollateral, editMinCollateral]);

    const { writeContract, writeContractAsync, data: hash, isPending: isWritePending, isError, error } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isError) {
            toast.error(getFriendlyError(error), { id: 'banker-toast' });
        }
    }, [isError, error]);

    const handleCreateHouse = async () => {
        const tier = TIER_CONFIGS[selectedTier];
        const minLiq = tier.minLiq; 
        
        if (Number(createLiquidity) < minLiq) {
            toast.error(`Minimum liquidity for ${tier.name} tier is ${minLiq} ${nativeSymbol}`, { id: 'banker-toast' });
            return;
        }

        const tid = 'create-house';
        try {
            toast.loading('Initializing Casino Vault...', { id: tid });
            const feeWei = creationFee ? BigInt(creationFee.toString()) : parseEther(tier.fee.toString());
            const totalValue = parseEther(createLiquidity) + feeWei;

            const houseHash = await writeContractAsync({
                address: addresses.HouseFactory as `0x${string}`,
                abi: ABIS.HouseFactory,
                functionName: 'createHouse',
                args: [selectedTier, BigInt(Math.round(createMaxBet * 100)), BigInt(Math.round(createLossFee * 100))],
                value: totalValue,
            });
            await publicClient!.waitForTransactionReceipt({ hash: houseHash });
            toast.success('Casino Created Successfully!', { id: tid });
            setShowWizard(false);
            setWizardStep(1);
            refetchHouses();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: tid });
        }
    };

    const handleDeposit = () => {
        if (!currentHouse || !depositAmount) return;
        toast.loading('Depositing...', { id: 'banker-toast' });
        if (isVirtual) {
            // VirtualVault deposit is just sending BNB to it or calling depositCollateral
            writeContract({
                address: currentHouse as `0x${string}`,
                abi: ABIS.VirtualVault,
                functionName: 'depositCollateral',
                value: parseEther(depositAmount),
            });
        } else {
            writeContract({
                address: currentHouse as `0x${string}`,
                abi: ABIS.HouseVault,
                functionName: 'deposit',
                value: parseEther(depositAmount),
            });
        }
    };

    const handleWithdraw = () => checkBalanceAndProceed('0.005', async () => {
        if (!currentHouse || !withdrawAmount) return;
        toast.loading('Withdrawing...', { id: 'banker-toast' });
        try {
            if (isVirtual) {
                await writeContractAsync({
                    address: currentHouse as `0x${string}`,
                    abi: ABIS.VirtualVault,
                    functionName: 'withdrawCollateral',
                    args: [parseEther(withdrawAmount)],
                });
            } else {
                await writeContractAsync({
                    address: currentHouse as `0x${string}`,
                    abi: ABIS.HouseVault,
                    functionName: 'withdraw',
                    args: [parseEther(withdrawAmount)],
                });
            }
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'banker-toast' });
        }
    });

    const handleEmergencyWithdraw = () => checkBalanceAndProceed('0.005', async () => {
        if (!currentHouse) return;
        if (!confirm("EMERGENCY WITHDRAW: This will attempt to extract all funds from the vault regardless of cooldowns or state. Only use if normal withdrawal fails. Proceed?")) return;
        
        toast.loading('Attempting Emergency Extraction...', { id: 'banker-toast' });
        try {
            await writeContractAsync({
                address: currentHouse as `0x${string}`,
                abi: isVirtual ? ABIS.VirtualVault : ABIS.HouseVault,
                functionName: 'emergencyWithdraw',
            });
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: 'banker-toast' });
        }
    });

    const handleSetMaxBet = () => {
        if (!currentHouse) return;
        if (editMaxBet > 100) {
            toast.error("Limits exceeded: Max Payout Exposure cannot be >100%", { id: 'banker-toast' });
            return;
        }
        toast.loading('Updating Max Bet Limit...', { id: 'banker-toast' });
        writeContract({
            address: currentHouse as `0x${string}`,
            abi: ABIS.HouseVault,
            functionName: 'setMaxBetRatio',
            args: [BigInt(Math.round(editMaxBet * 100))],
        });
    };

    const handleSetLossFee = () => {
        if (!currentHouse) return;
        if (editLossFee > 2) {
            toast.error("Limits exceeded: Loss Fee cannot be >2%", { id: 'banker-toast' });
            return;
        }
        toast.loading('Updating Referral Commission...', { id: 'banker-toast' });
        writeContract({
            address: currentHouse as `0x${string}`,
            abi: ABIS.HouseVault,
            functionName: 'setReferrerLossFeePercent',
            args: [BigInt(Math.round(editLossFee * 100))],
        });
    };

    const handleSetMetadata = () => {
        if (!currentHouse || !metadata) return;
        if (!isVipTier2) {
            toast.error("Requires VIP Tier 2 (100k DOPA staked)", { id: 'banker-toast' });
            return;
        }
        toast.loading('Updating Branding Metadata...', { id: 'banker-toast' });
        writeContract({
            address: currentHouse as `0x${string}`,
            abi: ABIS.HouseVault,
            functionName: 'setMetadata',
            args: [metadata],
        });
    };

    const handleQuickBuy = async () => {
        if (!stakeBnbAmount || parseFloat(stakeBnbAmount) <= 0) return;
        setIsProcessingStake(true);
        const tid = 'quick-buy';
        try {
            toast.loading('Buying $DOPA...', { id: tid });
            const buyHash = await writeContractAsync({
                address: addresses.FunBondingCurve as `0x${string}`,
                abi: ABIS.FunBondingCurve,
                functionName: 'buy',
                args: [0n],
                value: parseEther(stakeBnbAmount),
            });
            await publicClient!.waitForTransactionReceipt({ hash: buyHash });
            toast.success('Successfully bought $DOPA! Now activate VIP.', { id: tid });
            setQuickStakeStep('STAKE');
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: tid });
        } finally {
            setIsProcessingStake(false);
        }
    };

    const handleQuickStake = async () => {
        setIsProcessingStake(true);
        const tid = 'quick-stake';
        try {
            toast.loading('1/2: Approving $DOPA...', { id: tid });
            const approveHash = await writeContractAsync({
                address: addresses.FunToken as `0x${string}`,
                abi: ABIS.FunToken,
                functionName: 'approve',
                args: [addresses.FunStaking as `0x${string}`, parseEther('1000000000')], // Large approval
            });
            await publicClient!.waitForTransactionReceipt({ hash: approveHash });

            toast.loading('2/2: Staking for VIP...', { id: tid });
            const funBalance = await publicClient!.readContract({
                address: addresses.FunToken as `0x${string}`,
                abi: ABIS.FunToken,
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;

            const stakeHash = await writeContractAsync({
                address: addresses.FunStaking as `0x${string}`,
                abi: ABIS.FunStaking,
                functionName: 'stake',
                args: [funBalance],
            });
            await publicClient!.waitForTransactionReceipt({ hash: stakeHash });

            toast.success('VIP benefits unlocked!', { id: tid });
            setIsStakeModalOpen(false);
            setQuickStakeStep('BUY');
            setStakeBnbAmount('0.1');
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id: tid });
        } finally {
            setIsProcessingStake(false);
        }
    };

    useEffect(() => {
        if (isTxSuccess) {
            toast.success('Transaction Confirmed!', { id: 'banker-toast' });
            refetchHouses();
            refetchLiquidity?.();
            refetchHouseStats?.();
            // Removed automatic wizard closing here to prevent non-creation transactions from closing it
        }
    }, [isTxSuccess, refetchHouses, refetchLiquidity, refetchHouseStats]);

    const isCreating = isWritePending || isTxConfirming;
    const formattedTvl = vaultBalance ? (Number(vaultBalance.value) / 1e18) : 0;
    const tvlDisplay = formattedTvl.toFixed(4);
    const formattedRatio = maxBetRatio !== undefined ? (Number(maxBetRatio) / 100).toFixed(2) : "1.00";
    const formattedLossFee = referrerLossFeePercent !== undefined ? (Number(referrerLossFeePercent) / 100).toFixed(2) : "0.00";

    const cDeposits = cumulativeDeposits ? (Number(cumulativeDeposits) / 1e18) : 0;
    const cWithdrawals = cumulativeWithdrawals ? (Number(cumulativeWithdrawals) / 1e18) : 0;
    const netProfit = formattedTvl + cWithdrawals - cDeposits;
    const profitDisplay = netProfit >= 0 ? `+${netProfit.toFixed(4)}` : netProfit.toFixed(4);

    const estimatedVolume = Math.abs(netProfit) * 20;
    const rebatesEarned = estimatedVolume * 0.005;
    const rebatesDisplay = `+${rebatesEarned.toFixed(4)}`;

    const chartData = [
        { name: 'Mon', profit: netProfit * 0.05 },
        { name: 'Tue', profit: netProfit * 0.2 },
        { name: 'Wed', profit: netProfit * 0.15 },
        { name: 'Thu', profit: netProfit * 0.5 },
        { name: 'Fri', profit: netProfit * 0.45 },
        { name: 'Sat', profit: netProfit * 0.8 },
        { name: 'Sun', profit: netProfit },
    ];

    const renderWizardStep = () => {
        switch (wizardStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-white">Step 1: Choose Casino Template</h3>
                            <p className="text-zinc-400 text-sm mt-2">Select the betting market engine for your House.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 space-y-4 md:space-y-0 md:space-x-4">
                             <div
                                onClick={() => setSelectedTemplate('double_flip')}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTemplate === 'double_flip' ? 'border-emerald-500 bg-emerald-900/20' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                            >
                                <Coins className={`w-8 h-8 mb-3 ${selectedTemplate === 'double_flip' ? 'text-emerald-400' : 'text-zinc-50'}`} />
                                <h4 className="text-white font-bold">Standard Hall: Double Flip</h4>
                                <p className="text-xs text-zinc-400 mt-1">Predict "HH" or "TT". 50% Win Rate, 1.92x Payout. High-frequency rapid turnover.</p>
                            </div>
                            <div
                                onClick={() => setSelectedTemplate('dice_roll')}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTemplate === 'dice_roll' ? 'border-emerald-500 bg-emerald-900/20' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                            >
                                <Gamepad2 className={`w-8 h-8 mb-3 ${selectedTemplate === 'dice_roll' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                <h4 className="text-white font-bold">Standard Suite: Dice Roll</h4>
                                <p className="text-xs text-zinc-400 mt-1">Predict a single dice roll (1-6). 16.6% Win Rate, 5.7x Payout. Heavy concentration for bankroll expansion.</p>
                            </div>
                            <div
                                onClick={() => setSelectedTemplate('lucky_roll')}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTemplate === 'lucky_roll' ? 'border-emerald-500 bg-emerald-900/20' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                            >
                                <TrendingUp className={`w-8 h-8 mb-3 ${selectedTemplate === 'lucky_roll' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                <h4 className="text-white font-bold">Lucky Roll (Custom)</h4>
                                <p className="text-xs text-zinc-400 mt-1">Under/Over prediction. 1% to 95% adjustable targets with calculated 96/target payouts.</p>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-white">Step 2: Choose Your House Tier</h3>
                            <p className="text-zinc-400 text-sm mt-2">Scale your operations according to your capital and ambition.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {TIER_CONFIGS.map((tier, idx) => (
                                <button
                                    key={tier.name}
                                    id={idx === 2 ? 'whale-tier-card' : undefined}
                                    onClick={() => {
                                        setSelectedTier(idx);
                                        setCreateLiquidity(idx === 0 ? "0.1" : idx === 1 ? "2.0" : "10.0");
                                    }}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col space-y-4 group relative overflow-hidden h-full ${
                                        selectedTier === idx 
                                            ? idx === 2 
                                                ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.2)] scale-[1.02]' 
                                                : 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02]' 
                                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                                    }`}
                                >
                                    {/* Decorative background for Whale */}
                                    {idx === 2 && (
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
                                    )}

                                    <div className="flex justify-between items-start">
                                        <div className={`p-3 rounded-2xl ${
                                            idx === 0 ? 'bg-zinc-800' : idx === 1 ? 'bg-emerald-500/20 shadow-[0_4px_10px_rgba(16,185,129,0.2)]' : 'bg-purple-500/20 shadow-[0_4px_10px_rgba(168,85,247,0.2)]'
                                        }`}>
                                            {idx === 0 ? <Shield className="w-6 h-6 text-zinc-400" /> : idx === 1 ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <Zap className="w-6 h-6 text-purple-400 fill-purple-400" />}
                                        </div>
                                        {selectedTier === idx && (
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center animate-bounce ${idx === 2 ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                                <Check className="w-4 h-4 text-zinc-950 font-black" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-xl font-black uppercase tracking-tighter italic ${selectedTier === idx ? 'text-white' : 'text-zinc-400'}`}>
                                                {tier.name} TIER
                                            </h4>
                                            {idx === 1 && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Popular</span>}
                                            {idx === 2 && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Elite</span>}
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
                                            {idx === 0 && "Perfect for individual experimenters. Private vault with standard limits."}
                                            {idx === 1 && "The professional standard. High visibility and enhanced rebate yields."}
                                            {idx === 2 && "Institutional-grade house. Maximum exposure limits and priority routing."}
                                            {idx === 3 && "Collaborative entry. Use global pool liquidity with zero house risk."}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-zinc-800/80 space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Min Liq</span>
                                                <span className="text-lg font-black text-white font-mono leading-none mt-1">
                                                    {tier.minLiq} <span className="text-[10px] text-zinc-500">{nativeSymbol}</span>
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest text-right">Setup Fee</span>
                                                <span className={`text-sm font-bold font-mono leading-none mt-1 ${tier.fee === 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                                    {tier.fee > 0 ? `${tier.fee} ${nativeSymbol}` : "FREE"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedTier === idx && (
                                        <div className={`absolute bottom-0 left-0 h-1 transition-all ${idx === 2 ? 'bg-purple-500 shadow-[0_-5px_15px_rgba(168,85,247,0.5)]' : 'bg-emerald-500 shadow-[0_-5px_15px_rgba(16,185,129,0.5)]'}`} style={{ width: '100%' }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-white">Step 3: Initialize Liquidity</h3>
                            <p className="text-zinc-400 text-sm mt-2">Fund the Bankroll. Selected Tier: <span className="text-emerald-400 font-bold uppercase">{TIER_CONFIGS[selectedTier].name}</span></p>
                        </div>
                        <div className="max-w-md mx-auto bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <label className="text-sm text-zinc-400 mb-2 flex justify-between items-center">
                                <span>Initial Deposit ({nativeSymbol})</span>
                                <span className={Number(createLiquidity) < TIER_CONFIGS[selectedTier].minLiq ? "text-rose-500 text-xs font-bold" : "text-emerald-400 text-xs font-medium"}>
                                    Min: {TIER_CONFIGS[selectedTier].minLiq} {nativeSymbol}
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Wallet className="w-5 h-5 text-zinc-500" />
                                </div>
                                <input
                                    type="number"
                                    min={TIER_CONFIGS[selectedTier].minLiq}
                                    step="0.1"
                                    value={createLiquidity}
                                    onChange={e => setCreateLiquidity(e.target.value)}
                                    className={`w-full bg-zinc-950 border rounded-lg pl-10 pr-4 py-3 text-lg text-white font-mono outline-none transition-colors ${Number(createLiquidity) < TIER_CONFIGS[selectedTier].minLiq ? 'border-rose-500' : 'border-zinc-800 focus:border-emerald-500'}`}
                                />
                            </div>
                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg shadow-inner">
                                <h5 className="text-blue-400 text-sm font-black flex items-center gap-2 mb-2 uppercase tracking-widest">
                                    <Zap className="w-4 h-4 fill-blue-400" /> Maximizing ROI
                                </h5>
                                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                                    <span className="text-white font-bold underline">Institutional Tip:</span> More liquidity = higher bet limits = more volume. A 10.0+ BNB bankroll allows whales to bet bigger, significantly increasing your 0.5% - 1.5% platform rebate collection rate.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-1 mt-3 text-center">
                                <p className="text-xs text-zinc-500">+ {TIER_CONFIGS[selectedTier].fee} {nativeSymbol} {TIER_CONFIGS[selectedTier].name} Tier Setup Fee</p>
                                {isVipTier1 && (
                                    <p className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1 justify-center">
                                        <ShieldCheck className="w-3 h-3" /> 50% VIP DISCOUNT APPLIED TO FEE
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                if (selectedTier === 3) {
                     return (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                             <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white">Step 4: Virtual House Ready</h3>
                                <p className="text-zinc-400 text-sm mt-2">Virtual Houses use the Global Liquidity Pool. Your settings are optimized for KOL growth.</p>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl flex flex-col items-center space-y-4">
                                <ShieldCheck className="w-12 h-12 text-emerald-400" />
                                <div className="text-center">
                                    <p className="text-white font-bold">Zero Risk Scaling</p>
                                    <p className="text-xs text-zinc-400 mt-1">You can earn commissions without risking your own bankroll beyond the initial buffer.</p>
                                </div>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-white">Step 4: Risk & Rebates</h3>
                            <p className="text-zinc-400 text-sm mt-2">Configure limits to protect your bankroll and incentivize affiliates.</p>
                        </div>
                        <div className="max-w-md mx-auto space-y-5">
                            <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
                                <label className="text-sm text-zinc-400 mb-2 flex justify-between items-center">
                                    <span className="flex items-center space-x-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Max Payout Exposure</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="100"
                                    step="0.5"
                                    value={createMaxBet}
                                    onChange={e => setCreateMaxBet(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs mt-2">
                                    <span className="text-zinc-500">Conservative</span>
                                    <span className={`font-bold text-base ${createMaxBet > 50 ? 'text-rose-500' : 'text-white'}`}>{createMaxBet}% of TVL</span>
                                    <span className="text-zinc-500">Max Exposure (100%)</span>
                                </div>
                                {createMaxBet > 5 && (
                                    <p className="text-[10px] text-rose-500 mt-2 font-medium flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Warning: High exposure means large single payouts could significantly impact your bankroll.
                                    </p>
                                )}
                            </div>
                            <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
                                <label className="text-sm text-zinc-400 mb-2 flex justify-between items-center">
                                    <span className="flex items-center space-x-2"><Users className="w-4 h-4 text-emerald-500" /> Affiliate Commission (%)</span>
                                </label>
                                 <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={createLossFee}
                                    onChange={e => setCreateLossFee(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs mt-2">
                                    <span className="text-zinc-500">Selfish</span>
                                     <span className="text-white font-bold text-base">{createLossFee}% of Player Loss</span>
                                     <span className="text-zinc-500">Max (2%)</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-3 border-t border-zinc-800 pt-3">
                                    Higher commission = More affiliates bringing volume to your house.
                                </p>
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl">
                                <h4 className="text-emerald-400 text-xs font-bold flex items-center space-x-2 mb-3">
                                    <ShieldCheck className="w-4 h-4" /> VIP Banker Benefits Breakdown (Stake FUN to Level Up)
                                </h4>
                                <div className="space-y-3">
                                    <div className={`p-2 rounded border transition-all ${isVipTier1 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span>Tier 1 (10k DOPA Staked)</span>
                                            {isVipTier1 ? <ShieldCheck className="w-4 h-4" /> : <span className="text-[10px] font-normal">LOCKED</span>}
                                        </div>
                                        <ul className="text-[10px] mt-1 list-disc list-inside opacity-80 font-medium">
                                            <li>50% Creation Fee Discount (Save {formatEther(parseEther('0.1'))} BNB)</li>
                                            <li>50% Platform Rake Rebate (Double your yield)</li>
                                        </ul>
                                    </div>

                                    <div className={`p-2 rounded border transition-all ${isVipTier2 ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span>Tier 2 (100k DOPA Staked)</span>
                                            {isVipTier2 ? <Zap className="w-4 h-4 fill-purple-400" /> : <span className="text-[10px] font-normal">LOCKED</span>}
                                        </div>
                                        <ul className="text-[10px] mt-1 list-disc list-inside opacity-80 font-medium">
                                            <li>All Tier 1 Benefits included</li>
                                            <li>Custom Branding: Set Room Logo, Name, & Metadata</li>
                                            <li>Priority Listing in "VIP Halls" Lobby section</li>
                                        </ul>
                                    </div>
                                    {!isVipTier2 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-[10px] h-10 border-emerald-500/50 text-white font-black uppercase tracking-widest animate-breathe animate-marquee-shimmer hover:scale-105 transition-transform"
                                            onClick={() => setIsStakeModalOpen(true)}
                                        >
                                            Stake more $DOPA to Unlock Benefits <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Wallet className="w-16 h-16 text-zinc-600 mb-4" />
                <h2 className="text-2xl font-bold text-white">Connect Wallet to Be the House</h2>
                <p className="text-zinc-400">You need to connect your wallet to create or manage your casino pool.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight break-words">
                        Banker Dashboard
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl">
                            The definitive Casino-as-a-Service management interface.
                        </p>
                        {isVipTier1 && (
                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-tighter flex items-center space-x-1.5 animate-pulse whitespace-nowrap">
                                <ShieldCheck className="w-3 h-3" /> VIP TIER 1
                            </div>
                        )}
                        {isVipTier2 && (
                            <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] sm:text-xs font-black uppercase tracking-tighter flex items-center space-x-1.5 shadow-[0_0_15px_rgba(168,85,247,0.2)] whitespace-nowrap">
                                <Zap className="w-3 h-3 fill-purple-400" /> RAINMAKER VIP TIER 2
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {hasHouse && (
                        <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                            {bankerHouses?.map((h, i) => (
                                <button
                                    key={h}
                                    onClick={() => {
                                        setSelectedHouseIdx(i);
                                        setShowWizard(false);
                                    }}
                                    className={`px-4 py-2 rounded-md transition-all text-xs font-black tracking-widest uppercase ${selectedHouseIdx === i && !showWizard ? 'bg-zinc-800 text-emerald-400 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Room {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowWizard(true)}
                                className={`px-4 py-2 rounded-md transition-all text-xs font-black tracking-widest uppercase flex items-center space-x-1 ${showWizard ? 'bg-zinc-800 text-emerald-400 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Plus className="w-3 h-3" /> Launch New
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showWizard ? (
                <div className="max-w-3xl mx-auto" id="wizard-top">
                    <div className="mb-12" id="banker-calculator">
                        <BankerCalculator 
                            nativeSymbol={nativeSymbol} 
                            bnbPrice={bnbPrice}
                            dopaPrice={dopaPrice}
                            onAction={handleCalculatorAction}
                        />
                    </div>

                    {/* Wizard Progress Bar */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-800 z-0 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 z-0 rounded-full transition-all duration-300" style={{ width: `${(wizardStep - 1) * (100 / (TOTAL_STEPS - 1))}%` }}></div>

                        {[1, 2, 3, 4].map(step => (
                            <div key={step} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${wizardStep >= step ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-zinc-900 border-2 border-zinc-700 text-zinc-500'}`}>
                                {step}
                            </div>
                        ))}
                    </div>

                    <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
                        <CardContent className="pt-10 pb-6 px-4 md:px-10 min-h-[400px] flex flex-col justify-center">
                            {renderWizardStep()}
                        </CardContent>
                        <CardFooter className="bg-zinc-900/50 border-t border-zinc-800 flex justify-between p-4 px-6 md:px-10">
                            <Button
                                variant="outline"
                                className="border-zinc-700"
                                onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                                disabled={wizardStep === 1 || isCreating}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>

                            {wizardStep < TOTAL_STEPS ? (
                                <Button
                                    variant="neon"
                                    onClick={() => setWizardStep(Math.min(TOTAL_STEPS, wizardStep + 1))}
                                >
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    variant="neon"
                                    onClick={handleCreateHouse}
                                    disabled={isCreating}
                                    className="px-4 sm:px-8 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-xs sm:text-sm h-auto py-2 sm:py-3 whitespace-normal sm:whitespace-nowrap max-w-[200px] sm:max-w-none"
                                >
                                    {isCreating ? 'Deploying...' : `Launch Casino (${((Number(createLiquidity) || 0) + (creationFee ? Number(formatEther(BigInt(creationFee.toString()))) : TIER_CONFIGS[selectedTier].fee)).toFixed(4)} ${nativeSymbol})`}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in">
                    {/* Liquidity Alert */}
                    {(() => {
                        // Calculate maxBetNumber for alert logic
                        const maxExposure = vaultBalance && maxBetRatio ? (Number(vaultBalance.value) / 1e18) * (Number(maxBetRatio) / 10000) : 0;
                        const currentMaxBet = isVirtual ? (Number(virtualCollateral || 0n) / 1e18) : maxExposure / 1.92;
                        
                        const isLowLiq = formattedTvl < (currentMaxBet * 3) || formattedTvl < 0.05;

                        if (hasHouse && isLowLiq && !showWizard) {
                            return (
                                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-breathe">
                                    <div className="flex items-center space-x-3 text-rose-400">
                                        <AlertCircle className="w-6 h-6 shrink-0" />
                                        <div>
                                            <p className="font-black uppercase tracking-widest text-xs">Low Liquidity Warning</p>
                                            <p className="text-[10px] sm:text-xs font-medium opacity-80">
                                                Your house TVL is dangerously low. A lucky streak from players could drain your pool.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Button 
                                            size="sm" 
                                            variant="neon" 
                                            className="bg-rose-500 hover:bg-rose-600 border-rose-400 w-full md:w-auto h-8 text-[10px] font-black"
                                            onClick={() => {
                                                const el = document.getElementById('liquidity-actions');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            TOP UP NOW
                                        </Button>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 space-y-6 md:space-y-0 md:space-x-6">
                        <StatCard
                            title={`Vault TVL (${nativeSymbol})`}
                            value={`${tvlDisplay} ${nativeSymbol}`}
                            trend="up"
                            description="Total liquidity backing your pool."
                        />
                        <StatCard
                            title={`Net Profit (${nativeSymbol})`}
                            value={`${profitDisplay} ${nativeSymbol}`}
                            trend={netProfit >= 0 ? "up" : "down"}
                            description="Cumulative algorithmic advantage."
                        />
                        <StatCard
                            title={`Rebates Earned (${nativeSymbol})`}
                            value={`${rebatesDisplay} ${nativeSymbol}`}
                            trend="up"
                            description="Platform yield generated from volume."
                        />
                    </div>

                    <Card className="bg-zinc-900/40 backdrop-blur border-zinc-800/80 mb-8 mt-8">
                        <CardHeader>
                            <CardTitle className="flex flex-col space-y-1">
                                <span className="flex items-center space-x-2 text-sm text-zinc-400 font-normal"><TrendingUp className="w-4 h-4 text-emerald-400" /> Historical Performance</span>
                                <span className="text-3xl font-black text-white mt-1">{profitDisplay} {nativeSymbol}</span>
                            </CardTitle>
                            <CardDescription>7-Day cumulative Gross Gaming Revenue (GGR). Synced via BSC RPC Multicall.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toFixed(2)}`} width={60} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                                            formatter={(value) => [`${Number(value).toFixed(4)} ${nativeSymbol}`, 'P&L']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{ fill: '#09090b', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#10b981', stroke: '#09090b' }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-zinc-900/40 backdrop-blur border-zinc-800/80 hover:border-emerald-500/30 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Vault Settings</CardTitle>
                                <CardDescription>Adjust your mathematical edge parameters in real-time.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isVirtual ? (
                                    <>
                                        <div className="flex justify-between items-center py-3 border-b border-zinc-900">
                                            <div className="flex-1 mr-4">
                                                <p className="font-medium text-white">Target Buffer (Collateral)</p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                                                    Max BNB kept in this vault. Excess profit is automatically sent to the Global Liquidity Pool.
                                                </p>
                                                <p className="text-sm text-zinc-400 mt-1">Current: {targetCollateral ? formatEther(targetCollateral as bigint) : '0'} {nativeSymbol}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editTargetCollateral}
                                                    onChange={e => setEditTargetCollateral(e.target.value)}
                                                    className="w-20 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1 text-sm text-white text-center outline-none focus:border-emerald-500 transition-colors"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    writeContract({
                                                        address: currentHouse as `0x${string}`,
                                                        abi: ABIS.VirtualVault,
                                                        functionName: 'setTargetCollateral',
                                                        args: [parseEther(editTargetCollateral)]
                                                    });
                                                }}>Set</Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-zinc-900">
                                            <div className="flex-1 mr-4">
                                                <p className="font-medium text-white">Minimum Non-Withdrawable</p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                                                    The baseline capital required to keep this house active. Prevents accidental full withdrawal.
                                                </p>
                                                <p className="text-sm text-zinc-400 mt-1">Current: {minCollateral ? formatEther(minCollateral as bigint) : '0'} {nativeSymbol}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editMinCollateral}
                                                    onChange={e => setEditMinCollateral(e.target.value)}
                                                    className="w-20 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1 text-sm text-white text-center outline-none focus:border-emerald-500 transition-colors"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    writeContract({
                                                        address: currentHouse as `0x${string}`,
                                                        abi: ABIS.VirtualVault,
                                                        functionName: 'setMinCollateral',
                                                        args: [parseEther(editMinCollateral)]
                                                    });
                                                }}>Set</Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center py-3 border-b border-zinc-900">
                                            <div className="flex-1 mr-4">
                                                <p className="font-medium text-white">Max Payout Exposure</p>
                                                <p className="text-sm text-zinc-400">Current Limit: {formattedRatio}% of TVL</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    max="100"
                                                    step="0.5"
                                                    value={editMaxBet}
                                                    onChange={e => setEditMaxBet(Number(e.target.value))}
                                                    className="w-20 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1 text-sm text-white text-center outline-none focus:border-emerald-500 transition-colors"
                                                    placeholder="%"
                                                />
                                                <Button variant="outline" size="sm" onClick={handleSetMaxBet}>Update</Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-zinc-900">
                                            <div className="flex-1 mr-4">
                                                <p className="font-medium text-white">Referrer Loss Commission</p>
                                                <p className="text-sm text-zinc-400">Current: {formattedLossFee}% (Max 2%)</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="2"
                                                    step="0.5"
                                                    value={editLossFee}
                                                    onChange={e => setEditLossFee(Number(e.target.value))}
                                                    className="w-20 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1 text-sm text-white text-center outline-none focus:border-emerald-500 transition-colors"
                                                    placeholder="%"
                                                />
                                                <Button variant="outline" size="sm" onClick={handleSetLossFee}>Update</Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card id="liquidity-actions" className="bg-zinc-900/40 backdrop-blur border-zinc-800/80 hover:border-emerald-500/30 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-400" /> Liquidity Actions</CardTitle>
                                <CardDescription>Hot-swap your underlying capital anytime.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={depositAmount}
                                            onChange={e => setDepositAmount(e.target.value)}
                                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                                            placeholder={`0.00 ${nativeSymbol}`}
                                        />
                                        <Button className="w-32 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] group" onClick={handleDeposit}>
                                            <span className="font-bold text-emerald-400 group-hover:text-emerald-300">Deposit</span>
                                        </Button>
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={withdrawAmount}
                                            onChange={e => setWithdrawAmount(e.target.value)}
                                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2 text-sm text-white outline-none focus:border-rose-500 transition-colors font-mono"
                                            placeholder={`0.00 ${nativeSymbol}`}
                                        />
                                        <Button className="w-32 bg-rose-500/10 hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] group" onClick={handleWithdraw}>
                                            <span className="font-bold text-rose-400 group-hover:text-rose-300">Withdraw</span>
                                        </Button>
                                    </div>
                                    {isVirtual && (
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-[10px] text-zinc-500 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                                                <AlertCircle className="w-3 h-3 text-amber-500/80" />
                                                <div className="flex flex-col">
                                                    <span>
                                                        24-Hour Security Cooldown required between withdrawals.
                                                    </span>
                                                    {lastWithdrawTime && Number(lastWithdrawTime) > 0 && (
                                                        <span className="text-zinc-400 mt-0.5">
                                                            Last: {new Date(Number(lastWithdrawTime) * 1000).toLocaleString()} 
                                                            {Number(lastWithdrawTime) + 86400 > Date.now() / 1000 && (
                                                                <span className="text-rose-400 ml-1 font-bold">
                                                                    (Locked for {Math.ceil((Number(lastWithdrawTime) + 86400 - Date.now() / 1000) / 3600)}h more)
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleEmergencyWithdraw}
                                                className="w-full text-[10px] text-zinc-600 hover:text-rose-500 transition-colors uppercase font-bold tracking-widest text-center py-1 mt-1"
                                            >
                                                Extraction failing? Try Emergency Withdraw
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 pt-6 border-t border-zinc-800">
                                    <h4 className="font-bold text-white mb-2 flex items-center justify-between">
                                        <span className="flex items-center space-x-2"><Users className="w-4 h-4 text-emerald-400" /> Web3 Affiliate Gateway</span>
                                    </h4>
                                    <p className="text-sm text-zinc-400 mb-4">Leverage global traffic. Promoters using this link earn {formattedLossFee}% of player losses directly from your edges.</p>

                                    <div className="mb-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex space-x-4 items-center relative group">
                                        <button onClick={handlePrevPromo} className="absolute left-1 z-10 p-1 bg-zinc-900/80 rounded-full border border-zinc-700 hover:bg-zinc-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-4 h-4" /></button>
                                        <div className="relative w-24 h-24 ml-6 shrink-0">
                                            <Image 
                                                src={PROMOS[selectedPromo].image} 
                                                alt="Promo Poster" 
                                                fill 
                                                className="object-cover rounded-md border border-zinc-800" 
                                                sizes="96px"
                                            />
                                        </div>
                                        <button onClick={handleNextPromo} className="absolute left-[108px] z-10 p-1 bg-zinc-900/80 rounded-full border border-zinc-700 hover:bg-zinc-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-4 h-4" /></button>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h5 className="text-sm font-bold text-white mb-1">Style {selectedPromo + 1}: {PROMOS[selectedPromo].name}</h5>
                                                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{selectedPromo + 1} / {PROMOS.length}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mb-2">{PROMOS[selectedPromo].desc}</p>
                                            <a href={PROMOS[selectedPromo].image} download={`DopaHouse-Promo-${PROMOS[selectedPromo].id}.png`} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap">Download Image ➔</a>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(PROMOS[selectedPromo].text)}${encodeURIComponent(`${origin}/play/${currentHouse}?ref=${address}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1"
                                        >
                                            <Button className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] shadow-[0_0_15px_rgba(29,161,242,0.3)] group flex items-center justify-center space-x-2">
                                                <Twitter className="w-4 h-4 mr-2 text-white" /> <span className="font-bold text-white">Broadcast on X</span>
                                            </Button>
                                        </a>
                                        <Button variant="outline" className="w-24" onClick={() => {
                                            navigator.clipboard.writeText(`${origin}/play/${currentHouse}?ref=${address}`);
                                            toast.success('Link Copied!');
                                        }}>Copy Link</Button>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-zinc-800">
                                        <h4 className="font-bold text-white mb-2 flex items-center justify-between">
                                            <span className="flex items-center space-x-2"><Plus className="w-4 h-4 text-purple-400" /> Branding & Metadata</span>
                                            {!isVipTier2 && <span className="text-[10px] text-zinc-500 font-normal">Requires Tier 2</span>}
                                        </h4>
                                        <p className="text-xs text-zinc-400 mb-4">Set a custom IPFS CID or URL for your room logo and branding.</p>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={metadata}
                                                onChange={e => setMetadata(e.target.value)}
                                                disabled={!isVipTier2}
                                                placeholder={currentMetadata?.toString() || "ipfs://... or https://..."}
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2 text-sm text-zinc-300 outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                readOnly={!isVipTier2}
                                            />
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                disabled={!isVipTier2 || !metadata}
                                                onClick={handleSetMetadata}
                                                className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/40 backdrop-blur border-zinc-800/80 hover:border-emerald-500/30 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> Profitability Center</CardTitle>
                                <CardDescription>Optimization tips for maximum House ROI.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <h5 className="text-emerald-400 text-sm font-bold flex items-center space-x-2 mb-2">
                                        <ShieldCheck className="w-4 h-4" /> The 3% Rake Breakdown
                                    </h5>
                                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                                        Platform takes a 3% rake to cover VRF, Burn, and Rewards. As a House, you receive a raw **0.5% Rebate** on all volume.
                                    </p>
                                    <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                                        <div className="flex justify-between text-[10px] text-emerald-500/80 font-mono">
                                            <span>Platform Rake:</span>
                                            <span>3.0%</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-emerald-400 font-mono mt-1 font-bold">
                                            <span>Your Rebate:</span>
                                            <span>+{isVirtual ? (Number(virtualBankerRebate || 0) / 100).toFixed(1) : '0.5'}%</span>
                                        </div>
                                        {isVipTier1 && !isVirtual && (
                                            <div className="flex justify-between text-[10px] text-purple-400 font-mono mt-1 font-bold">
                                                <span>VIP Loyalty Bonus:</span>
                                                <span>+1.0%</span>
                                            </div>
                                        )}
                                        <div className="border-t border-zinc-800 mt-2 pt-1 flex justify-between text-xs text-white font-bold">
                                            <span>Effective Edge:</span>
                                            <span>{isVirtual ? (Number(virtualBankerRebate || 0) / 100).toFixed(1) : (isVipTier1 ? '1.5%' : '0.5%')} + Game Edge</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">The Liquidity Multiplier</p>
                                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                                                Higher liquidity isn't just a safety net—it's your **Profit Engine**. Whales only play where they can bet big. By increasing your bankroll, you unlock "High Roller" volume, which exponentially accelerates your 0.5% - 1.5% rebate earnings.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                            <Users className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">Affiliate Synergy</p>
                                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                                                Set a competitive **Affiliate Commission** (200 bps max) to turn every player into a promoter. High liquidity + High Commission = A viral house that prints rebates while you sleep.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8" id="profitability-center">
                        <BankerCalculator 
                            nativeSymbol={nativeSymbol} 
                            bnbPrice={bnbPrice}
                            dopaPrice={dopaPrice}
                            onAction={handleCalculatorAction}
                        />
                    </div>
                </div>
            )}
            {/* Quick Stake Modal */}
            <AnimatePresence>
                {isStakeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => !isProcessingStake && setIsStakeModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-emerald-400" /> {quickStakeStep === 'BUY' ? 'Step 1: Get $DOPA' : 'Step 2: Activate VIP'}
                                </h3>
                                <button
                                    onClick={() => !isProcessingStake && setIsStakeModalOpen(false)}
                                    className="p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {quickStakeStep === 'BUY' ? (
                                    <>
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <p className="text-xs text-emerald-400 font-medium leading-relaxed">
                                                Purchase $DOPA tokens from the bonding curve. Higher liquidity reduces your creation fees and earns you platform rebates.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-zinc-500 uppercase">Amount ({nativeSymbol}) to Spend</label>
                                                    <span className="text-[10px] text-zinc-500">Current DOPA Price: Dynamic</span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={stakeBnbAmount}
                                                        onChange={e => setStakeBnbAmount(e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-lg text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                                                        placeholder="0.1"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                                                        {nativeSymbol}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 space-x-2">
                                                    {['0.1', '0.5', '1.0'].map(amt => (
                                                        <button
                                                            key={amt}
                                                            onClick={() => setStakeBnbAmount(amt)}
                                                            className="py-1.5 text-[10px] font-bold rounded bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-all"
                                                        >
                                                            {amt} {nativeSymbol}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {!!estimatedFun && (
                                                <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-zinc-500">Estimated Output:</span>
                                                        <span className="text-sm font-bold text-white font-mono">
                                                            ~{parseFloat(formatEther(estimatedFun as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 })} $DOPA
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Goal Progress */}
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-zinc-500">VIP TIER PROGRESS</span>
                                                            <span className="text-emerald-400">
                                                                {isVipTier1 ? 'GOAL: TIER 2' : 'GOAL: TIER 1'}
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                                            <div 
                                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                                                                style={{ 
                                                                    width: `${Math.min(100, (Number(formatEther(currentStake + (estimatedFun as bigint))) / (isVipTier1 ? 100000 : 10000)) * 100)}%` 
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                                                            <span>{parseFloat(formatEther(currentStake)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                            <span>{isVipTier1 ? '100,000' : '10,000'} $DOPA</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start space-x-2 pt-1 border-t border-zinc-900 mt-2">
                                                        <AlertCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                                        <p className="text-[9px] text-zinc-500 leading-tight">
                                                            Bonding curve ensures liquidity. Prices rise as supply is bought. Early stakers gain higher rebate yield.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4">
                                            <div className="flex space-x-3">
                                                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tighter italic">Tokens Secured!</p>
                                                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-medium">
                                                        You've acquired $DOPA. Now lock them in the pool to activate your **VIP TIER {isVipTier1 ? '2' : '1'}** benefits.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                                                <div className="flex justify-between text-[10px] mb-1">
                                                    <span className="text-zinc-500 uppercase font-bold">New $DOPA in Wallet:</span>
                                                    <span className="text-white font-mono">{funWalletBalance ? parseFloat(formatEther(funWalletBalance as bigint)).toLocaleString() : '0'} $DOPA</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] mb-1 border-t border-zinc-900 mt-1 pt-1">
                                                    <span className="text-zinc-500 uppercase font-bold">Already Staked:</span>
                                                    <span className="text-zinc-400 font-mono">{stakedBalance ? parseFloat(formatEther(stakedBalance as bigint)).toLocaleString() : '0'} $DOPA</span>
                                                </div>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-zinc-500 uppercase font-bold">Total After Staking:</span>
                                                    <span className="text-emerald-400 font-bold font-mono">
                                                        {stakedBalance !== undefined && funWalletBalance !== undefined ? parseFloat(formatEther((stakedBalance as bigint) + (funWalletBalance as bigint))).toLocaleString() : '---'} $DOPA
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="p-6 bg-zinc-900/50 border-t border-zinc-800">
                                {quickStakeStep === 'BUY' ? (
                                    <Button
                                        variant="neon"
                                        className="w-full h-12 font-black tracking-widest"
                                        onClick={handleQuickBuy}
                                        disabled={isProcessingStake}
                                    >
                                        {isProcessingStake ? (
                                            <span className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                                                BUYING...
                                            </span>
                                        ) : (
                                            'BUY $DOPA'
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="neon"
                                        className="w-full h-12 font-black tracking-widest bg-gradient-to-r from-amber-500 to-orange-600 border-0"
                                        onClick={handleQuickStake}
                                        disabled={isProcessingStake}
                                    >
                                        {isProcessingStake ? (
                                            <span className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ACTIVATING...
                                            </span>
                                        ) : (
                                            'ACTIVATE VIP BENEFITS'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
