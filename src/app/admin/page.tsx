'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContracts, usePublicClient, useBalance } from 'wagmi';
import { ABIS, getAddresses } from '@/abis/contracts';
import { getFriendlyError } from '@/utils/error';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
    Activity, ShieldCheck, Megaphone, RefreshCcw, 
    PauseCircle, PlayCircle, Percent, Coins, Award, Star, 
    TrendingUp, Settings, AlertTriangle, Wallet, Lock,
    CheckCircle2, XCircle, Info, ChevronRight, Save, Zap, Users,
    LayoutDashboard, Database, ArrowUpRight, ArrowDownRight,
    PieChart as PieIcon, BarChart3, Globe, Landmark
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import toast from 'react-hot-toast';
import { formatEther, parseEther } from 'viem';

export default function AdminDashboard() {
    const { chain, address } = useAccount();
    const publicClient = usePublicClient();
    const addresses = getAddresses(chain?.id);
    const { writeContractAsync } = useWriteContract();
    
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

    // --- Contract Balances ---
    const { data: treasuryBal } = useBalance({ address: addresses.Treasury as `0x${string}` });
    const { data: routerBal } = useBalance({ address: addresses.BetRouter as `0x${string}` });
    const { data: glpBal } = useBalance({ address: addresses.GlobalLiquidityPool as `0x${string}` });
    const { data: stakingBal } = useBalance({ address: addresses.FunStaking as `0x${string}` });

    // --- Batch Data Fetching (Core Config & Global Stats) ---
    const { data: adminData, refetch } = useReadContracts({
        contracts: [
            // HouseFactory (0-8)
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'paused' },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'tier1StakeThreshold' },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'tier2StakeThreshold' },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'vipFeeDiscountBps' },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'tierConfigs', args: [0] },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'tierConfigs', args: [1] },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'tierConfigs', args: [2] },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'tierConfigs', args: [3] },
            { address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'totalHouses' },
            
            // BetRouter (9-17)
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'paused' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'teamFeePercent' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'buybackFeePercent' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'stakingFeePercent' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'affiliateFeePercent' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'bankerRebatePercent' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'virtualBankerRebatePercent' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'vipPlatformRakeDiscountBps' },
            { address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'refundTimeDelay' },

            // GLP (18-19)
            { address: addresses.GlobalLiquidityPool as `0x${string}`, abi: ABIS.GlobalLiquidityPool as any, functionName: 'paused' },
            { address: addresses.GlobalLiquidityPool as `0x${string}`, abi: ABIS.GlobalLiquidityPool as any, functionName: 'getPoolStats' },
            
            // FunStaking (20-21)
            { address: addresses.FunStaking as `0x${string}`, abi: ABIS.FunStaking as any, functionName: 'paused' },
            { address: addresses.FunStaking as `0x${string}`, abi: ABIS.FunStaking as any, functionName: 'totalStaked' },
        ] as any,
        query: { enabled: !!address, refetchInterval: 10000 }
    });

    const getVal = (idx: number) => adminData?.[idx]?.status === 'success' ? adminData[idx].result : undefined;

    // --- Fetch Houses for Explorer ---
    const totalHousesCount = Number((getVal(8) as bigint) || 0n);
    const houseIndices = useMemo(() => Array.from({ length: Math.min(totalHousesCount, 6) }, (_, i) => totalHousesCount - 1 - i), [totalHousesCount]);
    
    const { data: houseAddresses } = useReadContracts({
        contracts: (houseIndices.map(i => ({
            address: addresses.HouseFactory as `0x${string}`,
            abi: ABIS.HouseFactory as any,
            functionName: 'allHouses',
            args: [BigInt(i)]
        })) as any),
        query: { enabled: totalHousesCount > 0 }
    });

    const { data: houseStats } = useReadContracts({
        contracts: ((houseAddresses || []).flatMap((h: any) => h.status === 'success' ? [
            { address: h.result as `0x${string}`, abi: ABIS.HouseVault as any, functionName: 'banker' },
            { address: h.result as `0x${string}`, abi: ABIS.HouseVault as any, functionName: 'cumulativeDeposits' },
            { address: h.result as `0x${string}`, abi: ABIS.HouseVault as any, functionName: 'paused' },
        ] : []) as any),
        query: { enabled: !!houseAddresses, refetchInterval: 10000 }
    });

    const [houseBalances, setHouseBalances] = useState<string[]>([]);

    useEffect(() => {
        if (!houseAddresses || !publicClient) return;
        const fetchBals = async () => {
            const bals = await Promise.all(houseAddresses.map(async (h: any) => {
                if (h.status !== 'success') return '0';
                const b = await publicClient.getBalance({ address: h.result as `0x${string}` });
                return formatEther(b);
            }));
            setHouseBalances(bals);
        };
        fetchBals();
    }, [houseAddresses, publicClient]);

    // --- UI States & Sync ---
    const [feeConfig, setFeeConfig] = useState({ team: '', buyback: '', staking: '', affiliate: '', rebate: '' });
    const [virtualRebate, setVirtualRebate] = useState('');
    const [vipDiscount, setVipDiscount] = useState('');
    const [refundDelay, setRefundDelay] = useState('');
    const [thresholds, setThresholds] = useState({ t1: '', t2: '', discount: '' });
    const [tierInputs, setTierInputs] = useState<Record<number, { minLiq: string, fee: string }>>({
        0: { minLiq: '', fee: '' }, 1: { minLiq: '', fee: '' }, 2: { minLiq: '', fee: '' }, 3: { minLiq: '', fee: '' },
    });
    const [marketingAddr, setMarketingAddr] = useState({ certified: '', featured: '', exempt: '' });

    useEffect(() => {
        if (!adminData) return;
        setFeeConfig({
            team: getVal(10)?.toString() || '', buyback: getVal(11)?.toString() || '', staking: getVal(12)?.toString() || '',
            affiliate: getVal(13)?.toString() || '', rebate: getVal(14)?.toString() || '',
        });
        setVirtualRebate(getVal(15)?.toString() || '');
        setVipDiscount(getVal(16)?.toString() || '');
        setRefundDelay(getVal(17)?.toString() || '');
        setThresholds({
            t1: getVal(1) ? formatEther(getVal(1) as bigint) : '',
            t2: getVal(2) ? formatEther(getVal(2) as bigint) : '',
            discount: getVal(3)?.toString() || '',
        });
        const tiers: any = {};
        [0, 1, 2, 3].forEach(i => {
            const cfg = getVal(4 + i) as any;
            if (cfg) tiers[i] = { minLiq: formatEther(cfg[0]), fee: formatEther(cfg[1]) };
        });
        setTierInputs(tiers);
    }, [adminData]);

    const handleAction = async (msg: string, p: Promise<any>) => {
        const id = toast.loading(msg);
        try {
            const tx = await p;
            await publicClient?.waitForTransactionReceipt({ hash: tx });
            toast.success("Success!", { id });
            refetch();
        } catch (e: any) {
            toast.error(getFriendlyError(e), { id });
        }
    };

    const updateThresholds = () => {
        handleAction("Updating VIP Thresholds...", writeContractAsync({
            address: addresses.HouseFactory as `0x${string}`,
            abi: ABIS.HouseFactory as any,
            functionName: 'setVipThresholds',
            args: [parseEther(thresholds.t1), parseEther(thresholds.t2)]
        }));
    };

    const togglePause = (contract: string, addr: string, abi: any, current: boolean) => {
        const func = current ? 'unpause' : 'pause';
        handleAction(`${func === 'pause' ? 'Pausing' : 'Resuming'} ${contract}...`, writeContractAsync({
            address: addr as `0x${string}`,
            abi,
            functionName: func
        }));
    };

    const updateFeeConfig = () => {
        handleAction("Updating Fee Configuration...", writeContractAsync({
            address: addresses.BetRouter as `0x${string}`,
            abi: ABIS.BetRouter as any,
            functionName: 'setFeeConfig',
            args: [BigInt(feeConfig.team), BigInt(feeConfig.buyback), BigInt(feeConfig.staking), BigInt(feeConfig.affiliate), BigInt(feeConfig.rebate)]
        }));
    };

    const updateTier = (idx: number) => {
        handleAction(`Updating Tier ${idx}...`, writeContractAsync({
            address: addresses.HouseFactory as `0x${string}`,
            abi: ABIS.HouseFactory as any,
            functionName: 'setTierConfig',
            args: [idx, parseEther(tierInputs[idx].minLiq), parseEther(tierInputs[idx].fee)]
        }));
    };

    // --- Visualization Data ---
    const feeDistributionData = useMemo(() => [
        { name: 'Team', value: Number(feeConfig.team), color: '#10b981' },
        { name: 'Buyback', value: Number(feeConfig.buyback), color: '#3b82f6' },
        { name: 'Staking', value: Number(feeConfig.staking), color: '#8b5cf6' },
        { name: 'Affiliate', value: Number(feeConfig.affiliate), color: '#f59e0b' },
        { name: 'Rebate', value: Number(feeConfig.rebate), color: '#ec4899' },
    ].filter(d => d.value > 0), [feeConfig]);

    const growthPlaceholderData = [
        { date: '03-10', val: 0.5 }, { date: '03-12', val: 0.8 }, { date: '03-14', val: 1.5 },
        { date: '03-16', val: 2.2 }, { date: '03-18', val: Number(glpBal?.formatted || 0) + Number(treasuryBal?.formatted || 0) },
    ];

    return (
        <AdminGuard>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header & Tabs */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-zinc-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                             </div>
                             <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">Admin Protocol</h1>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Global infrastructure management and financial analytics.</p>
                    </div>

                    <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 shadow-inner">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" /> Ecosystem Overview
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Settings className="w-4 h-4" /> Protocol Systems
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Metric Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: 'Protocol TVL', value: `${(Number(glpBal?.formatted || 0) + Number(stakingBal?.formatted || 0) + (Number(treasuryBal?.formatted || 0))).toFixed(2)} BNB`, trend: '+12%', icon: Globe, color: 'text-emerald-500' },
                                { title: 'Treasury (Rev)', value: `${Number(treasuryBal?.formatted || 0).toFixed(4)} BNB`, trend: '+5.4%', icon: Landmark, color: 'text-blue-500' },
                                { title: 'DOPA Staked', value: `${Number(formatEther((getVal(21) as bigint) || 0n)).toLocaleString()} $DOPA`, trend: 'Active', icon: Coins, color: 'text-purple-500' },
                                { title: 'Live Houses', value: totalHousesCount.toString(), trend: 'Growing', icon: Home, color: 'text-orange-500' },
                            ].map((m, i) => (
                                <Card key={i} className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm overflow-hidden group hover:border-emerald-500/30 transition-colors">
                                    <CardContent className="p-6 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">{m.title}</p>
                                                <p className="text-2xl font-black text-white leading-none">{m.value}</p>
                                            </div>
                                            <div className={`p-2 rounded-lg bg-zinc-950/50 border border-zinc-800 ${m.color}`}>
                                                <m.icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                <ArrowUpRight className="w-3 h-3" /> {m.trend}
                                            </span>
                                            <span className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase">vs last 7d</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-zinc-900/40 border-zinc-800 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-emerald-500" /> Ecosystem TVL & Growth
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[250px] w-full pr-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthPlaceholderData}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                            <XAxis dataKey="date" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="val" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <PieIcon className="w-4 h-4 text-purple-500" /> Fee Distribution (BPS)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[250px] relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={feeDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {feeDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                 contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Total BPS</span>
                                        <span className="text-lg font-black text-white">{feeDistributionData.reduce((acc, d) => acc + d.value, 0)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* House Explorer */}
                        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm border-t-2 border-t-emerald-500/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-black flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" /> Protocol House Explorer
                                    </CardTitle>
                                    <CardDescription className="text-xs">Monitoring real-time performance of individual house vaults.</CardDescription>
                                </div>
                                <Button size="default" variant="outline" className="text-[10px] font-bold border-zinc-800" onClick={() => refetch()}>
                                    <RefreshCcw className="w-3 h-3 mr-1" /> REFRESH DATA
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-950/50 border-b border-zinc-800">
                                                <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left">House Vault</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left">Banker / Owner</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Current Balance</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Max Bet (Sim)</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50">
                                            {(houseAddresses || []).map((h: any, i) => {
                                                if (h.status !== 'success') return null;
                                                const baseIdx = i * 3;
                                                const banker = houseStats?.[baseIdx]?.result as string;
                                                const paused = houseStats?.[baseIdx + 2]?.result as boolean;
                                                const balance = houseBalances[i] || '0';
                                                
                                                return (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors group text-xs text-zinc-300">
                                                        <td className="px-6 py-4 text-left">
                                                            <div className="flex items-center gap-2 font-mono text-emerald-400">
                                                                <Database className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                                                {(h.result as string).slice(0, 6)}...{(h.result as string).slice(-4)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-left">
                                                            <div className="font-medium">
                                                                {banker ? `${banker.slice(0, 6)}...${banker.slice(-4)}` : 'UNKNOWN'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="font-black text-white">
                                                                {Number(balance).toFixed(4)} BNB
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-zinc-500">{(Number(balance) * 0.01).toFixed(4)} BNB</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${paused ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                                {paused ? 'Halted' : 'Live'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {totalHousesCount === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic text-sm">No houses have been initialized yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Affiliate & Revenue */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                             <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" /> Affiliate Program Health
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                                        <span className="text-xs text-zinc-400 font-medium">Unclaimed Commissions (Router)</span>
                                        <span className="text-sm font-black text-white">{Number(routerBal?.formatted || 0).toFixed(4)} BNB</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                                        <span className="text-xs text-zinc-400 font-medium">Affiliate Fee Rate</span>
                                        <span className="text-sm font-black text-blue-400">{feeConfig.affiliate || '0'} BPS</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 text-center italic">Commissions are automatically routed to the BetRouter contract upon every bet resolution.</p>
                                </CardContent>
                             </Card>

                             <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-purple-500" /> Yield & Dividends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                                        <span className="text-xs text-zinc-400 font-medium">Pending Staking Rewards</span>
                                        <span className="text-sm font-black text-white">{Number(stakingBal?.formatted || 0).toFixed(4)} BNB</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                                        <span className="text-xs text-zinc-400 font-medium">Staking Fee Rate</span>
                                        <span className="text-sm font-black text-purple-400">{feeConfig.staking || '0'} BPS</span>
                                    </div>
                                     <p className="text-[10px] text-zinc-600 text-center italic">BNB dividends are distributed proportionally to all $DOPA stakers.</p>
                                </CardContent>
                             </Card>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500 divide-y divide-zinc-800/20">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            <div className="xl:col-span-8 space-y-8">
                                {/* Section 1: Emergency Controls */}
                                <Card className="bg-zinc-900/40 border-zinc-800 border-l-4 border-l-red-500">
                                    <CardHeader>
                                        <CardTitle className="text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Emergency Protocols</CardTitle>
                                        <CardDescription>Instant kill-switch for protocol contracts.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { name: 'House Factory', addr: addresses.HouseFactory, paused: getVal(0), abi: ABIS.HouseFactory },
                                            { name: 'Bet Router', addr: addresses.BetRouter, paused: getVal(9), abi: ABIS.BetRouter },
                                            { name: 'Global Liquidity', addr: addresses.GlobalLiquidityPool, paused: getVal(18), abi: ABIS.GlobalLiquidityPool },
                                            { name: 'Fun Staking', addr: addresses.FunStaking, paused: getVal(20), abi: ABIS.FunStaking },
                                        ].map((c, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-zinc-200">{c.name}</p>
                                                    <p className={`text-[10px] font-black uppercase ${c.paused ? 'text-red-500' : 'text-emerald-500'}`}>
                                                        {c.paused ? 'SYSTEM PAUSED' : 'OPERATIONAL'}
                                                    </p>
                                                </div>
                                                <Button 
                                                    size="default"
                                                    variant={c.paused ? "default" : "destructive"} 
                                                    onClick={() => togglePause(c.name, c.addr as string, c.abi, !!c.paused)}
                                                    className="font-black text-[10px]"
                                                >
                                                    {c.paused ? <PlayCircle className="w-4 h-4 mr-1" /> : <PauseCircle className="w-4 h-4 mr-1" />}
                                                    {c.paused ? 'RESUME' : 'PAUSE'}
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Section 2: Fee Architecture */}
                                <Card className="bg-zinc-900/40 border-zinc-800 border-l-4 border-l-blue-500">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-blue-400 flex items-center gap-2"><Percent className="w-5 h-5" /> System Fee Configuration</CardTitle>
                                            <CardDescription>Adjust protocol-wide revenue distribution (BPS).</CardDescription>
                                        </div>
                                        <Button onClick={updateFeeConfig} size="sm" className="bg-blue-600 hover:bg-blue-700 font-bold">
                                            <Save className="w-4 h-4 mr-2" /> SAVE ALL
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {Object.keys(feeConfig).map((k) => (
                                                <div key={k} className="space-y-2">
                                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{k} Fee (BPS)</label>
                                                    <input 
                                                        value={(feeConfig as any)[k]} 
                                                        onChange={e => setFeeConfig({...feeConfig, [k]: e.target.value})} 
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-bold text-white focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="h-px bg-zinc-800/50" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-4 rounded-xl bg-black/20 border border-zinc-800 space-y-3">
                                                <label className="text-xs text-zinc-400 flex items-center gap-2 font-medium">
                                                    <Users className="w-3.5 h-3.5 text-blue-400" /> Virtual Rebate (BPS)
                                                </label>
                                                <div className="flex gap-2">
                                                    <input value={virtualRebate} onChange={e => setVirtualRebate(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm" />
                                                    <Button size="default" onClick={() => handleAction("Updating Rebate...", writeContractAsync({ address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'setVirtualBankerRebatePercent', args: [BigInt(virtualRebate)] }))}><Save className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-black/20 border border-zinc-800 space-y-3">
                                                <label className="text-xs text-zinc-400 flex items-center gap-2 font-medium">
                                                    <Star className="w-3.5 h-3.5 text-yellow-400" /> VIP Discount (BPS)
                                                </label>
                                                <div className="flex gap-2">
                                                    <input value={vipDiscount} onChange={e => setVipDiscount(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm" />
                                                    <Button size="default" onClick={() => handleAction("Updating VIP...", writeContractAsync({ address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'setVipPlatformRakeDiscountBps', args: [BigInt(vipDiscount)] }))}><Save className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-black/20 border border-zinc-800 space-y-3">
                                                <label className="text-xs text-zinc-400 flex items-center gap-2 font-medium">
                                                    <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" /> Refund Delay (s)
                                                </label>
                                                <div className="flex gap-2">
                                                    <input value={refundDelay} onChange={e => setRefundDelay(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm" />
                                                    <Button size="default" onClick={() => handleAction("Updating Delay...", writeContractAsync({ address: addresses.BetRouter as `0x${string}`, abi: ABIS.BetRouter as any, functionName: 'setRefundTimeDelay', args: [BigInt(refundDelay)] }))}><Save className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Section 3: VIP Thresholds */}
                                <Card className="bg-zinc-900/40 border-zinc-800 border-l-4 border-l-orange-500">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-orange-400 flex items-center gap-2"><Award className="w-5 h-5" /> Staked DOPA Thresholds</CardTitle>
                                            <CardDescription>Required $DOPA staking for VIP status.</CardDescription>
                                        </div>
                                        <Button onClick={updateThresholds} size="default" className="bg-orange-600 hover:bg-orange-700 font-bold">
                                            <Save className="w-4 h-4 mr-2" /> UPDATE THRESHOLDS
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-500 font-black uppercase">Tier 1 Required ($DOPA)</label>
                                            <input value={thresholds.t1} onChange={e => setThresholds({...thresholds, t1: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-500 font-black uppercase">Tier 2 Required ($DOPA)</label>
                                            <input value={thresholds.t2} onChange={e => setThresholds({...thresholds, t2: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm font-bold" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="xl:col-span-4 space-y-8">
                                {/* Section 4: Tier Settings */}
                                <Card className="bg-zinc-900/40 border-zinc-800 border-l-4 border-l-purple-500">
                                    <CardHeader>
                                        <CardTitle className="text-purple-400 flex items-center gap-2"><Award className="w-5 h-5" /> Tier Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[0, 1, 2, 3].map(i => (
                                            <div key={i} className="p-4 rounded-xl bg-black/40 border border-zinc-800 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase">{['Standard', 'VIP', 'Diamond', 'Virtual'][i]}</span>
                                                    <button onClick={() => updateTier(i)} className="text-[9px] text-purple-400 hover:text-white font-bold underline">UPDATE</button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] text-zinc-600 block uppercase font-bold">MIN LIQ</span>
                                                        <input value={tierInputs[i]?.minLiq || ''} onChange={e => setTierInputs({...tierInputs, [i]: {...tierInputs[i], minLiq: e.target.value}})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] text-zinc-600 block uppercase font-bold">FEE</span>
                                                        <input value={tierInputs[i]?.fee || ''} onChange={e => setTierInputs({...tierInputs, [i]: {...tierInputs[i], fee: e.target.value}})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Section 5: Marketing */}
                                <Card className="bg-zinc-900/40 border-zinc-800 border-l-4 border-l-emerald-500">
                                    <CardHeader>
                                        <CardTitle className="text-emerald-400 flex items-center gap-2"><Megaphone className="w-5 h-5" /> Marketing Tools</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                         <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-400 font-bold uppercase">Certified House</label>
                                            <div className="flex gap-2">
                                                <input value={marketingAddr.certified} onChange={e => setMarketingAddr({...marketingAddr, certified: e.target.value})} className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono" placeholder="0x..." />
                                                <Button size="default" onClick={() => handleAction("Certifying...", writeContractAsync({ address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'setCertification', args: [marketingAddr.certified as `0x${string}`, true] }))}>GRANT</Button>
                                            </div>
                                         </div>
                                         <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-400 font-bold uppercase">Featured House</label>
                                            <div className="flex gap-2">
                                                <input value={marketingAddr.featured} onChange={e => setMarketingAddr({...marketingAddr, featured: e.target.value})} className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono" placeholder="0x..." />
                                                <Button size="default" onClick={() => handleAction("Featuring...", writeContractAsync({ address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'setFeaturedStatus', args: [marketingAddr.featured as `0x${string}`, true] }))}>GRANT</Button>
                                            </div>
                                         </div>
                                         <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-400 font-bold uppercase">Fee Exemption</label>
                                            <div className="flex gap-2">
                                                <input value={marketingAddr.exempt} onChange={e => setMarketingAddr({...marketingAddr, exempt: e.target.value})} className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono" placeholder="0x..." />
                                                <Button size="default" onClick={() => handleAction("Exempting...", writeContractAsync({ address: addresses.HouseFactory as `0x${string}`, abi: ABIS.HouseFactory as any, functionName: 'setFeeExemption', args: [marketingAddr.exempt as `0x${string}`, true] }))}>GRANT</Button>
                                            </div>
                                         </div>
                                    </CardContent>
                                </Card>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}

function Home(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}
