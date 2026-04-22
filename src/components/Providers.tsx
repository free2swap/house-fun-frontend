'use client';

import * as React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { LoadingScreen } from './ui/LoadingScreen';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { privyConfig } from '@/config/wagmi';
import { bscTestnet, bsc, hardhat } from 'viem/chains';
import { http, fallback } from 'viem';
import { BalanceProvider } from './BalanceProvider';

const queryClient = new QueryClient();

// Create Wagmi config natively using createConfig mapped from @privy-io/wagmi
const wagmiConfig = createConfig({
    chains: [bscTestnet, bsc, hardhat],
    batch: {
        multicall: true,
    },
    transports: {
        [bscTestnet.id]: fallback([
            http('https://bsc-testnet-rpc.publicnode.com'),
            http('https://data-seed-prebsc-1-s1.binance.org:8545/'),
            http('https://data-seed-prebsc-2-s1.binance.org:8545/'),
            http('https://bsc-testnet.drpc.org'),
            http('https://rpc.ankr.com/bsc_testnet_chapel')
        ]),
        [bsc.id]: fallback([
            http(process.env.NEXT_PUBLIC_ANKR_RPC_URL || 'https://rpc.ankr.com/bsc'),
            http(process.env.NEXT_PUBLIC_1RPC_URL || 'https://1rpc.io/bnb'),
            http('https://bsc-dataseed1.binance.org')
        ]),
        [hardhat.id]: http(),
    },
});

import { usePrivy } from '@privy-io/react-auth';
import { LazyMotion, domMax } from 'framer-motion';

function PrivyLoadingWrapper({ children }: { children: React.ReactNode }) {
    const { ready } = usePrivy();

    if (!ready) {
        return <LoadingScreen fullScreen={true} />;
    }

    return <>{children}</>;
}

import { BalanceChecker } from './BalanceChecker';

export function Providers({ children }: { children: React.ReactNode }) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    if (!appId) {
        return <div className="p-8 text-center text-red-400">Missing NEXT_PUBLIC_PRIVY_APP_ID in .env.local</div>;
    }

    return (
        <LazyMotion features={domMax}>
            <PrivyProvider
                appId={appId}
                config={privyConfig}
            >
                <PrivyLoadingWrapper>
                    <QueryClientProvider client={queryClient}>
                        <WagmiProvider config={wagmiConfig}>
                            <BalanceProvider>
                                <BalanceChecker />
                                {children}
                            </BalanceProvider>
                        </WagmiProvider>
                    </QueryClientProvider>
                </PrivyLoadingWrapper>
            </PrivyProvider>
        </LazyMotion>
    );
}
