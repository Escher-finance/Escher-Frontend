import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { BABY_TOKENS, EBABY_TOKENS, EU_TOKENS, U_TOKENS } from "@/configs/token";
import { Defi, DefiPool, DefiSwap } from "@/types/defi";
import { FeeAmount } from "@uniswap/v3-sdk";
import { getTokensByNetwork } from "./utils";

const TOKENS = getTokensByNetwork();

// TOWER
const TOWER_POOLS: DefiPool[] = [
    {
        claimable: true,
        hasPriceRatio: true,
        multiplier: [
            {
                text: "2.5x",
                logoUri: "/images/apps/app-escher-circle.svg"
            },
            {
                text: "2x",
                logoUri: "/images/apps/app-tower-circle.png"
            },
            // {
            //     text: "1.25x",
            //     logoUri: "/images/apps/app-union-circle.svg"
            // },
        ],
        poolAddress: "bbn1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgeslpzjvl",
        title: "eBABY / BABY",
        tokenA: TOKENS.find(t => t.id === `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`)!,
        tokenB: TOKENS.find(t => t.id === `${CHAINS.babylon.id}`)!,
        type: "PCL Correlated",
        lst: "babylon"
    },
    {
        claimable: false,
        hasPriceRatio: false,
        multiplier: [
            {
                text: "2.5x",
                logoUri: "/images/apps/app-escher-circle.svg"
            },
            {
                text: "2.5x",
                logoUri: "/images/apps/app-tower-circle.png"
            },
            // {
            //     text: "2.5x",
            //     logoUri: "/images/apps/app-union-circle.svg"
            // },
        ],
        poolAddress: "bbn1jwd3e9smv9n7p20fud8ll9erz6ave95hn7e4w25sv9n450tpg3vqsqeg3d",
        title: "uniBTC / eBABY",
        tokenA: TOKENS.find(t => t.id === `${CHAINS.babylon.id}_bbn1fkz8dcvsqyfy3apfh8ufexdn4ag00w5jts99zjw9nkjue0zhs4ts6hfdz2`)!,
        tokenB: TOKENS.find(t => t.id === `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`)!,
        type: "PCL Wide",
        lst: "babylon"
    },
]

const TOWER_SWAPS: DefiSwap[] = [
    {
        hasPriceRatio: true,
        tokenA: TOKENS.find(t => t.id === `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`)!,
        tokenB: TOKENS.find(t => t.id === `${CHAINS.babylon.id}`)!,
        lst: "babylon"
    }
]

// UNISWAP
const UNISWAP_POOLS: DefiPool[] = [
    {
        claimable: true,
        hasPriceRatio: true,
        multiplier: [
            {
                text: "2.5x",
                logoUri: "/images/apps/app-escher-circle.svg"
            },
        ],
        poolAddress: "0xb759f938814C8B7a24344d75fa3FA4add89bDad2",
        fee: FeeAmount.LOW,
        title: "eBABY / BABY",
        tokenA: EBABY_TOKENS.mainnet,
        tokenB: BABY_TOKENS.mainnet,
        type: "",
        lst: "babylon"
    },
    {
        claimable: true,
        hasPriceRatio: true,
        multiplier: [
            {
                text: "2.5x",
                logoUri: "/images/apps/app-escher-circle.svg"
            },
        ],
        poolAddress: "0xc58e9e692352cccba57c66a3585a2384754dc5d6",
        fee: FeeAmount.MEDIUM,
        title: "U / eU",
        tokenA: U_TOKENS.mainnet,
        tokenB: EU_TOKENS.mainnet,
        type: "",
        lst: "union"
    },
]

const UNISWAP_SWAPS: DefiSwap[] = [
    {
        hasPriceRatio: true,
        tokenA: EBABY_TOKENS.mainnet,
        tokenB: BABY_TOKENS.mainnet,
        lst: "babylon"
    },
    {
        hasPriceRatio: true,
        tokenA: EU_TOKENS.mainnet,
        tokenB: U_TOKENS.mainnet,
        lst: "union"
    }
]

// OSMOSIS
const OSMOSIS_POOLS: DefiPool[] = [
    {
        claimable: true,
        hasPriceRatio: true,
        multiplier: [
            {
                text: "2.5x",
                logoUri: "/images/apps/app-escher-circle.svg"
            },
        ],
        poolId: "3055",
        poolAddress: "osmo1ehnvg72e02eqnwvs49uvnuvmn9csestuj84uz46dc32pvuw8yt3q3awqj3",
        title: "eBABY / BABY",
        tokenA: EBABY_TOKENS.osmosis,
        tokenB: BABY_TOKENS.osmosis,
        type: "",
        lst: "babylon"
    },
]

const OSMOSIS_SWAPS: DefiSwap[] = [
    {
        hasPriceRatio: true,
        tokenA: EBABY_TOKENS.osmosis,
        tokenB: BABY_TOKENS.osmosis,
        poolID: 3055,
        lst: "babylon"
    }
]

type DefiList = 'tower' | 'uniswap' | 'osmosis';

export const DEFIS: Record<DefiList, Defi> = {
    tower: {
        chain: CHAINS.babylon,
        description: "Trade smarter, faster, and more securely with the power of Bitcoin-secured Babylon.",
        link: "https://app.tower.fi/",
        linkText: "tower.fi",
        logoURI: "/images/apps/app-tower-circle.png",
        logoUriApps: "/images/apps/app-tower-circle-2.png",
        name: "Tower",
        pools: [
            ...TOWER_POOLS
        ],
        swaps: [
            ...TOWER_SWAPS
        ],
        tag: "pools",
        trpcGetUserBalances: "https://trpc-tower-production.quasar-labs-main.workers.dev/trpc/edge.indexer.getUserBalances?input=%7B%22address%22%3A%22${address}%22%7D",
        trpcMetric: "https://trpc-tower-production.quasar-labs-main.workers.dev/trpc/edge.indexer.getPoolMetricsByAddresses,edge.indexer.getPoolMetricsByAddresses,edge.indexer.getPoolIncentivesByAddresses,edge.indexer.getPoolIncentivesByAddresses?batch=1&input=${input}"
    },
    uniswap: {
        chain: CHAINS.mainnet,
        description: "A suite of persistent, non-upgradable smart contracts that together create an automated market maker, a protocol that facilitates peer-to-peer market making and swapping of ERC-20 tokens on the Ethereum blockchain.",
        link: "https://uniswap.org/",
        linkText: "uniswap.org",
        logoURI: "/images/apps/app-uniswap-circle-2.svg",
        logoUriApps: "/images/apps/app-uniswap-circle-3.svg",
        name: "Uniswap",
        pools: [
            ...UNISWAP_POOLS
        ],
        swaps: [
            ...UNISWAP_SWAPS
        ],
        tag: "pools",
    },
    osmosis: {
        chain: CHAINS.osmosis,
        description: "The Osmosis blockchain is a decentralized network, run by 150+ validators and full nodes, with many front-ends and development teams on it. Explore our docs and examples to quickly learn, develop & integrate with the Osmosis blockchain.",
        link: "https://app.osmosis.zone/",
        linkText: "osmosis.zone",
        logoURI: "/images/apps/app-osmosis-circle-2.svg",
        logoUriApps: "/images/apps/app-osmosis-circle.png",
        name: "Osmosis",
        pools: [
            ...OSMOSIS_POOLS
        ],
        swaps: [
            ...OSMOSIS_SWAPS
        ],
        tag: "pools",
    }
}