export interface HouseData {
    address: `0x${string}`;
    banker: `0x${string}`;
    balance: bigint;
    maxBetRatio: number;
    referrerLossFeePercent: number;
    metadata: string;
    isVipTier1: boolean;
    isVipTier2: boolean;
    isFeatured: boolean;
    isCertified: boolean;
}
