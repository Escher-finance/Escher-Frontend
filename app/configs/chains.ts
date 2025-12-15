import { CustomChain } from "@/types/chain";
import { holesky, mainnet, sepolia } from "viem/chains";
import { COSMOS_CHAIN_INFO } from "./cosmos-chain";

type ChainList =
    //mainnet
    'babylon' | 'osmosis' | 'mainnet' |
    //testnet
    'sepolia' | 'holesky' | 'babylontestnet';

export const CHAINS: Record<ChainList, CustomChain> = {
    // MAINNET
    babylon: {
        id: COSMOS_CHAIN_INFO.babylon.chain!.chain_id,
        network_type: COSMOS_CHAIN_INFO.babylon.chain.network_type ?? "mainnet",
        name: COSMOS_CHAIN_INFO.babylon.chain.pretty_name ?? COSMOS_CHAIN_INFO.babylon.chain.chain_name,
        chainName: COSMOS_CHAIN_INFO.babylon.chain.chain_name,
        nativeCurrency: {
            name: "Babylon",
            symbol: "BABY",
            decimals: 6
        },
        network: 'cosmos',
        icon: '/images/token/babylon.png',
        rest: COSMOS_CHAIN_INFO.babylon.chain.apis?.rest ? COSMOS_CHAIN_INFO.babylon.chain.apis?.rest[0].address : undefined,
        cosmosChain: COSMOS_CHAIN_INFO.babylon.chain
    },
    osmosis: {
        id: COSMOS_CHAIN_INFO.osmosis.chain.chain_id,
        network_type: COSMOS_CHAIN_INFO.osmosis.chain.network_type ?? "mainnet",
        name: COSMOS_CHAIN_INFO.osmosis.chain.pretty_name ?? COSMOS_CHAIN_INFO.osmosis.chain.chain_name,
        chainName: COSMOS_CHAIN_INFO.osmosis.chain.chain_name,
        nativeCurrency: {
            name: "Osmosis",
            symbol: "OSMO",
            decimals: 6
        },
        network: 'cosmos',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
        rest: COSMOS_CHAIN_INFO.osmosis.chain.apis?.rest ? COSMOS_CHAIN_INFO.osmosis.chain.apis?.rest[0].address : undefined,
        cosmosChain: COSMOS_CHAIN_INFO.osmosis.chain
    },
    mainnet: {
        network: 'evm',
        network_type: "mainnet",
        viemChain: mainnet,
        id: mainnet.id,
        name: mainnet.name,
        nativeCurrency: mainnet.nativeCurrency,
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    },

    // TESTNET
    sepolia: {
        network: 'evm',
        network_type: "testnet",
        viemChain: sepolia,
        id: sepolia.id,
        name: sepolia.name,
        nativeCurrency: sepolia.nativeCurrency,
    },
    holesky: {
        network: 'evm',
        network_type: "testnet",
        viemChain: holesky,
        id: holesky.id,
        name: holesky.name,
        nativeCurrency: holesky.nativeCurrency,
    },
    babylontestnet: {
        id: COSMOS_CHAIN_INFO.babylontestnet.chain.chain_id,
        network_type: COSMOS_CHAIN_INFO.babylontestnet.chain.network_type ?? "testnet",
        name: COSMOS_CHAIN_INFO.babylontestnet.chain.pretty_name ?? COSMOS_CHAIN_INFO.babylontestnet.chain.chain_name,
        chainName: COSMOS_CHAIN_INFO.babylontestnet.chain.chain_name,
        nativeCurrency: {
            name: "Babylon Testnet",
            symbol: "BABY",
            decimals: 6
        },
        network: 'cosmos',
        icon: '/images/token/babylon.png',
        cosmosChain: COSMOS_CHAIN_INFO.babylon.chain
    }
};