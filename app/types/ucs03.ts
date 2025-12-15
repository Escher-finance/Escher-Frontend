export type Channel = {
    source_chain_id: string
    source_port_id: string
    source_channel_id: number
    source_connection_id: number
    destination_chain_id: string
    destination_port_id: string
    destination_channel_id: number
    destination_connection_id: number
}

export interface TransferAndCallIntent {
    sender: string;
    receiver: string;
    baseAmount: bigint;
    baseToken: string
    baseTokenDecimals: number;
    baseTokenSymbol: string;
    baseTokenName: string;
    quoteToken: `0x${string}`;
    quoteAmount: bigint,
    baseTokenPath: bigint;
    payload: Record<string, unknown>;
}


export interface TransferIntent {
    sender: string;
    receiver: string;
    baseAmount: bigint;
    baseToken: string
    baseTokenSymbol: string;
    baseTokenName: string;
    quoteToken: `0x${string}`;
    quoteAmount: bigint,
    baseTokenPath: bigint;
    baseTokenDecimals: number;
}

export const cosmosChainId: string[] = [
    "elgafar-1",
    "osmo-test-5",
    "union-testnet-9",
    "stride-internal-1",
    "bbn-test-5",
    "union-testnet-8"
];

export const cosmosRpcs: Record<CosmosChainId, string> = {
    "elgafar-1": "https://rpc.elgafar-1.stargaze.chain.kitchen",
    "osmo-test-5": "https://rpc.osmo-test-5.osmosis.chain.kitchen",
    "union-testnet-9": "https://rpc.union-testnet-9.union.chain.kitchen",
    "union-testnet-8": "https://rpc.union-testnet-8.union.chain.kitchen",
    "stride-internal-1": "https://rpc.stride-internal-1.stride.chain.kitchen",
    "bbn-test-5": "https://rpc.bbn-test-5.babylon.chain.kitchen"
}

export type CosmosChainId = `${(typeof cosmosChainId)[number]}`