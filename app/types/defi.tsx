import { FeeAmount } from "@uniswap/v3-sdk"
import { CustomChain, CustomToken, LiquidStaking } from "./chain"
import { ResponseTowerIncentive, ResponseTowerMetric } from "./defiTower"

export interface Defi {
    apr?: number
    chain: CustomChain
    description: string
    link: string
    linkText: string
    logoURI: string
    logoUriApps: string
    name: string
    pools: DefiPool[]
    swaps: DefiSwap[]
    position?: number
    tag: DappTag
    trpcGetUserBalances?: string
    trpcMetric?: string
    tvl?: number
}

export type DappTag = 'lending' | 'yield' | 'pools';

export interface DefiPool {
    apr?: {
        day?: DefiApr
        week?: DefiApr
    }
    aprSingle?: number
    claimable: boolean
    hasPriceRatio: boolean
    incentiveAddress?: string
    lpTokenAddress?: string
    lst: LiquidStaking
    multiplier: {
        text: string
        logoUri: string
    }[]
    poolId?: string
    poolAddress: string
    fee?: FeeAmount
    position?: number
    priceRatio?: number
    responses?: {
        day?: DefiTrpcResponse
        week?: DefiTrpcResponse
    }
    rewards?: {
        token: CustomToken
        amount: number
    }[]
    staked_share_amount?: number
    title: string
    tokenA: CustomToken
    tokenAStaked?: number
    tokenAPoolAmount?: number
    tokenB: CustomToken
    tokenBStaked?: number
    tokenBPoolAmount?: number
    tvl?: number
    type: string
    volume?: {
        day?: number
        week?: number
    }
}

export interface DefiSwap {
    hasPriceRatio: boolean
    lst: LiquidStaking
    poolID?: number
    priceRatio?: number
    tokenA: CustomToken
    tokenB: CustomToken
}

interface DefiTrpcResponse {
    responseMetric?: ResponseTowerMetric
    responseIncentive?: ResponseTowerIncentive
}

export interface DefiApr {
    swapFees: number
    incentives: number
    total: number
}

export interface DefiDetail {
    defi: string
    logoUri: string
    multiplier: string
    pool: string
    title: string
    subTitle: string
    tokenAUri: string
    tokenBUri: string
}
