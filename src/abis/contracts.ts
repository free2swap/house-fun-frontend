import { bsc, bscTestnet, hardhat, base, opBNB } from 'viem/chains';


// Import ABIs from JSON files
import BetRouterAbi from './BetRouter.json';
import BuybackManagerAbi from './BuybackManager.json';
import DopaTokenAbi from './DopaToken.json';
import FunBondingCurveAbi from './FunBondingCurve.json';
import FunStakingAbi from './FunStaking.json';
import GlobalLiquidityPoolAbi from './GlobalLiquidityPool.json';
import HouseFactoryAbi from './HouseFactory.json';
import HouseVaultAbi from './HouseVault.json';
import VirtualVaultAbi from './VirtualVault.json';

export const getAddresses = (chainId: number | undefined) => {
  // BSC Mainnet
  if (chainId === bsc.id) {
    return {
      DopaToken: process.env.NEXT_PUBLIC_BSC_MAINNET_DOPA_TOKEN,
      FunStaking: process.env.NEXT_PUBLIC_BSC_MAINNET_FUN_STAKING,
      FunBondingCurve: process.env.NEXT_PUBLIC_BSC_MAINNET_FUN_BONDING_CURVE,
      BuybackManager: process.env.NEXT_PUBLIC_BSC_MAINNET_BUYBACK_MANAGER,
      GlobalLiquidityPool: process.env.NEXT_PUBLIC_BSC_MAINNET_GLOBAL_LIQUIDITY_POOL,
      BetRouter: process.env.NEXT_PUBLIC_BSC_MAINNET_BET_ROUTER,
      HouseFactory: process.env.NEXT_PUBLIC_BSC_MAINNET_HOUSE_FACTORY,
      Treasury: process.env.NEXT_PUBLIC_BSC_MAINNET_TREASURY,
      VirtualVaultImpl: process.env.NEXT_PUBLIC_BSC_MAINNET_VIRTUAL_VAULT_IMPL,
      Multicall3: process.env.NEXT_PUBLIC_BSC_MAINNET_MULTICALL3 || '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x0567F2323251D0Aab15c8dFb1967E4E8A7D42aeE',
      PancakeRouter: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      USDT: '0x55d398326f99059fF775485246999027B3197955',
      WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      // Compatibility alias
      FunToken: process.env.NEXT_PUBLIC_BSC_MAINNET_DOPA_TOKEN,
    };
  }

  // BSC Testnet
  if (chainId === bscTestnet.id || chainId === 97) {
    return {
      DopaToken: process.env.NEXT_PUBLIC_BSC_TESTNET_DOPA_TOKEN,
      FunStaking: process.env.NEXT_PUBLIC_BSC_TESTNET_FUN_STAKING,
      FunBondingCurve: process.env.NEXT_PUBLIC_BSC_TESTNET_FUN_BONDING_CURVE,
      BuybackManager: process.env.NEXT_PUBLIC_BSC_TESTNET_BUYBACK_MANAGER,
      GlobalLiquidityPool: process.env.NEXT_PUBLIC_BSC_TESTNET_GLOBAL_LIQUIDITY_POOL,
      BetRouter: process.env.NEXT_PUBLIC_BSC_TESTNET_BET_ROUTER,
      HouseFactory: process.env.NEXT_PUBLIC_BSC_TESTNET_HOUSE_FACTORY,
      Treasury: process.env.NEXT_PUBLIC_BSC_TESTNET_TREASURY,
      VirtualVaultImpl: process.env.NEXT_PUBLIC_BSC_TESTNET_VIRTUAL_VAULT_IMPL,
      Multicall3: process.env.NEXT_PUBLIC_BSC_TESTNET_MULTICALL3 || '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
      PancakeRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
      USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
      // Compatibility alias
      FunToken: process.env.NEXT_PUBLIC_BSC_TESTNET_DOPA_TOKEN,
    };
  }

  // Base Mainnet
  if (chainId === base.id || chainId === 8453) {
    return {
      DopaToken: process.env.NEXT_PUBLIC_BASE_MAINNET_DOPA_TOKEN,
      FunStaking: process.env.NEXT_PUBLIC_BASE_MAINNET_FUN_STAKING,
      FunBondingCurve: process.env.NEXT_PUBLIC_BASE_MAINNET_FUN_BONDING_CURVE,
      BuybackManager: process.env.NEXT_PUBLIC_BASE_MAINNET_BUYBACK_MANAGER,
      GlobalLiquidityPool: process.env.NEXT_PUBLIC_BASE_MAINNET_GLOBAL_LIQUIDITY_POOL,
      BetRouter: process.env.NEXT_PUBLIC_BASE_MAINNET_BET_ROUTER,
      HouseFactory: process.env.NEXT_PUBLIC_BASE_MAINNET_HOUSE_FACTORY,
      Treasury: process.env.NEXT_PUBLIC_BASE_MAINNET_TREASURY,
      VirtualVaultImpl: process.env.NEXT_PUBLIC_BASE_MAINNET_VIRTUAL_VAULT_IMPL,
      Multicall3: process.env.NEXT_PUBLIC_BASE_MAINNET_MULTICALL3 || '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70', // ETH/USD on Base
      PancakeRouter: '', 
      USDT: '', 
      WBNB: '0x4200000000000000000000000000000000000006', // WETH on Base
      FunToken: process.env.NEXT_PUBLIC_BASE_MAINNET_DOPA_TOKEN,
    };
  }

  // opBNB Mainnet
  if (chainId === opBNB.id || chainId === 204) {
    return {
      DopaToken: process.env.NEXT_PUBLIC_OPBNB_MAINNET_DOPA_TOKEN,
      FunStaking: process.env.NEXT_PUBLIC_OPBNB_MAINNET_FUN_STAKING,
      FunBondingCurve: process.env.NEXT_PUBLIC_OPBNB_MAINNET_FUN_BONDING_CURVE,
      BuybackManager: process.env.NEXT_PUBLIC_OPBNB_MAINNET_BUYBACK_MANAGER,
      GlobalLiquidityPool: process.env.NEXT_PUBLIC_OPBNB_MAINNET_GLOBAL_LIQUIDITY_POOL,
      BetRouter: process.env.NEXT_PUBLIC_OPBNB_MAINNET_BET_ROUTER,
      HouseFactory: process.env.NEXT_PUBLIC_OPBNB_MAINNET_HOUSE_FACTORY,
      Treasury: process.env.NEXT_PUBLIC_OPBNB_MAINNET_TREASURY,
      VirtualVaultImpl: process.env.NEXT_PUBLIC_OPBNB_MAINNET_VIRTUAL_VAULT_IMPL,
      Multicall3: process.env.NEXT_PUBLIC_OPBNB_MAINNET_MULTICALL3 || '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x0567F2323251D0Aab15c8dFb1967E4E8A7D42aeE', // Fallback to L1 BNB
      PancakeRouter: '',
      USDT: '',
      WBNB: '0x4200000000000000000000000000000000000006',
      FunToken: process.env.NEXT_PUBLIC_OPBNB_MAINNET_DOPA_TOKEN,
    };
  }


  // Local / Hardhat / Default
  return {
    DopaToken: process.env.NEXT_PUBLIC_HARDHAT_DOPA_TOKEN || process.env.NEXT_PUBLIC_BSC_TESTNET_DOPA_TOKEN,
    FunStaking: process.env.NEXT_PUBLIC_HARDHAT_FUN_STAKING || process.env.NEXT_PUBLIC_BSC_TESTNET_FUN_STAKING,
    FunBondingCurve: process.env.NEXT_PUBLIC_HARDHAT_FUN_BONDING_CURVE || process.env.NEXT_PUBLIC_BSC_TESTNET_FUN_BONDING_CURVE,
    BuybackManager: process.env.NEXT_PUBLIC_HARDHAT_BUYBACK_MANAGER || process.env.NEXT_PUBLIC_BSC_TESTNET_BUYBACK_MANAGER,
    GlobalLiquidityPool: process.env.NEXT_PUBLIC_HARDHAT_GLOBAL_LIQUIDITY_POOL || process.env.NEXT_PUBLIC_BSC_TESTNET_GLOBAL_LIQUIDITY_POOL,
    BetRouter: process.env.NEXT_PUBLIC_HARDHAT_BET_ROUTER || process.env.NEXT_PUBLIC_BSC_TESTNET_BET_ROUTER,
    HouseFactory: process.env.NEXT_PUBLIC_HARDHAT_HOUSE_FACTORY || process.env.NEXT_PUBLIC_BSC_TESTNET_HOUSE_FACTORY,
    Treasury: process.env.NEXT_PUBLIC_HARDHAT_TREASURY || process.env.NEXT_PUBLIC_BSC_TESTNET_TREASURY,
    VirtualVaultImpl: process.env.NEXT_PUBLIC_HARDHAT_VIRTUAL_VAULT_IMPL || process.env.NEXT_PUBLIC_BSC_TESTNET_VIRTUAL_VAULT_IMPL,
    Multicall3: process.env.NEXT_PUBLIC_HARDHAT_MULTICALL3 || process.env.NEXT_PUBLIC_BSC_TESTNET_MULTICALL3 || '0xcA11bde05977b3631167028862bE2a173976CA11',
    BnbPriceFeed: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
    PancakeRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    // Compatibility aliases
    FunToken: process.env.NEXT_PUBLIC_HARDHAT_DOPA_TOKEN || process.env.NEXT_PUBLIC_BSC_TESTNET_DOPA_TOKEN,
    HouseVault: process.env.NEXT_PUBLIC_HARDHAT_HOUSE_VAULT,
  };
};

// Default setup for BSC Mainnet (ID: 56)
export const ADDRESSES = getAddresses(56);


export const ABIS = {
  "BetRouter": BetRouterAbi,
  "BuybackManager": BuybackManagerAbi,
  "DopaToken": DopaTokenAbi,
  "FunBondingCurve": FunBondingCurveAbi,
  "FunStaking": FunStakingAbi,
  "GlobalLiquidityPool": GlobalLiquidityPoolAbi,
  "HouseFactory": HouseFactoryAbi,
  "HouseVault": HouseVaultAbi,
  "VirtualVault": VirtualVaultAbi,
  "FunToken": DopaTokenAbi, // Alias
  "ChainlinkPriceFeed": [
    {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"}
  ],
  "PancakeRouter": [
    {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"}
  ],
} as const;
