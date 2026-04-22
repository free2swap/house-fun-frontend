'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { ADDRESSES, ABIS, getAddresses } from '@/abis/contracts';
import { useBnbPrice } from '@/hooks/useBnbPrice';
import { getFriendlyError } from '@/utils/error';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useBalanceGuard } from '@/components/BalanceProvider';
import { Link2, Coins, ArrowRightLeft, Hourglass, Copy, CheckCircle2, Zap, ShieldAlert, Rocket, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Link from 'next/link';

export default function AffiliatePage() {
    const bnbPrice = useBnbPrice();
    const { isConnected, address, chain } = useAccount();
    const { checkBalanceAndProceed } = useBalanceGuard();
    const addresses = getAddresses(chain?.id);
    const nativeSymbol = 'BNB';
    const [origin, setOrigin] = useState('');
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    // Fetch earned commissions
    const { data: commissionsData, refetch: refetchCommissions } = useReadContract({
        address: addresses.BetRouter as `0x${string}`,
        abi: ABIS.BetRouter,
        functionName: 'affiliateCommissions',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    });

    const { writeContract, data: txHash, isPending, isError, error } = useWriteContract();
    const { writeContract: writeCreateHouse, data: createHouseHash, isPending: isCreatingHouse, isError: isCreateError, error: createError } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });
    const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ hash: createHouseHash });

    const { data: existingHouse } = useReadContract({
        address: addresses.HouseFactory as `0x${string}`,
        abi: ABIS.HouseFactory,
        functionName: 'getHouseByBanker',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    });

    const handleClaim = () => checkBalanceAndProceed('0.005', async () => {
        writeContract({
            address: addresses.BetRouter as `0x${string}`,
            abi: ABIS.BetRouter,
            functionName: 'claimCommission',
        });
    });

    const { data: balanceData } = useBalance({ address });
    const userBalance = balanceData ? balanceData.value : 0n;
    const requiredCollateral = parseEther('0.1');

    const handleCreateVirtualHouse = () => checkBalanceAndProceed('0.105', async () => {
        toast.loading("Deploying Your Virtual Casino...", { id: 'create-house' });
        writeCreateHouse({
            address: addresses.HouseFactory as `0x${string}`,
            abi: ABIS.HouseFactory,
            functionName: 'createHouse',
            args: [3, 10000n, 0n], // Tier.VIRTUAL (3), 100% Max Bet, 0% Referrer Loss Fee
            value: requiredCollateral,
        });
    });

    useEffect(() => {
        if (isTxSuccess) {
            toast.success('Commission Claimed!');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); 
            refetchCommissions();
        }
    }, [isTxSuccess, refetchCommissions]);

    useEffect(() => {
        if (isCreateSuccess) {
            toast.success('Your Virtual Casino is LIVE! 🚀', { id: 'create-house' });
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [isCreateSuccess]);
    
    useEffect(() => {
        if (isError) {
            toast.error(getFriendlyError(error), { id: 'claim-house' });
        }
        if (isCreateError) {
            toast.error(getFriendlyError(createError), { id: 'create-house' });
        }
    }, [isError, error, isCreateError, createError]);

    const isClaiming = isPending || isTxConfirming;
    const claimableAmountData = commissionsData ? Number(commissionsData) / 1e18 : 0;
    const canClaim = claimableAmountData > 0 && !isClaiming;

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Link2 className="w-16 h-16 text-zinc-600 mb-4" />
                <h2 className="text-2xl font-bold text-white">Connect Wallet to Earn Referrals</h2>
                <p className="text-zinc-400">Join the viral Web3 casino affiliate network.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative min-h-screen">
            {showConfetti && (
                <div className="fixed inset-0 z-[100] pointer-events-none">
                    <Confetti
                        width={width}
                        height={height}
                        recycle={false}
                        numberOfPieces={800}
                        gravity={0.15}
                    />
                </div>
            )}

            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Affiliate Hub</h1>
                <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Turn your traffic into yield. Earn the base 1% platform fee + up to 50% Banker Loss Edge when your players get wiped out.</p>
            </div>

            {/* KOL ZERO-COST CASINO SECTION */}
            <div className="mb-20 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent" />
                
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <Zap className="w-4 h-4 fill-emerald-400" />
                        <span>KOL VIP Program</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">Launch Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic inline-block pr-2">Virtual House</span> with 0 Capital</h2>
                    <p className="text-zinc-500 mt-4 max-w-2xl mx-auto font-medium text-lg">Earn 1% Risk-Free Yield on Every Bet! We provide the bankroll, you bring the traffic. It's the ultimate Win-Win for creators.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    <Card className="bg-zinc-900/40 border-zinc-800 p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
                        <div className="space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Rocket className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 italic">Zero Setup Fee</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">Skip the 1-10 BNB setup cost. The <span className="text-emerald-400 font-bold">Virtual Tier</span> is designed for KOLs to scale instantly with <span className="text-white font-bold">0 capital risk</span> using shared protocol liquidity.</p>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "No Initial Liquidity Required",
                                    "Utilize Shared $GLP Reservoir",
                                    "Daily Rebates on Volume",
                                    "Instant Web3 Deployment"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center space-x-3 text-sm text-zinc-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-8">
                            {existingHouse && existingHouse !== '0x0000000000000000000000000000000000000000' ? (
                                <Link href={`/play/${existingHouse}`}>
                                    <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                                        GO TO YOUR CASINO <ExternalLink className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button 
                                    onClick={handleCreateVirtualHouse}
                                    disabled={isCreatingHouse || isCreateConfirming}
                                    className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black text-lg shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center leading-tight"
                                >
                                    {isCreatingHouse || isCreateConfirming ? (
                                        'DEPLOYING...'
                                    ) : (
                                        <>
                                            <span>CREATE VIRTUAL VAULT</span>
                                            <span className="text-[10px] opacity-60 font-medium">(0.1 {nativeSymbol} Buffer)</span>
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </Card>

                    <Card className="bg-zinc-950/50 border-zinc-800 p-8 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500/5 rounded-full blur-[120px]" />
                        <div className="space-y-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <ShieldAlert className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 italic">How it works?</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">We provide the bankroll, you provide the degens. It's a risk-free partnership model designed for massive scale.</p>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-zinc-800">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-zinc-500">Your Share of Player Loss</span>
                                    <span className="text-purple-400 font-black">15.0%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-zinc-500">Platform Trading Rebate</span>
                                    <span className="text-purple-400 font-black">0.5% (Vol)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-zinc-500">Max Bet Exposure</span>
                                    <span className="text-purple-400 font-black">1% of GLP</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 relative z-10">
                            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-bold uppercase tracking-widest leading-relaxed text-center">
                                * Virtual Bankers do not risk their own funds (beyond the initial 0.1 {nativeSymbol} buffer) but earn lower commissions compared to standard House Bankers.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* HERO LINK GENERATOR */}
            <Card className="mb-10 border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl flex justify-center items-center space-x-2"><Link2 className="w-6 h-6 text-emerald-400" /> Your Dedicated Promo Links</CardTitle>
                    <CardDescription className="text-base text-emerald-200/60">Share these everywhere to permanently bind users to your wallet.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 max-w-4xl mx-auto">
                        <div className="flex-1 bg-zinc-950/80 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between group hover:border-emerald-500 transition-colors">
                            <div className="mb-4">
                                <p className="text-sm text-emerald-400 font-bold mb-2 flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4" /> GLOBAL LOBBY LINK
                                </p>
                                <p className="text-lg text-white font-mono break-all leading-tight bg-zinc-900/50 p-4 rounded-lg">
                                    {origin}/lobby?ref={address}
                                </p>
                                <p className="text-xs text-zinc-500 mt-3">Directs traffic to the main lobby. Best for Twitter Bios and general marketing.</p>
                            </div>
                            <Button
                                variant="neon"
                                className="w-full h-12 text-sm font-bold tracking-wider"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${origin}/?ref=${address}`);
                                    toast.success('Global Link Copied to Clipboard!');
                                }}
                            >
                                <Copy className="w-5 h-5 mr-2" /> COPY LINK
                            </Button>
                        </div>

                        <div className="flex-1 bg-zinc-950/80 border border-purple-500/30 rounded-xl p-5 flex flex-col justify-between group hover:border-purple-500 transition-colors">
                            <div className="mb-4">
                                <p className="text-sm text-purple-400 font-bold mb-2 flex items-center space-x-2">
                                    <ArrowRightLeft className="w-4 h-4" /> SPECIFIC HOUSE LINK (HIGH YIELD)
                                </p>
                                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-lg">
                                    Navigate to any Banker's active <span className="text-purple-400 font-bold">Play Room</span> and click the <span className="text-white">"Share Room"</span> button.
                                </p>
                                <p className="text-xs text-zinc-500 mt-3">Used by sniper affiliates to target whale lobbies that offer huge 40-50% Loss Commissions.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 space-y-8 lg:space-y-0 lg:space-x-8 mb-8">
                {/* GIANT COMMISSION ODOMETER */}
                <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent pointer-events-none" />
                    <CardHeader className="pb-0">
                        <CardTitle className="flex justify-between items-center text-zinc-400 font-medium">
                            <span className="flex items-center space-x-2"><Coins className="w-5 h-5 text-emerald-500" /> Untapped Yield</span>
                            {claimableAmountData > 0 && <Hourglass className="w-4 h-4 text-emerald-500 animate-[spin_3s_linear_infinite]" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center text-center">
                        <div className="mb-8 w-full overflow-hidden">
                            <div className="flex items-baseline justify-center space-x-2">
                                <span className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-100 to-emerald-500 tabular-nums drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    <CountUp
                                        start={0}
                                        end={claimableAmountData}
                                        decimals={6}
                                        duration={2.5}
                                        separator=","
                                        useEasing={true}
                                    />
                                </span>
                                 <span className="text-xl sm:text-2xl font-bold text-zinc-500">{nativeSymbol}</span>
                            </div>
                            <p className="text-sm font-black text-emerald-500/50 uppercase tracking-tighter mt-1 italic">
                                ≈ ${(claimableAmountData * bnbPrice).toFixed(2)} USD
                            </p>
                            <p className="text-zinc-500 font-medium mt-4 tracking-widest uppercase text-xs sm:text-sm">Available for Withdrawal</p>
                        </div>

                        <Button
                            variant="neon"
                            size="lg"
                            className={`w-full max-w-md h-16 text-xl tracking-widest font-black transition-all duration-300 ${!canClaim && !isClaiming ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]'}`}
                            onClick={handleClaim}
                            disabled={!canClaim}
                        >
                            {isClaiming ? (
                                <span className="flex items-center space-x-3"><Hourglass className="w-6 h-6 animate-spin" /> EXECUTING...</span>
                            ) : claimableAmountData > 0 ? (
                                'CLAIM COMMISSION'
                            ) : (
                                'ZERO BALANCE'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6 flex flex-col justify-center">
                    <StatCard
                        title="Total Referred Volume"
                        value="Immutable"
                        trend="up"
                        description="Tracked on-chain permanently."
                    />
                    <StatCard
                        title="Maximum Potential"
                        value="50.0%"
                        trend="up"
                        description="Some Bankers share 50% of the player loss directly with you."
                    />
                    <StatCard
                        title="Settlement Delay"
                        value="0 Sec"
                        trend="neutral"
                        description="Immediate Web3 settlement via smart contract router."
                    />
                </div>
            </div>


        </div>
    );
}
