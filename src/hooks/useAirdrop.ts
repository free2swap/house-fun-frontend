import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

interface PointsData {
    points: number;
    invited_count: number;
    wallet_address?: string;
    username?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001/api';

export function useAirdrop() {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPoints = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/user-data/${address}`);
            if (res.ok) {
                const data = await res.json();
                setPointsData(data);
                setError(null);
            } else {
                setPointsData(null);
                if (res.status === 404) {
                    setError('Wallet not bound');
                }
            }
        } catch (e) {
            console.error('Fetch points error:', e);
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    const bindWallet = async (tgId: string) => {
        if (!address || !tgId) return { success: false, error: 'Missing information' };
        setLoading(true);
        try {
            const message = `Bind my wallet ${address.toLowerCase()} to DopaHouse TG ID ${tgId}`;
            const signature = await signMessageAsync({ message });

            const res = await fetch(`${API_BASE}/bind-wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    tg_id: parseInt(tgId), 
                    wallet_address: address, 
                    signature 
                }),
            });

            const result = await res.json();
            if (res.ok) {
                await fetchPoints();
                return { success: true };
            } else {
                return { success: false, error: result.error || 'Unknown server error' };
            }
        } catch (e: any) {
            console.error('Bind error:', e);
            return { success: false, error: e.message || 'Signature rejected or network error' };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && address) {
            fetchPoints();
        }
    }, [address, isConnected]);

    return {
        pointsData,
        loading,
        error,
        fetchPoints,
        bindWallet,
        isConnected
    };
}
