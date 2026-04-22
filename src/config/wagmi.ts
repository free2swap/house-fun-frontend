import { http, fallback } from 'viem';
import { bsc, bscTestnet, hardhat, base, opBNB } from 'viem/chains';


import type { PrivyClientConfig } from '@privy-io/react-auth';

// Replace RainbowKit's getDefaultConfig with standard Viem chains for Privy Wagmi
export const publicClientConfig = {
    chains: [bsc, bscTestnet, base, opBNB, hardhat] as const,

    transports: {
        [bscTestnet.id]: fallback([
            http('https://bsc-testnet-rpc.publicnode.com'),
            http('https://data-seed-prebsc-1-s1.binance.org:8545/'),
            http('https://data-seed-prebsc-2-s1.binance.org:8545/'),
            http('https://bsc-testnet.drpc.org'),
            http('https://rpc.ankr.com/bsc_testnet_chapel'),
        ]),
        [bsc.id]: fallback([
            http(process.env.NEXT_PUBLIC_ANKR_RPC_URL || 'https://rpc.ankr.com/bsc'),
            http(process.env.NEXT_PUBLIC_1RPC_URL || 'https://1rpc.io/bnb'),
            http('https://bsc-dataseed1.binance.org'),
        ]),
        [base.id]: http('https://mainnet.base.org'),
        [opBNB.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
        [hardhat.id]: http(),
    },

    pollingInterval: 2_000, // 2s global polling for event watching
};

export const privyConfig: PrivyClientConfig = {
    loginMethods: ['telegram', 'wallet', 'email', 'google'],
    embeddedWallets: {
        ethereum: {
            createOnLogin: 'users-without-wallets',
        },
    },
    appearance: {
        theme: 'dark',
        accentColor: '#10b981', // emerald-500
        logo: '/logo.png', // New premium borderless logo
    },
    supportedChains: [bsc, bscTestnet, base, opBNB, hardhat],

    // Disable Coinbase Smart Wallet — it doesn't support BSC Testnet / Hardhat
    // and causes a connector initialization timeout that blocks the "ready" state
    // externalWallets: {
    //     coinbaseWallet: {
    //         connectionOptions: 'eoaOnly',
    //     },
    // },
};
