'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { BalanceGuidanceModal } from './ui/BalanceGuidanceModal';

const MIN_REQUIRED_BALANCE = 0.005; // 0.005 BNB threshold

export function BalanceChecker() {
    const { authenticated, ready } = usePrivy();
    const { address, isConnected } = useAccount();
    const { data: balance, refetch } = useBalance({
        address: address,
    });
    
    const [isOpen, setIsOpen] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Reset check status when user changes or logs out
        if (!authenticated) {
            setHasChecked(false);
            return;
        }

        // Only run the check once per session/login when everything is ready
        if (ready && authenticated && isConnected && balance && !hasChecked) {
            const balanceValue = Number(balance.formatted);
            
            if (balanceValue < MIN_REQUIRED_BALANCE) {
                // Delay slightly to ensure UI is settled
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    setHasChecked(true);
                }, 1500);
                return () => clearTimeout(timer);
            } else {
                setHasChecked(true);
            }
        }
    }, [ready, authenticated, isConnected, balance, hasChecked]);

    const handleRefresh = async () => {
        const result = await refetch();
        if (result.data && Number(result.data.formatted) >= MIN_REQUIRED_BALANCE) {
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <BalanceGuidanceModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            userAddress={address || ''}
            currentBalance={balance?.formatted || '0'}
            requiredAmount={MIN_REQUIRED_BALANCE.toString()}
            onRefresh={handleRefresh}
        />
    );
}
