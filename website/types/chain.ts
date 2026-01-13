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

export interface NativeCurrency {
    name: string,
    symbol: string,
    decimals: number
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
    validators: any[]
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

export interface CoingeckoPrice {
    id: string
    price: number
}

export interface TowerMetric {
    pool_address: string,
    height: string,
    token0_denom: string,
    token0_balance: string,
    token0_decimals: number,
    token0_price: string,
    token0_swap_volume: string,
    token1_denom: string,
    token1_balance: string,
    token1_decimals: number,
    token1_price: string,
    token1_swap_volume: string,
    tvl_usd: number,
    average_apr: number,
    lp_token_address: any,
    total_incentives: any,
    metric_start_height: string,
    metric_end_height: string
}