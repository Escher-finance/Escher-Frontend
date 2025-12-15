export interface ResponseTowerUser {
    pool_address: string
    owner: string
    staked_share_amount: string
    unstaked_share_amount: string
    total_share_amount: string
    incentive_address: string
    lpToken: string
}

export interface ResponseTowerMetric {
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
    lp_token_address: string,
    total_incentives: number,
    metric_start_height: string,
    metric_end_height: string
}

export interface ResponseTowerIncentive {
    pool_address: string,
    lp_token_address: string,
    rewards_per_second: string,
    reward_token: string,
    token_decimals: number,
    start_ts: string,
    end_ts: string,
    total_incentives: string
}