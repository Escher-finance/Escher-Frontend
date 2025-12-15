export interface Point {
    type: 'hodl' | 'hodl_union' | 'defi' | 'defi_union' | 'extra'
    user_address: string
    chainId?: string | number
    pool_address?: string
    height?: string
    points?: number
    speed?: number
}

export interface Leaderboard {
    rank: number
    user_address: string
    hodl_points?: number
    lp_points?: number
    total_points?: number
}