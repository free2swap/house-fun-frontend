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
  if (chainId === bsc.id || chainId === 56) {
    return {
      DopaToken: '0x6804c586dD7d36491fFFEa1c87bA1D5429E4445A',
      FunStaking: '0x17cBa25c0bC89061527D47104218a516bd9f61b6',
      FunBondingCurve: '0xbcB8A244256b6ab679b006C59ADd6226F3a6D910',
      BuybackManager: '0x1cE6A30E2E6942837e02F5d61CdB1B9fBb9E41cc',
      GlobalLiquidityPool: '0x734d6c7AD12c159C7fA1A79Ec6C34Fd250Ff2765',
      BetRouter: '0x741b1e577Ef62422f5f2E9de5aF98e2cd308A73b',
      HouseFactory: '0x4D6f33377AF30a45B48CE3c7A1C0968afAb7A749',
      Treasury: '0xB5EA803c16BbaDFea1A3D0F87A62CBCdCD1043e0',
      VirtualVaultImpl: '0x112889b07446e58eA18c61cc21C412260470c72f',
      Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x0567F2323251D0Aab15c8dFb1967E4E8A7D42aeE',
      PancakeRouter: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      USDT: '0x55d398326f99059fF775485246999027B3197955',
      WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      FunToken: '0x6804c586dD7d36491fFFEa1c87bA1D5429E4445A',
    };
  }

  // BSC Testnet
  if (chainId === bscTestnet.id || chainId === 97) {
    return {
      DopaToken: '0x25b575BbEFCc411c467CFC62DdD7172a4Fa8a50c',
      FunStaking: '0x4EF676145D7Df00B245A4864cBdCCC42419191D5',
      FunBondingCurve: '0x2661e4CF94Cbf34eaE3809DFe3801885017Fa172',
      BuybackManager: '0xFcfb24fc3300bD6ca9B8D32eeaca59531A9EF02a',
      GlobalLiquidityPool: '0xDc751907eB99C0766396746bFafA844285d52910',
      BetRouter: '0xf1E96D30071B00F9C190588BF2c24e4107B6e1b0',
      HouseFactory: '0xC02452c1B7cA6F81D34dB6AE2D0B6a3c76eADB6A',
      Treasury: '0x28DA7CD7826716A5178f057f843d5B1b87e04097',
      VirtualVaultImpl: '0x3B376cb848BC9d942e2E665525037F0F4a2EfDfd',
      Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
      PancakeRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
      USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
      FunToken: '0x25b575BbEFCc411c467CFC62DdD7172a4Fa8a50c',
    };
  }

  // Base Mainnet (Released from ENV to save space)
  if (chainId === base.id || chainId === 8453) {
    return {
      DopaToken: '', FunStaking: '', FunBondingCurve: '', BuybackManager: '',
      GlobalLiquidityPool: '', BetRouter: '', HouseFactory: '', Treasury: '',
      VirtualVaultImpl: '', Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
      PancakeRouter: '', USDT: '', WBNB: '0x4200000000000000000000000000000000000006',
      FunToken: '',
    };
  }

  // opBNB Mainnet
  if (chainId === opBNB.id || chainId === 204) {
    return {
      DopaToken: '', FunStaking: '', FunBondingCurve: '', BuybackManager: '',
      GlobalLiquidityPool: '', BetRouter: '', HouseFactory: '', Treasury: '',
      VirtualVaultImpl: '', Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
      BnbPriceFeed: '0x0567F2323251D0Aab15c8dFb1967E4E8A7D42aeE',
      PancakeRouter: '', USDT: '', WBNB: '0x4200000000000000000000000000000000000006',
      FunToken: '',
    };
  }

  // Local / Hardhat / Default (Keep individual ENV for dev flexibility)
  return {
    DopaToken: process.env.NEXT_PUBLIC_HARDHAT_DOPA_TOKEN || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    FunStaking: process.env.NEXT_PUBLIC_HARDHAT_FUN_STAKING || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    FunBondingCurve: process.env.NEXT_PUBLIC_HARDHAT_FUN_BONDING_CURVE || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    BuybackManager: process.env.NEXT_PUBLIC_HARDHAT_BUYBACK_MANAGER || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    GlobalLiquidityPool: process.env.NEXT_PUBLIC_HARDHAT_GLOBAL_LIQUIDITY_POOL || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    BetRouter: process.env.NEXT_PUBLIC_HARDHAT_BET_ROUTER || '0x9A676e781A523b5d0C0e43731313A708CB607508',
    HouseFactory: process.env.NEXT_PUBLIC_HARDHAT_HOUSE_FACTORY || '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
    Treasury: process.env.NEXT_PUBLIC_HARDHAT_TREASURY || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    VirtualVaultImpl: process.env.NEXT_PUBLIC_HARDHAT_VIRTUAL_VAULT_IMPL || '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
    BnbPriceFeed: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
    PancakeRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    FunToken: process.env.NEXT_PUBLIC_HARDHAT_DOPA_TOKEN || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
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
