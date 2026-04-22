'use client';

import { useReadContract } from 'wagmi';
import { ADDRESSES, ABIS } from '@/abis/contracts';
import { useEffect, useState } from 'react';

export function useBnbPrice() {
  const [bnbPrice, setBnbPrice] = useState<number>(600);

  const { data: priceData } = useReadContract({
    address: (ADDRESSES as any).BnbPriceFeed as `0x${string}`,
    abi: (ABIS as any).ChainlinkPriceFeed,
    functionName: 'latestRoundData',
    query: {
      refetchInterval: 30000, 
    }
  });

  const { data: decimals } = useReadContract({
    address: (ADDRESSES as any).BnbPriceFeed as `0x${string}`,
    abi: (ABIS as any).ChainlinkPriceFeed,
    functionName: 'decimals',
  });

  useEffect(() => {
    if (priceData && decimals !== undefined) {
      const priceRaw = (priceData as any)[1] as bigint;
      const dec = decimals as number;
      setBnbPrice(Number(priceRaw) / (10 ** dec));
    }
  }, [priceData, decimals]);

  return bnbPrice;
}
