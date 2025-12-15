import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { Address } from "viem";

type ChainList = 'mainnet' | 'holesky';

export interface UnionContract {
    bytecode_base_checksum: `0x${string}`
    channelId: ChannelId
    destinationChannelId: ChannelId
    indexer: string
    lstAtUnionAddress: string // EU_STAKING_HUB , Address to get rate data
    minBond: number
    module_hash: `0x${string}`
    quoteToken: Address
    quoteTokenCosm: string
    slippage: number
    sourceChannelId: ChannelId
    stakingContractOnUnion: string // Address to get validator info, reward, etc
    unbondingPeriod: number
    zkgmProxyAddress: string

    uEvmAddress: `0x${string}` // U_ERC20
    uUnionAddress: string // U_BANK
    eUUnionAddress: string // EU_LST
    eUEvmAddress: `0x${string}` // EU_ERC20

    EU_FROM_UNION_SOLVER_METADATA: `0x${string}` // EU_SOLVER_ON_ETH_METADATA
    EU_UNBOND_SOLVER_METADATA: `0x${string}`
    U_SOLVER_ON_ETH_METADATA: `0x${string}`
    U_SOLVER_ON_UNION_METADATA: `0x${string}`

    ucs03Address: `0x${string}` // UCS03_EVM
    ucs03AddressOnUnion: `${string}1${string}` // UCS03_ZKGM
    ucs03MinterOnUnionAddress: string // UCS03_MINTER_ON_UNION

    sendbackSourceUniversalChainId: string
    sendbackDestinationUniversalChainId: string

    feature: {
        bond: boolean
        unbond: boolean
    }
}

const mainnetConfig: UnionContract = {
    uEvmAddress: "0xba5ed44733953d79717f6269357c77718c8ba5ed",
    bytecode_base_checksum: "0xec827349ed4c1fec5a9c3462ff7c979d4c40e7aa43b16ed34469d04ff835f2a1",
    channelId: ChannelId.make(2),
    indexer: "https://graphql.union.build/v1/graphql",
    minBond: 0.01,
    module_hash: "0x120970d812836f19888625587a4606a5ad23cef31c8684e601771552548fc6b9",
    quoteToken: "0x6175",
    quoteTokenCosm: "au",
    slippage: 0.005,
    unbondingPeriod: (27) * 24 * 60 * 60, // 27 days
    zkgmProxyAddress: "union1mtxk8tjz85ry2a8a6k58uwrztmwslaxzsurh5l0dlxh7wrnvmxkshqkuwd",

    uUnionAddress: "au",
    eUUnionAddress: "union1eueueueu9var4yhdruyzkjcsh74xzeug6ckyy60hs0vcqnzql2hq0lxc2f",
    eUEvmAddress: "0xe5cf13c84c0fea3236c101bd7d743d30366e5cf1",

    sourceChannelId: ChannelId.make(2),
    destinationChannelId: ChannelId.make(1),

    lstAtUnionAddress: "union1d2r4ecsuap4pujrlf3nz09vz8eha8y0z25knq0lfxz4yzn83v6kq0jxsmk",
    stakingContractOnUnion: "union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v",

    EU_FROM_UNION_SOLVER_METADATA: "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000014e5cf13c84c0fea3236c101bd7d743d30366e5cf10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    EU_UNBOND_SOLVER_METADATA: "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040756e696f6e31657565756575657539766172347968647275797a6b6a6373683734787a65756736636b797936306873307663716e7a716c326871306c786332660000000000000000000000000000000000000000000000000000000000000000",
    U_SOLVER_ON_ETH_METADATA: "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000014ba5ed44733953d79717f6269357c77718c8ba5ed0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    U_SOLVER_ON_UNION_METADATA: "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040756e696f6e3175757575757575757539756e3271706b73616d37726c747470786338646337366d63706868736d70333970786a6e7376727463717679763537720000000000000000000000000000000000000000000000000000000000000000",

    ucs03Address: "0x5fbe74a283f7954f10aa04c2edf55578811aeb03",
    ucs03AddressOnUnion: "union1336jj8ertl8h7rdvnz4dh5rqahd09cy0x43guhsxx6xyrztx292qpe64fh",
    ucs03MinterOnUnionAddress: "union150u2vpdtau48c50lntaqgleu8rqfnnuh2u3pzfg7pfcvw4uzq6tqceagxy",

    sendbackSourceUniversalChainId: "union.union-1",
    sendbackDestinationUniversalChainId: "ethereum.1",

    feature: {
        bond: true,
        unbond: true,
    }
}

export const UNION_CONTRACTS: Record<ChainList, UnionContract> = {
    mainnet: {
        ...mainnetConfig,
    },

    holesky: {
        ...mainnetConfig,
        channelId: ChannelId.make(6),
        destinationChannelId: ChannelId.make(20),
        minBond: 1,
        sendbackDestinationUniversalChainId: "ethereum.17000",
        sendbackSourceUniversalChainId: "union.union-testnet-10",
        sourceChannelId: ChannelId.make(6),
        ucs03MinterOnUnionAddress: "union1t5awl707x54k6yyx7qfkuqp890dss2pqgwxh07cu44x5lrlvt4rs8hqmk0",

        feature: {
            bond: true,
            unbond: true,
        }
    }
}