'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  Flame, 
  Users, 
  Shield, 
  Cpu, 
  Activity,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// --- Data ---
const SUPPLY_DATA = [
  { name: 'Fair Launch (Curve)', value: 50, color: '#10b981' }, // emerald-500
  { name: 'GLP LP Rewards', value: 30, color: '#8b5cf6' }, // violet-500
  { name: 'Treasury (Team/CEX)', value: 20, color: '#3f3f46' }, // zinc-600
];

const REVENUE_DATA = [
  { name: 'Stakers (Real Yield)', value: 33.3, color: '#10b981' },
  { name: 'Auto Buyback & Burn', value: 33.3, color: '#f43f5e' }, // rose-500
  { name: 'Protocol Growth', value: 33.4, color: '#8b5cf6' },
];

const BONDING_DATA = [
  { price: 1, volume: 0 },
  { price: 1.2, volume: 10 },
  { price: 1.6, volume: 20 },
  { price: 2.2, volume: 30 },
  { price: 3.5, volume: 40 },
  { price: 5.0, volume: 50 }, // Target 50 BNB
];

// --- Components ---

const StatBox = ({ title, value, desc, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-${color}-500/10`} />
    <div className={`p-3 rounded-2xl bg-${color}-500/10 w-fit mb-4 border border-${color}-500/20`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <h4 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">{title}</h4>
    <div className="text-3xl font-black text-white flex items-baseline gap-2">
      {value}
    </div>
    <p className="text-zinc-400 text-xs mt-2 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const SectionHeader = ({ title, subtitle, badge }: any) => (
  <div className="text-center mb-16">
    {badge && (
      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
        {badge}
      </span>
    )}
    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">
      {title}
    </h2>
    <p className="text-zinc-400 max-w-2xl mx-auto font-medium">
      {subtitle}
    </p>
  </div>
);

export default function TokenomicsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-24 px-4 overflow-hidden selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- Hero Section --- */}
        <section className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            PROTOCOL ARCHITECTURE V4.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tightest leading-none uppercase italic mb-8"
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-purple-400">Flywheel</span> Trio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto font-medium"
          >
            DopaHouse is engineered as a self-sustaining DeFi GambleFi ecosystem where every bet placed fuels the liquidity, scarcity, and yield of $DOPA.
          </motion.p>
        </section>

        {/* --- The Trio Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <StatBox 
            title="Total Supply"
            value="1,000,000,000"
            desc="Strictly fixed supply. No secondary minting. Non-inflationary by design."
            icon={Coins}
            color="emerald"
          />
          <StatBox 
            title="Bonding Discovery"
            value="50 BNB Target"
            desc="One-way buy-in phase ensuring fair price discovery. Permanent 2-way trading follows."
            icon={Activity}
            color="purple"
          />
          <StatBox 
            title="Real Yield Rake"
            value="3.0%"
            desc="Every bet generates instant value for stakers, burns supply, and grows the protocol."
            icon={TrendingUp}
            color="blue"
          />
        </div>

        {/* --- Visual Analytics Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-48 items-center">
          <div className="space-y-12">
            <div>
              <h3 className="text-3xl font-black text-white tracking-widest uppercase italic mb-6">Distribution Model</h3>
              <p className="text-zinc-500 font-medium leading-relaxed italic">
                A massive 80% of $DOPA is distributed directly to the community via Fair Launch and Liquidity Rewards. The protocol is built on community-owned liquidity.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {SUPPLY_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-white font-black text-lg">{item.value}%</div>
                    <div className="text-zinc-500 text-[10px] font-bold uppercase">{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[400px] relative group">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] group-hover:bg-emerald-500/10 transition-all rounded-full" />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SUPPLY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={160}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {SUPPLY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-zinc-500 text-[10px] font-black tracking-[0.2em] uppercase">Total</span>
              <span className="text-4xl font-black text-white italic">1.0B</span>
              <span className="text-emerald-500 text-xs font-bold">$DOPA</span>
            </div>
          </div>
        </div>

        {/* --- Real Yield Breakdown --- */}
        <section className="mb-48">
          <SectionHeader 
            badge="The Value Stream"
            title="Real Yield & Buyback"
            subtitle="DopaHouse doesn't rely on token inflation. We capture value from protocol usage and redistribute it to long-term supporters."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 border-l-4 border-l-emerald-500">
                <h5 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                   1% Staking Dividends
                </h5>
                <p className="text-zinc-400 text-sm font-medium">Platform stakers receive non-inflationary yield paid directly in BNB from every bet placed across all houses.</p>
              </div>
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 border-l-4 border-l-rose-500">
                <h5 className="text-rose-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                   1% Buyback & Burn
                </h5>
                <p className="text-zinc-400 text-sm font-medium">Automatic engines use fees to market-buy $DOPA from the Curve and burn it, creating permanent deflationary pressure.</p>
              </div>
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 border-l-4 border-l-purple-500">
                <h5 className="text-purple-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                   1% Growth & Treasury
                </h5>
                <p className="text-zinc-400 text-sm font-medium">Fees allocated to ecosystem refinement, community airdrops, and maintaining high-speed betting infrastructure.</p>
              </div>
            </div>

            <div className="lg:col-span-2 h-[450px] bg-zinc-950/50 rounded-[40px] border border-zinc-800 p-8 order-1 lg:order-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={BONDING_DATA}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  />
                  <XAxis dataKey="volume" stroke="#3f3f46" tick={{ fontSize: 10 }} axisLine={false} />
                  <YAxis stroke="#3f3f46" tick={{ fontSize: 10 }} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Initial 5x Exponential Discovery Curve</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Advanced Architecture --- */}
        <section className="mb-48">
          <SectionHeader 
            badge="Dopamine Engine"
            title="Institutional Grade Tech"
            subtitle="Built with industry-leading security practices and provably fair logic to protect both players and bankers."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 rounded-[36px] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                  <Zap className="w-32 h-32 text-emerald-500" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Cpu className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-black text-white italic uppercase">Optimized Odds Engine</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    "192% Max Payout for rapid-play Double Flip",
                    "5.7x Payout on Standard 6-Sided Dice Roll",
                    "Customizable House Edge (min 4%) for Bankers",
                    "Gas-optimized resolution logic on BSC"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm font-medium">
                      <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
             </div>

             <div className="p-8 rounded-[36px] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                  <ShieldCheck className="w-32 h-32 text-purple-500" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-xl font-black text-white italic uppercase">Security Hardening</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    "Chainlink VRF V2.5 Integration for Verifiable Fate",
                    "4-Hour MEV Protection Refund Time-lock",
                    "ERC4626 Deep-Vesting Architecture for GLP",
                    "Audited Non-Custodial Vault Logic"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm font-medium">
                      <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="text-center bg-zinc-900/40 border border-zinc-800 rounded-[48px] p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-8 uppercase">
            Ready to <span className="text-emerald-400">Scale?</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-12 font-medium">
            Join the ecosystem as a whale banker and capture a share of the platform edge with the most advanced GambleFi toolkit on BSC.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/banker">
              <Button variant="neon" size="lg" className="h-16 px-12 text-lg font-black tracking-widest rounded-full uppercase italic group">
                Become the House <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/play">
              <Button variant="outline" size="lg" className="h-16 px-12 text-lg font-black tracking-widest rounded-full uppercase italic bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all">
                Test the Engine
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
