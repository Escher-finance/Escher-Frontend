export interface UnionIndexerBond {
    base_amount: string
    base_token: string
    bond_send_timestamp: string
    bond_send_transaction_hash: string
    bond_success: boolean
    delivery_success: boolean
    destination_universal_chain_id: string
    packet_hash: string
    quote_amount: string
    quote_token: string
    receiver_display: string
    sender_display: string
    source_universal_chain_id: string
}

export interface UnionIndexerUnbond {
    base_amount: string
    base_token: string
    batch: string
    destination_universal_chain_id: string
    packet_hash: string
    sender_display: string
    source_universal_chain_id: string
    success: boolean
    unbond_send_timestamp: string
    unbond_send_transaction_hash: string
}

export interface UnionIndexerDust {
    delivery_success: boolean
    dust_withdraw_send_timestamp: string
    dust_withdraw_send_transaction_hash: string
    quote_amount: string
    quote_token: string
    receiver_display: string
    source_universal_chain_id: string
    remote_universal_chain_id: string
}

export interface UnionIndexerWithdraw {
    batches: Record<string, { amount: string | null } | null>
    delivery_success: boolean
    quote_amount: string
    quote_token: string
    receiver_display: string
    source_universal_chain_id: string
    withdraw_send_timestamp: string
    withdraw_send_transaction_hash: string
}

export interface UnionBatch {
    batch_id: string
    batch: {
        expected_native_unstaked: string
        receive_time: string
        received_native_unstaked: string
        status: string
        total_lst_to_burn: string
        unstake_requests_count: string
    }
}

export interface UnionUserUnstakes {
    amount: string
    batch_id: string
    staker: string
}