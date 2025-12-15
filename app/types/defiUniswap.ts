import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Address, PublicClient, WalletClient } from "viem";
import { CustomToken } from "./chain";
import { DefiPool } from "./defi";

export interface UniswapPositionParams {
    publicClient?: PublicClient;
    address?: Address;
    pool?: Pool;
    poolAddress: Address;
}

export interface UniswapPool {
    chainId: number;
    address: Address;
    fee: FeeAmount;
    token0Id: string;
    token1Id: string;
}

export interface UniswapPoolParams {
    publicClient?: PublicClient;
    address?: Address;
    pool: DefiPool;
}

export interface UniswapPosition {
    tokenId: bigint;
    amount0: bigint;
    amount1: bigint;
    totalValue?: number;
    token0: `0x${string}`;
    token1: `0x${string}`;
    tokenA?: CustomToken;
    tokenB?: CustomToken;
    fee: number;
    tickLower: number;
    tickUpper: number;
    liquidity: bigint;
    feeGrowthInside0LastX128: bigint;
    feeGrowthInside1LastX128: bigint;
    tokensOwed0: bigint;
    tokensOwed1: bigint;
    totalRewardsValue?: number;
    isInRange: boolean;
}

export interface UniswapClaimRewardParams {
    publicClient: PublicClient;
    walletClient: WalletClient;
    address: Address;
    pool: DefiPool;
    position: UniswapPosition;
}
