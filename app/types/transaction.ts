export type Action = 'bond' | 'unbond' | 'towerRemove' | 'towerAdd' | 'bridge' | 'dust' | 'withdraw';

export interface TransactionData {
    account: string
    type: "liquid_bond" | "liquid_unbond" | "transfer"
    transactionHash: string
    timestamp: string
    data: string
}

export interface LiquidBondData {
    sourceTokenId: string
    destinationTokenId: string
    amount: string
    estimatedAmount: string
}

export interface LiquidUnbondData {
    sourceTokenId: string
    destinationTokenId: string
    amount: string
    estimatedAmount: string
}

export interface BridgeData {
    sourceTokenId: string
    destinationTokenId: string
    amount: string
    estimatedAmount: string
}

export type Status = 'success' | 'pending'

export interface IndexerTransaction {
    action: Action
    amountA: string
    amountB?: string
    batch?: string
    channelId: number
    denomA: string
    denomB?: string
    exchangeRate?: number
    hash: string
    height?: number
    ibcChannelId?: string
    lst: 'babylon' | 'union'
    recipient: string | null
    recipientChannelId: number | null
    recipientIbcChannelId?: string
    source: 'indexer' | 'union' | 'local'
    status: Status
    submitted?: string
    time: string
    tokenIdA?: string
    tokenIdB?: string
    userAddress: string
}

export interface LocalDust {
    amountRaw: string
    lst: 'babylon' | 'union'
    status: Status
    transactionHash: string
    userAddress: string
    time: string
}