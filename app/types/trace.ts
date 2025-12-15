export interface UnionPacket {
    "packet_hash": string
    "packet_recv_transaction_hash": string
    "packet_send_transaction_hash": string
    "status": string
    "success": boolean
    "traces": UnionTrace[]
}
export interface UnionPacketSuccess {
    "packet_send_transaction_hash": string
    "success": boolean
}
export interface UnionBond {
    "base_amount": string
    "base_token": string
    "bond_success": boolean
    "bond_traces": UnionTrace[]
    "delivery_success": boolean
    "delivery_traces": UnionTrace[]
    "packet_hash": string
    "quote_amount": string
    "quote_token": string
    "receiver_display": string
    "sender_display": string
}

export interface UnionUnbond {
    "base_amount": string
    "base_token": string
    "packet_hash": string
    "sender_display": string
    "success": boolean
    "traces": UnionTrace[]
}

export interface UnionDust {
    "delivery_success": boolean
    "delivery_traces": UnionTrace[]
    "dust_withdraw_success": boolean
    "dust_withdraw_traces": UnionTrace[]
    "packet_hash": string
    "quote_amount": string
    "quote_token": string
}

export interface UnionWithdraw {
    "delivery_success": boolean
    "delivery_traces": UnionTrace[]
    "packet_hash": string
    "quote_amount": string
    "quote_token": string
    "withdraw_success": boolean
    "withdraw_traces": UnionTrace[]
}

export interface UnionDustStatus {
    "delivery_success": boolean | null
    "quote_amount": string
    "quote_token": string
}

export interface UnionWithdrawStatus {
    "batches": Record<string, { amount: string | null } | null>
    "withdraw_success": boolean | null
    "delivery_success": boolean | null
}

export interface UnionInstruction {
    "packet_hash": string
    "packet_recv_timestamp": string
    "packet_recv_transaction_hash": string
    "packet_send_timestamp": string
    "packet_send_transaction_hash": string
    "status": string
    "success": boolean | null
}

export interface UnionTransfer {
    "packet_hash": string
    "success": boolean | null
    "status": string
    "packet_send_timestamp": string
    "packet_send_transaction_hash": string
    "packet_recv_transaction_hash": string
    "packet_recv_timestamp": string
    "traces": UnionTrace[]
}

export interface UnionTrace {
    "timestamp": string
    "transaction_hash": string
    "type": string
    "universal_chain_id": string
}