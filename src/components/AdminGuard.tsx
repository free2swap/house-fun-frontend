'use client';

import { useAccount, useReadContract } from 'wagmi';
import { ABIS, getAddresses } from '@/abis/contracts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CircleAlert, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { address, isConnected, chain } = useAccount();
    const addresses = getAddresses(chain?.id);
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Check ownership of HouseFactory as a proxy for platform admin
    const { data: owner, isLoading } = useReadContract({
        address: addresses.HouseFactory as `0x${string}`,
        abi: ABIS.HouseFactory,
        functionName: 'owner',
    });

    if (!isMounted) return null;

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <CircleAlert className="w-16 h-16 text-yellow-500" />
                <h1 className="text-2xl font-bold">Wallet Not Connected</h1>
                <p className="text-zinc-400">Please connect your administrator wallet to continue.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="mt-4 text-zinc-400">Verifying administrator permissions...</p>
            </div>
        );
    }

    const isAdmin = owner && address && (owner as string).toLowerCase() === address.toLowerCase();

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">Access Denied</h1>
                    <p className="text-zinc-400 max-w-md">
                        This area is restricted to platform administrators. 
                        Your wallet address ({address?.slice(0, 6)}...{address?.slice(-4)}) does not have required permissions.
                    </p>
                </div>
                <Button onClick={() => router.push('/')} variant="outline">
                    Return to Home
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}

import { ShieldCheck } from 'lucide-react';
