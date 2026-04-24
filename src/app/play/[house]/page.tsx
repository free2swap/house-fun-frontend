'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance, usePublicClient } from 'wagmi';
import { parseEther, parseAbiItem } from 'viem';
import { ADDRESSES, ABIS, getAddresses } from '@/abis/contracts';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Coins, CircleDollarSign, History, Share2, HelpCircle, ShieldCheck, Zap, Dices } from 'lucide-react';
import { getFriendlyError } from '@/utils/error';
import { formatEther } from 'viem';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
const VRFResultModal = dynamic(() => import('@/components/ui/VRFResultModal').then((mod) => mod.VRFResultModal), { ssr: false });

import { useWindowSize } from 'react-use';
import { useCasinoAudio } from '@/hooks/useCasinoAudio';
import { useBnbPrice } from '@/hooks/useBnbPrice';
import { Coin3D } from '@/components/games/Coin3D';
import { Dice3D } from '@/components/games/Dice3D';
import { LuckyRoll3D } from '@/components/games/LuckyRoll3D';
import { useWatchContractEvent } from 'wagmi';
import { useBalanceGuard } from '@/components/BalanceProvider';
import type { VRFStatus } from '@/components/ui/VRFResultModal';

const FOMO_TICKER_LIMIT = 5;
const GAME_TYPES = { flip: 0, luckyRoll: 1, dice: 2 };

export default function PlayRoom() {
    const bnbPrice = useBnbPrice();
    const { checkBalanceAndProceed } = useBalanceGuard();
    const params = useParams();
    const searchParams = useSearchParams();
    const houseAddress = params?.house as string || '0xDemoHouse...';
    const referrerFromUrl = searchParams.get('ref') as `0x${string}` | null;

    const { isConnected, address, chain } = useAccount();
    const addresses = getAddresses(chain?.id);
    const publicClient = usePublicClient();
    const nativeSymbol = 'BNB';
    const { data: balanceData, refetch: refetchBalance } = useBalance({ address });
    const [betAmountStr, setBetAmountStr] = useState<string>('');
    const [gameType, setGameType] = useState<'flip' | 'luckyRoll' | 'dice'>('flip');
    const [rollTarget, setRollTarget] = useState<number>(50);
    const [dieGuess, setDieGuess] = useState<number>(1);
    const [result, setResult] = useState<any>(null);
    const [won_local, setWonLocal] = useState<boolean>(false);
    const [lastGuess, setLastGuess] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isWaitingForOracle, setIsWaitingForOracle] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();
    // Capture the block number at which the bet TX was confirmed.
    // getLogs polls FROM this block so we never miss a fast VRF fulfillment.
    const betStartBlockRef = useRef<bigint | null>(null);
    // Stable refs for values needed inside the async poll loop to avoid stale closures.
    const lastGuessRef = useRef<'heads' | 'tails' | null>(null);
    const betAmountStrRef = useRef<string>('');

    // VRF Modal State
    const [isVrfModalOpen, setIsVrfModalOpen] = useState(false);
    const [vrfStatus, setVrfStatus] = useState<VRFStatus>('signing');
    const [lastTxHash, setLastTxHash] = useState<string>('');
    const [lastPayout, setLastPayout] = useState<string>('0');

    const [origin, setOrigin] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const { 
        playClick, 
        playHeartbeat, 
        stopHeartbeat, 
        playWin, 
        playLose, 
        playCoinSpin, 
        playDiceRoll, 
        playLuckyTick 
    } = useCasinoAudio();

    const copyReferralLink = () => {
        if (!address) {
            toast.error('Connect wallet to get your referral link', { id: 'bet-toast' });
            return;
        }
        navigator.clipboard.writeText(`${origin}/play/${houseAddress}?ref=${address}`);
        toast.success("Room referral link copied!", { id: 'bet-toast' });
    };

    const { data: vaultBalance, refetch: refetchVault } = useBalance({
        address: houseAddress as `0x${string}`,
    });

    const { data: banker } = useReadContract({
        address: houseAddress as `0x${string}`,
        abi: ABIS.HouseVault,
        functionName: 'banker',
    });

    const { data: bankerStake } = useReadContract({
        address: addresses.FunStaking as `0x${string}`,
        abi: ABIS.FunStaking,
        functionName: 'stakedBalance',
        args: banker ? [banker] : undefined,
        query: { enabled: !!banker }
    });

    const { data: houseMetadata } = useReadContract({
        address: houseAddress as `0x${string}`,
        abi: ABIS.HouseVault,
        functionName: 'metadata',
    });

    const { data: maxBetRatioData } = useReadContract({
        address: houseAddress as `0x${string}`,
        abi: ABIS.HouseVault,
        functionName: 'maxBetRatio',
    });

    const { data: hasReferrer } = useReadContract({
        address: addresses.BetRouter as `0x${string}`,
        abi: ABIS.BetRouter,
        functionName: 'userReferrer',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    });

    const vipTier1Min = parseEther('10000'); // 10k DOPA
    const vipTier2Min = parseEther('100000'); // 100k DOPA
    const currentStake = bankerStake ? BigInt(bankerStake.toString()) : 0n;
    const isVipTier1 = currentStake >= vipTier1Min;
    const isVipTier2 = currentStake >= vipTier2Min;
    const { data: expectedPayoutData } = useReadContract({
        address: addresses.BetRouter as `0x${string}`,
        abi: ABIS.BetRouter,
        functionName: 'getExpectedPayout',
        args: [
            GAME_TYPES[gameType],
            betAmountStr ? parseEther(betAmountStr) : 0n,
            gameType === 'flip' ? (lastGuess === 'heads' ? 1n : 0n) : (gameType === 'dice' ? BigInt(dieGuess) : BigInt(rollTarget))
        ],
        query: { enabled: !!betAmountStr && parseFloat(betAmountStr) > 0 }
    });

    const expectedPayout = expectedPayoutData ? Number(formatEther(expectedPayoutData as bigint)) : 0;
    const currentMultiplier = (expectedPayout > 0 && betAmountStr) ? expectedPayout / Number(betAmountStr) : (gameType === 'flip' ? 1.92 : (gameType === 'dice' ? 5.7 : (96 / rollTarget)));

    const [globalFomo, setGlobalFomo] = useState<any[]>([]);
    useWatchContractEvent({
        address: addresses.BetRouter as `0x${string}`,
        abi: ABIS.BetRouter,
        eventName: 'BetResolved',
        onLogs(logs) {
            logs.forEach(log => {
                const { user, won, payout, outcome, requestId } = (log as any).args;
                setGlobalFomo(prev => [{
                    user: (user as string).substring(0, 6) + '...',
                    won,
                    requestId: requestId?.toString(),
                    amount: formatEther(payout || 0n),
                    time: new Date().toLocaleTimeString()
                }, ...prev].slice(0, FOMO_TICKER_LIMIT));
            });
        },
    });

    const [isShaking, setIsShaking] = useState(false);

    const metadataUrl = houseMetadata && (houseMetadata.toString().startsWith('http') || houseMetadata.toString().startsWith('ipfs'))
        ? houseMetadata.toString().replace('ipfs://', 'https://ipfs.io/ipfs/')
        : null;

    // Use separate writeContract for bet vs bind to avoid shared state
    const { writeContract: writeBet, data: betTxHash, isPending: isBetPending, isError: isBetError, error: betError } = useWriteContract();
    const { writeContract: writeBind, isPending: isBindPending, isError: isBindError, error: bindError } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess, data: txReceipt } = useWaitForTransactionReceipt({ hash: betTxHash });

    const isFlipping = isBetPending || isTxConfirming || isWaitingForOracle;

    useEffect(() => {
        if (isBetError) {
            toast.error(getFriendlyError(betError), { id: 'bet-toast' });
            setIsVrfModalOpen(false);
        }
        if (isBindError) {
            toast.error(getFriendlyError(bindError), { id: 'bind-toast' });
        }
    }, [isBetError, betError, isBindError, bindError]);

    // Track VRF Status Lifecycle
    useEffect(() => {
        if (isBetPending) {
            setVrfStatus('signing');
            setIsVrfModalOpen(true);
        } else if (isTxConfirming) {
            setVrfStatus('pending');
            setIsVrfModalOpen(true);
        } else if (isWaitingForOracle) {
            setVrfStatus('verifying');
            setIsVrfModalOpen(true);
        } else if (result && !isFlipping) {
            setVrfStatus('resolved');
            // Keep open until user closes
        }
    }, [isBetPending, isTxConfirming, isWaitingForOracle, result, isFlipping]);

    useEffect(() => {
        if (betTxHash) setLastTxHash(betTxHash);
    }, [betTxHash]);

    const handleBet = (guess?: 'heads' | 'tails') => checkBalanceAndProceed((Number(betAmountStr) + 0.005).toString(), async () => {
        const amountVal = Number(betAmountStr);
        if (!amountVal || amountVal <= 0 || isNaN(amountVal)) {
            toast.error('Please enter a valid bet amount', { id: 'bet-toast' });
            return;
        }

        setResult(null);
        setLastGuess(gameType === 'flip' ? guess : gameType === 'dice' ? dieGuess : rollTarget);
        setShowConfetti(false);
        playClick();
        toast.loading(gameType === 'flip' ? 'Flipping coins...' : gameType === 'dice' ? 'Rolling dice...' : 'Rolling lucky roll...', { id: 'bet-toast' });

        if (gameType === 'flip') playCoinSpin();
        if (gameType === 'dice') playDiceRoll();

        if (amountVal > maxBetNumber) {
            toast.error(`Bet exceeds House limit (${formattedMaxBet} ${nativeSymbol}). Increase Banker Exposure.`, { id: 'bet-toast' });
            return;
        }

        const amountWei = parseEther(betAmountStr);

        if (gameType === 'flip') {
            writeBet({
                address: (addresses.BetRouter || '0x0000000000000000000000000000000000000000') as `0x${string}`,
                abi: ABIS.BetRouter as any,
                functionName: 'placeDoubleFlipBet',
                args: [(houseAddress as `0x${string}`) || '0x0000000000000000000000000000000000000000', guess === 'heads'],
                value: amountWei,
            });
        } else if (gameType === 'dice') {
            writeBet({
                address: (addresses.BetRouter || '0x0000000000000000000000000000000000000000') as `0x${string}`,
                abi: ABIS.BetRouter as any,
                functionName: 'placeDiceBet',
                args: [(houseAddress as `0x${string}`) || '0x0000000000000000000000000000000000000000', dieGuess],
                value: amountWei,
            });
        } else {
            writeBet({
                address: (addresses.BetRouter || '0x0000000000000000000000000000000000000000') as `0x${string}`,
                abi: ABIS.BetRouter as any,
                functionName: 'placeLuckyRollBet',
                args: [(houseAddress as `0x${string}`) || '0x0000000000000000000000000000000000000000', BigInt(rollTarget)],
                value: amountWei,
            });
        }
    });

    const handleBindReferrer = () => checkBalanceAndProceed('0.002', () => {
        if (!referrerFromUrl || referrerFromUrl === address) return;
        writeBind({
            address: addresses.BetRouter as `0x${string}`,
            abi: ABIS.BetRouter,
            functionName: 'bindReferrer',
            args: [referrerFromUrl],
        });
    });

    // Keep refs in sync so the async poll always uses the latest values
    useEffect(() => { lastGuessRef.current = lastGuess; }, [lastGuess]);
    useEffect(() => { betAmountStrRef.current = betAmountStr; }, [betAmountStr]);

    useEffect(() => {
        if (isFlipping) {
            playHeartbeat();
        } else {
            stopHeartbeat();
        }
    }, [isFlipping, playHeartbeat, stopHeartbeat]);

    useEffect(() => {
        if (isTxSuccess && txReceipt) {
            betStartBlockRef.current = txReceipt.blockNumber; // anchor getLogs from here
            setIsWaitingForOracle(true);
            toast.success('Bet Placed! Waiting for Chainlink VRF Oracle...', { id: 'bet-toast', duration: 4000 });
        }
    }, [isTxSuccess, txReceipt]);

    // Poll getLogs from the bet's confirmed block — more reliable than useWatchContractEvent.
    // useWatchContractEvent only watches NEW blocks; if VRF fires in block N+1 before the
    // watcher is set up, the event is permanently missed. getLogs always catches it.
    useEffect(() => {
        if (!isWaitingForOracle || !publicClient || !address || !houseAddress) return;

        let stopped = false;

        const BET_RESOLVED_EVENT = parseAbiItem(
            'event BetResolved(address indexed user, address indexed house, uint256 indexed requestId, bool won, uint256 payout, uint256 outcome, uint256 rawRandomness)'
        );

        const poll = async () => {
            while (!stopped) {
                try {
                    const logs = await publicClient.getLogs({
                        address: addresses.BetRouter as `0x${string}`,
                        event: BET_RESOLVED_EVENT,
                        args: {
                            user: address as `0x${string}`,
                            house: houseAddress as `0x${string}`,
                        },
                        fromBlock: betStartBlockRef.current ?? 'latest',
                        toBlock: 'latest',
                    });

                    if (logs.length > 0) {
                        stopped = true;
                        const log = logs[logs.length - 1]; // most recent result
                        const { won, payout, outcome, requestId, rawRandomness } = (log as any).args;
                        const payoutAmount = Number(payout ?? 0n) / 1e18;
                        const outcomeVal = Number(outcome ?? 0n);
                        const guess = lastGuessRef.current;

                        let displayResult;
                        if (gameType === 'flip') {
                            const flipResults = ['HEADS', 'TAILS'];
                            displayResult = flipResults[outcomeVal] || 'UNKNOWN';
                        } else if (gameType === 'dice') {
                            displayResult = `Outcome: ${outcomeVal}`;
                        } else {
                            displayResult = won ? `Won (${outcomeVal}, ${(96 / lastGuess).toFixed(2)}x)` : `Lost (${outcomeVal})`;
                        }

                        setResult(displayResult);
                        setWonLocal(won);
                        setIsWaitingForOracle(false);
                        setLastTxHash((log as any).transactionHash);

                        if (won) {
                            playWin();
                            setShowConfetti(true);
                            setIsShaking(true);
                            // Explosive confetti: more pieces, longer duration
                            setTimeout(() => setShowConfetti(false), 8000); 
                            setTimeout(() => setIsShaking(false), 1500);
                            setLastPayout(payoutAmount.toFixed(4));
                            toast.success(`Oracle Verified! You won ${payoutAmount.toFixed(4)} ${nativeSymbol}! 🎉`, { id: 'bet-toast', duration: 7000 });
                        } else {
                            playLose();
                            toast.error(`Oracle Verified! You lost ${Number(betAmountStrRef.current).toFixed(4)} ${nativeSymbol}. 💀`, { id: 'bet-toast', duration: 5000 });
                        }

                        refetchBalance();
                        refetchVault();

                        setHistory(prev => [{
                            address: address.substring(0, 6) + '...',
                            guess: gameType === 'flip' ? guess : gameType === 'dice' ? `Dice ${guess}` : `Target < ${guess}`,
                            result: displayResult,
                            won,
                            amount: won ? '+' + payoutAmount.toFixed(4) : '-' + Number(betAmountStrRef.current).toFixed(4)
                        }, ...prev].slice(0, 10));
                        return;
                    }
                } catch (e) {
                    console.warn('[VRF Poll] getLogs error:', e);
                }

                // Wait 2 seconds before next poll (BSC block time ≈ 3s)
                await new Promise(r => setTimeout(r, 2000));
            }
        };

        poll();

        // Cleanup: stop the loop if component unmounts or bet resolves
        return () => { stopped = true; };
    }, [isWaitingForOracle, publicClient, address, houseAddress]);

    const rawTvl = vaultBalance ? Number(vaultBalance.value) / 1e18 : 0;
    const formattedTvl = rawTvl.toFixed(4);

    // Calculate Max Bet allowed by Vault based on Max Payout Exposure
    // If it's a Virtual House, we can use both collateral AND GLP limit
    const maxExposure = vaultBalance && maxBetRatioData ? rawTvl * (Number(maxBetRatioData) / 10000) : 0;
    
    // For Virtual Houses, the contract now allows (betAmount <= collateral || glp.checkMaxBet)
    // We'll simplify the UI to show the collateral-based limit as the primary safe limit.
    const maxBetNumber = currentMultiplier > 0 ? (maxExposure / (currentMultiplier * 0.97)) * 0.999 : 0;
    const formattedMaxBet = maxBetNumber.toFixed(4);

    // Dynamic Min Bet
    const minBetNumber = maxBetNumber > 0 ? (maxBetNumber < 0.001 ? maxBetNumber : 0.001) : 0;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            {showConfetti && (
                <div className="fixed inset-0 z-[300] pointer-events-none">
                    <Confetti
                        width={width}
                        height={height}
                        recycle={false}
                        numberOfPieces={1500}
                        gravity={0.15}
                        colors={['#10b981', '#34d399', '#fbbf24', '#ffffff']}
                        initialVelocityY={20}
                    />
                </div>
            )}
            
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0 md:space-x-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 relative z-50">
                <div className="flex items-center space-x-3 w-full md:w-auto overflow-hidden">
                    {metadataUrl ? (
                        <Image src={metadataUrl} alt="Banker Logo" width={40} height={40} className="shrink-0 rounded-lg border border-zinc-800 object-cover" />
                    ) : (
                        <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                    )}
                    <div className="min-w-0 w-full">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-xs md:text-sm font-medium text-zinc-400">Playing at House</h2>
                            {isVipTier2 && <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />}
                            {isVipTier1 && !isVipTier2 && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <p className="font-mono text-xs md:text-sm text-white truncate">{houseAddress}</p>
                    </div>
                </div>
                <div className="flex flex-wrap space-x-6 space-y-4 items-center w-full md:w-auto bg-zinc-950/50 md:bg-transparent p-3 md:p-0 rounded-lg">
                    <div className="flex-1 min-w-[100px]">
                        <span className="text-zinc-500 block mb-1">TVL (Max Bet)</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{formattedTvl} {nativeSymbol}</span>
                            <span className="text-emerald-500/60 text-[10px] font-black">≈ ${(Number(formattedTvl) * bnbPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        <span className="text-zinc-400 text-[10px] md:text-xs tracking-tighter uppercase font-bold">Max Bet: {formattedMaxBet} {nativeSymbol}</span>
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <div className="flex items-center space-x-1 mb-1">
                            <span className="text-zinc-500 block">House Edge</span>
                            <div className="relative group cursor-help ml-1">
                                <HelpCircle className="w-3 h-3 md:w-4 md:h-4 text-zinc-500 hover:text-emerald-400 transition-colors" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-zinc-950 border border-emerald-500/30 rounded-lg text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[100]">
                                    <div className="font-bold text-emerald-400 mb-1 border-b border-zinc-800 pb-1">3% Platform Fee</div>
                                    <div className="flex justify-between"><span>Referrer (Buy-in):</span><span>0.5%</span></div>
                                    <div className="flex justify-between"><span>Treasury:</span><span>1.0%</span></div>
                                    <div className="flex justify-between"><span>Buyback & Staking:</span><span>1.0% ($DOPA)</span></div>
                                    <div className="flex justify-between text-emerald-400/80 font-bold mt-1 pt-1 border-t border-zinc-800"><span>Banker Commission:</span><span>0.5%</span></div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-950"></div>
                                </div>
                            </div>
                        </div>
                        <span className="text-emerald-400 font-medium block">{gameType === 'flip' ? '1.92x' : gameType === 'dice' ? '5.7x' : (96 / rollTarget).toFixed(2) + 'x'} Payout</span>
                        <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">
                            Win Prob: {gameType === 'flip' ? '50%' : gameType === 'dice' ? '16.6%' : rollTarget + '%'}
                        </span>
                    </div>
                    <div className="w-full md:w-auto md:pl-4 md:border-l border-zinc-800 pt-2 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0 text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            onClick={copyReferralLink}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Room
                        </Button>
                    </div>
                </div>
            </div>

            {/* Referrer Banner (If user came from link and hasn't bound) */}
            {referrerFromUrl && referrerFromUrl !== address && (!hasReferrer || hasReferrer === '0x0000000000000000000000000000000000000000') && (
                <div className="mb-6 p-4 bg-emerald-900/40 border border-emerald-500/50 rounded-lg flex justify-between items-center">
                    <div>
                        <h4 className="text-emerald-400 font-bold text-sm">You were invited!</h4>
                        <p className="text-zinc-300 text-xs mt-1">Bind your referrer to support them. They earn a commission on your volume.</p>
                    </div>
                    <Button variant="neon" size="sm" onClick={handleBindReferrer} disabled={isBindPending}>
                        Bind Referrer
                    </Button>
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-3 space-y-8 md:space-y-0 md:space-x-8 transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}>
                {/* Main Game Area */}
                <Card className={`md:col-span-2 overflow-hidden relative border-zinc-800 transition-all duration-500 ${isShaking ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : ''}`}>
                    {/* Subtle neon glow background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950 pointer-events-none"></div>

                    <CardContent className="pt-12 pb-8 flex flex-col items-center justify-center min-h-[400px] relative z-10">
                        {/* Game Type Switcher */}
                        <div className="mb-8 flex p-1 bg-zinc-900/80 rounded-lg border border-zinc-800 w-full max-w-[360px]">
                            <button
                                onClick={() => setGameType('flip')}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${gameType === 'flip' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Coin Flip
                            </button>
                            <button
                                onClick={() => setGameType('dice')}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${gameType === 'dice' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Dice Roll
                            </button>
                            <button
                                onClick={() => setGameType('luckyRoll')}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${gameType === 'luckyRoll' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Lucky Roll
                            </button>
                        </div>
                        {/* Main Interaction Area */}
                        <div className="flex-1 w-full flex flex-col items-center justify-center py-6">
                            {gameType === 'flip' ? (
                                <div className="flex flex-col items-center">
                                    <Coin3D 
                                        isFlipping={isFlipping} 
                                        result={result && result.includes('HEADS') ? 'HEADS' : result && result.includes('TAILS') ? 'TAILS' : null} 
                                    />
                                    <div className="text-center mt-12 mb-6">
                                        <p className="text-sm text-zinc-300 font-bold uppercase tracking-widest mb-1">
                                            {isFlipping ? 'Flipping...' : result ? (
                                                <span className={won_local ? 'text-yellow-400 animate-pulse' : 'text-zinc-500'}>
                                                    Outcome: {result}
                                                </span>
                                            ) : 'Prediction: ' + (lastGuess === 'heads' ? 'HEADS' : 'TAILS')}
                                        </p>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Win <span className="text-yellow-400">1.92x</span> on correct guess</p>
                                        <p className="text-[10px] text-zinc-600 mt-1 italic">Provably Fair Outcome • VRF Secured</p>
                                    </div>
                                </div>
                            ) : gameType === 'dice' ? (
                                <div className="flex flex-col items-center w-full max-w-sm">
                                    <Dice3D 
                                        isRolling={isFlipping} 
                                        result={result && typeof result === 'string' && result.includes('Outcome') ? Number(result.split(': ')[1]) : null} 
                                    />
                                    <div className="text-center mt-12 mb-8">
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4">Select Dice Number</p>
                                        <div className="grid grid-cols-6 space-x-2">
                                            {[1, 2, 3, 4, 5, 6].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => setDieGuess(num)}
                                                    className={`w-10 h-10 rounded-lg border-2 font-black transition-all ${dieGuess === num ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-4 uppercase tracking-tighter">Guess correct = <span className="text-emerald-400 font-bold text-xs">5.7x Payout</span></p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full max-w-sm">
                                    <LuckyRoll3D 
                                        isRolling={isFlipping} 
                                        result={result && typeof result === 'string' && (result.includes('Won') || result.includes('Lost')) ? Number(result.match(/\((\d+)/)?.[1]) : null} 
                                        onTick={playLuckyTick}
                                    />

                                    <div className="w-full space-y-4 mt-12 mb-8">
                                        <div className="flex justify-between items-end">
                                            <div className="text-left">
                                                <label className="text-xs text-zinc-400 font-black uppercase tracking-wider block">Roll Under</label>
                                                <span className="text-2xl font-black text-white">{rollTarget}</span>
                                            </div>
                                            <div className="text-right">
                                                <label className="text-xs text-zinc-400 font-bold uppercase tracking-widest block">Multiplier</label>
                                                <span className="text-2xl font-mono font-black text-emerald-400">{(96 / rollTarget).toFixed(2)}x</span>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="2"
                                            max="95"
                                            value={rollTarget}
                                            onChange={(e) => setRollTarget(Number(e.target.value))}
                                            className="w-full accent-emerald-500 bg-zinc-900 rounded-lg h-2 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-zinc-600 font-bold space-x-2">
                                            <span>HIGH RISK (96x)</span>
                                            <span>LOW RISK (1.01x)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bet Controls */}
                        <div className="w-full max-w-sm space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-all">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Wager Amount</label>
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="number"
                                                min={minBetNumber.toFixed(4)}
                                                max={formattedMaxBet}
                                                step="0.001"
                                                value={betAmountStr}
                                                onChange={(e) => setBetAmountStr(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-transparent text-2xl font-black text-white outline-none placeholder:text-zinc-800 min-w-0 no-spinner"
                                            />
                                            <span className="text-zinc-600 font-bold text-[10px] ml-1 shrink-0">{nativeSymbol}</span>
                                        </div>
                                        <div className="text-[10px] text-emerald-500/50 font-black tracking-widest uppercase mt-1 truncate">
                                            ≈ ${(Number(betAmountStr) * bnbPrice).toFixed(2)} USD
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex flex-col justify-center">
                                    <label className="block text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Potential Win</label>
                                    <div className="text-2xl font-black text-emerald-400 font-mono">
                                        {expectedPayout > 0 ? expectedPayout.toFixed(4) : (Number(betAmountStr) * currentMultiplier).toFixed(4)}
                                        <span className="text-[10px] ml-1.5 opacity-60">{nativeSymbol}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-emerald-500/40 uppercase">
                                        Net: +{((expectedPayout > 0 ? expectedPayout : Number(betAmountStr) * currentMultiplier) - Number(betAmountStr)).toFixed(4)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between space-x-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 font-mono text-xs border-zinc-800 hover:bg-zinc-800"
                                    onClick={() => setBetAmountStr(minBetNumber.toFixed(4))}
                                    disabled={isFlipping || !isConnected || maxBetNumber <= 0}
                                >
                                    Min
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 font-mono text-xs border-zinc-800 hover:bg-zinc-800"
                                    onClick={() => setBetAmountStr((maxBetNumber / 2).toFixed(4))}
                                    disabled={isFlipping || !isConnected || maxBetNumber <= 0}
                                >
                                    Half
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 font-mono text-xs border-zinc-800 hover:bg-zinc-800"
                                    onClick={() => {
                                        const userBal = balanceData ? Number(balanceData.formatted) : 0;
                                        const safeMax = Math.max(0, userBal - 0.002); // Preserve 0.002 BNB for gas
                                        const finalMax = Math.min(safeMax, maxBetNumber);
                                        setBetAmountStr(finalMax.toFixed(4));
                                    }}
                                    disabled={isFlipping || !isConnected || maxBetNumber <= 0}
                                >
                                    Max
                                </Button>
                            </div>

                            <p className="text-center text-[10px] text-zinc-500 font-medium tracking-tight">
                                Wallet: <span className="text-zinc-300">{balanceData ? Number(balanceData.formatted).toFixed(4) : '0.000'} {nativeSymbol}</span>
                            </p>

                            {/* Real-time Glowing Payout */}
                            <div className="text-center animate-pulse">
                                <span className="text-emerald-400 font-black text-sm tracking-widest drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    🔥 Win Payout: {expectedPayout > 0 ? expectedPayout.toFixed(4) : (Number(betAmountStr) * currentMultiplier).toFixed(4)} {nativeSymbol}
                                </span>
                            </div>

                            {gameType === 'flip' ? (
                                <div className="flex space-x-4">
                                    <Button
                                        className="flex-1 h-14 text-sm md:text-lg border-2 border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)] group"
                                        onClick={() => handleBet('heads')}
                                        disabled={isFlipping || !isConnected}
                                    >
                                        <span className="font-black text-yellow-500 group-hover:text-yellow-400 transition-colors uppercase">HEADS</span>
                                    </Button>
                                    <Button
                                        className="flex-1 h-14 text-sm md:text-lg border-2 border-zinc-400 bg-zinc-400/10 hover:bg-zinc-400/20 shadow-[0_0_20px_rgba(161,161,170,0.1)] group"
                                        onClick={() => handleBet('tails')}
                                        disabled={isFlipping || !isConnected}
                                    >
                                        <span className="font-black text-zinc-400 group-hover:text-zinc-300 transition-colors uppercase">TAILS</span>
                                    </Button>
                                </div>
                            ) : gameType === 'dice' ? (
                                <Button
                                    className="w-full h-14 text-lg border-2 border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] group"
                                    onClick={() => handleBet()}
                                    disabled={isFlipping || !isConnected}
                                >
                                    <span className="font-black text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase tracking-widest">ROLL DICE ({dieGuess})</span>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full h-14 text-lg border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] group"
                                    onClick={() => handleBet()}
                                    disabled={isFlipping || !isConnected}
                                >
                                    <span className="font-black text-purple-400 group-hover:text-purple-300 transition-colors uppercase tracking-widest">LUCKY ROLL (UNDER {rollTarget})</span>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Live Logs */}
                <Card className="h-full flex flex-col">
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                        <h3 className="font-medium text-white flex items-center space-x-2">
                            <History className="w-4 h-4 text-emerald-400" />
                            Your History
                        </h3>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px]">
                        {history.length === 0 ? (
                            <p className="text-zinc-500 text-sm text-center mt-4">No recent bets.</p>
                        ) : (
                            history.map((game, i) => (
                                <div key={i} className="text-sm flex justify-between items-center p-2 rounded bg-zinc-900/50">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-white">guessed {game.guess}</span>
                                    </div>
                                    {game.won ? (
                                        <div className="text-right">
                                            <p className="text-emerald-400 text-xl font-black italic">{Number(game.amount).toFixed(4)} {nativeSymbol}</p>
                                            <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-tighter">≈ ${(Number(game.amount) * bnbPrice).toFixed(2)} USD</p>
                                        </div>
                                    ) : (
                                        <span className="text-zinc-600">{Number(game.amount).toFixed(4)} {nativeSymbol}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            <VRFResultModal 
                isOpen={isVrfModalOpen}
                onClose={() => setIsVrfModalOpen(false)}
                status={vrfStatus}
                result={result}
                won={won_local}
                txHash={lastTxHash}
                betAmount={betAmountStr}
                payoutAmount={lastPayout}
                symbol={nativeSymbol}
                bnbPrice={bnbPrice}
            />
            <style jsx>{`
                .no-spinner::-webkit-outer-spin-button,
                .no-spinner::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .no-spinner {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
}
