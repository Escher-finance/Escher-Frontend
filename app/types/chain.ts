import { Chain as ChainViem } from "viem";
import { Chain as ChainCosmos } from '@chain-registry/types';

export type LiquidStaking = "babylon" | "union";

export interface NetworkConfig {
    chainId: number
    chainName: string
    lst: string
    cw20: string
    reward: string
    ucs03address: `0x${string}`
    faucetaddress: `0x${string}`
    quoteBondToken: string
    quoteUnbondToken: string
    channelId: number
    default_ratio: number
}

export interface CustomChain {
    chainName?: string
    icon?: string
    id: string | number
    name: string
    nativeCurrency: NativeCurrency
    network_type: 'mainnet' | 'testnet' | 'devnet'
    network: 'evm' | 'cosmos'
    rest?: string
    viemChain?: ChainViem
    cosmosChain?: ChainCosmos
}

export interface NativeCurrency {
    name: string,
    symbol: string,
    decimals: number
}

export interface CustomToken {
    balance?: TokenBalance
    chain: CustomChain
    coingeckoId?: string
    coingeckoPrice?: number
    contractAddress?: `0x${string}`
    decimals: number
    denom?: string
    icon?: string
    id: string
    isBalanceWatch?: boolean
    isBridgeAble: boolean
    isCw20?: boolean
    isLiquid: boolean
    isNative: boolean
    isPosition: boolean
    isStakeAble: boolean
    isUniswap: boolean
    lst?: LiquidStaking[]
    name: string
    symbol: string
    totalSupply?: number
    tvl?: number
}

export interface TokenBalance {
    decimals: number;
    symbol: string;
    value: bigint;
    formattedBalance: string;
    dollarPerToken?: number;
    dollarValue?: number;
}

export interface Parameters {
    underlying_coin_denom: string | undefined
    liquidstaking_denom: string | undefined
    ucs03_relay_contract: string | undefined
    unbonding_time: number | undefined
    cw20_address: string | undefined
    reward_address: string | undefined
    fee_rate: string | undefined
    fee_receiver: string | undefined
}

export interface Tokenomics {
    total_supply?: string
    not_bonded_tokens?: string
    bonded_tokens?: string
    delegated?: string
}

export interface Liquidity {
    exchange_rate: string | undefined
    amount: string | undefined
    delegated: string | undefined
    reward: string | undefined
    time: string | undefined
    total_supply: string | undefined
}

export interface Apr {
    validators: { address: string; weight: number; rate: number }[]
    inflation: number
    ratio: number
    apr: number
}

export interface Validator {
    operator_address: string,
    consensus_pubkey: {
        "@type": string,
        key: string
    },
    jailed: boolean,
    status: string,
    tokens: string,
    delegator_shares: string,
    description: {
        moniker: string,
        identity: string,
        website: string,
        security_contact: string,
        details: string
    },
    unbonding_height: string,
    unbonding_time: string,
    commission: {
        commission_rates: {
            rate: string,
            max_rate: string,
            max_change_rate: string
        },
        update_time: string
    },
    min_self_delegation: string,
    unbonding_on_hold_ref_count: string,
    unbonding_ids: string[]
}

export interface GroupedTokens {
    symbol: string
    name: string
    balance: number
    icon?: string
    tokens: CustomToken[]
}

export interface CoingeckoPrice {
    id: string
    denom: string
    price: number
}