'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { BalanceGuidanceModal } from './ui/BalanceGuidanceModal';

interface BalanceContextType {
    checkBalanceAndProceed: (requiredBnb: string, onProceed: () => void) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { address, isConnected } = useAccount();
    const { data: balance, refetch } = useBalance({
        address: address,
    });

    const [isOpen, setIsOpen] = useState(false);
    const [requiredAmount, setRequiredAmount] = useState('0.005');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const checkBalanceAndProceed = useCallback((requiredBnb: string, onProceed: () => void) => {
        if (!isConnected || !balance) {
            onProceed(); // Fallback to wallet's own connection/error handling
            return;
        }

        const balanceValue = Number(balance.formatted);
        const requiredValue = Number(requiredBnb);

        if (balanceValue < requiredValue) {
            setRequiredAmount(requiredBnb);
            setPendingAction(() => onProceed);
            setIsOpen(true);
        } else {
            onProceed();
        }
    }, [isConnected, balance]);

    const handleClose = () => {
        setIsOpen(false);
        setPendingAction(null);
    };

    const handleRefresh = async () => {
        await refetch();
        // The balance update will trigger the logic if needed, 
        // but typically users will just close and retry.
        // We can check it again here if we want to auto-proceed.
    };

    return (
        <BalanceContext.Provider value={{ checkBalanceAndProceed }}>
            {children}
            <BalanceGuidanceModal 
                isOpen={isOpen}
                onClose={handleClose}
                userAddress={address || ''}
                currentBalance={balance?.formatted || '0'}
                requiredAmount={requiredAmount}
                onRefresh={handleRefresh}
            />
        </BalanceContext.Provider>
    );
};

export const useBalanceGuard = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalanceGuard must be used within a BalanceProvider');
    }
    return context;
};
