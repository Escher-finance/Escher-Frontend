export type LiquidStaking = "babylon" | "union"

export interface Liquidity {
    exchange_rate: string | undefined
    amount: string | undefined
    delegated: string | undefined
    reward: string | undefined
    time: string | undefined
    total_supply: string | undefined
}

export interface Validator {
    address: string
    weight: number
    commission: number
    fee?: number
    balance: string
    data: {
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
}

export interface Delegation {
    delegation: {
        delegator_address: string
        validator_address: string
        shares: string
    },
    balance: {
        denom: string
        amount: string
    }
}

export interface DbBatch {
    id: number
    submitted: string
    released: string
    unstake_amount: string
    undelegate_amount: string
}

export interface Competitor {
    name: string
    address: string
    logo: string
    description: string
    totalSupply?: number
    symbol?: string
}