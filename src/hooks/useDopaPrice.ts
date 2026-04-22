'use client';

import { useReadContract, useAccount } from 'wagmi';
import { ADDRESSES, ABIS, getAddresses } from '@/abis/contracts';
import { useBnbPrice } from './useBnbPrice';

export function useDopaPrice() {
  const { chain } = useAccount();
  const addresses = getAddresses(chain?.id);
  const bnbPrice = useBnbPrice();

  const { data: bnbReserves } = useReadContract({
    address: addresses.FunBondingCurve as `0x${string}`,
    abi: ABIS.FunBondingCurve,
    functionName: 'virtualBnbReserves',
  });

  const { data: funReserves } = useReadContract({
    address: addresses.FunBondingCurve as `0x${string}`,
    abi: ABIS.FunBondingCurve,
    functionName: 'virtualFunReserves',
  });

  if (!bnbReserves || !funReserves || BigInt(funReserves.toString()) === 0n) {
    return { priceInBnb: 0, priceInUsd: 0 };
  }

  const priceInBnb = Number(bnbReserves) / Number(funReserves);
  const priceInUsd = priceInBnb * bnbPrice;

  return { priceInBnb, priceInUsd };
}
