import { CustomToken } from "@/types/chain";
import { zeroAddress } from "viem";
import { BABYLON_CONTRACTS } from "./babylon";
import { CHAINS } from "./chains";
import { COSMOS_CHAIN_INFO } from "./cosmos-chain";
import { UNION_CONTRACTS } from "./union";

// EVM
const TOKENS_EVM_MAINNET: CustomToken[] = [
    {
        chain: CHAINS.mainnet,
        coingeckoId: "ethereum",
        contractAddress: zeroAddress,
        decimals: CHAINS.mainnet.nativeCurrency.decimals,
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        id: `${CHAINS.mainnet.id}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: true,
        isPosition: false,
        isStakeAble: false,
        isUniswap: true,
        name: CHAINS.mainnet.nativeCurrency.name,
        symbol: CHAINS.mainnet.nativeCurrency.symbol,
    },

    // Babylon
    {
        chain: CHAINS.mainnet,
        coingeckoId: "babylon",
        contractAddress: '0xe53dCec07d16D88e386AE0710E86d9a400f83c31',
        decimals: 6,
        icon: '/images/token/babylon-v2.svg',
        id: `${CHAINS.mainnet.id}_0xe53dCec07d16D88e386AE0710E86d9a400f83c31`,
        isBalanceWatch: true,
        isBridgeAble: true,
        isLiquid: false,
        isNative: false,
        isPosition: true,
        isStakeAble: true,
        isUniswap: false,
        lst: ["babylon"],
        name: 'Babylon',
        symbol: 'BABY',
    },
    {
        chain: CHAINS.mainnet,
        coingeckoId: "babylon",
        contractAddress: BABYLON_CONTRACTS.liquidTokenAddress.ethereum,
        decimals: 6,
        icon: '/images/token/e-babylon.svg',
        id: `${CHAINS.mainnet.id}_${BABYLON_CONTRACTS.liquidTokenAddress.ethereum}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: true,
        isNative: false,
        isPosition: true,
        isStakeAble: false,
        isUniswap: false,
        lst: ["babylon"],
        name: 'Escher Babylon',
        symbol: 'eBABY',
    },

    // Union
    {
        chain: CHAINS.mainnet,
        coingeckoId: "union-2",
        contractAddress: UNION_CONTRACTS.mainnet.uEvmAddress,
        decimals: 18,
        icon: '/images/token-u.png',
        id: `${CHAINS.mainnet.id}_${UNION_CONTRACTS.mainnet.uEvmAddress}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: false,
        isPosition: true,
        isStakeAble: true,
        isUniswap: false,
        lst: ["union"],
        name: 'Union',
        symbol: 'U',
    },
    {
        chain: CHAINS.mainnet,
        coingeckoId: "union-2",
        contractAddress: UNION_CONTRACTS.mainnet.eUEvmAddress,
        decimals: 18,
        icon: '/images/token/e-union.svg',
        id: `${CHAINS.mainnet.id}_${UNION_CONTRACTS.mainnet.eUEvmAddress}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: true,
        isNative: false,
        isPosition: true,
        isStakeAble: false,
        isUniswap: false,
        lst: ["union"],
        name: 'Escher Union',
        symbol: 'eU',
    },
];

const TOKENS_EVM_SEPOLIA: CustomToken[] = [
    {
        chain: CHAINS.sepolia,
        id: `${CHAINS.sepolia.id}`,
        coingeckoId: "ethereum",
        contractAddress: zeroAddress,
        decimals: CHAINS.sepolia.nativeCurrency.decimals,
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: true,
        isPosition: false,
        isStakeAble: false,
        isUniswap: true,
        name: CHAINS.sepolia.nativeCurrency.name,
        symbol: CHAINS.sepolia.nativeCurrency.symbol,
    }
];

const TOKENS_EVM_HOLESKY: CustomToken[] = [
    {
        chain: CHAINS.holesky,
        coingeckoId: "ethereum",
        decimals: CHAINS.holesky.nativeCurrency.decimals,
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        id: `${CHAINS.holesky.id}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: true,
        isPosition: false,
        isStakeAble: false,
        isUniswap: false,
        name: CHAINS.holesky.nativeCurrency.name,
        symbol: CHAINS.holesky.nativeCurrency.symbol,
    },
    {
        chain: CHAINS.holesky,
        coingeckoId: "union-2",
        contractAddress: UNION_CONTRACTS.holesky.uEvmAddress,
        decimals: 18,
        icon: '/images/token-u.png',
        id: `${CHAINS.holesky.id}_${UNION_CONTRACTS.holesky.uEvmAddress}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: false,
        isPosition: true,
        isStakeAble: true,
        isUniswap: false,
        lst: ["union"],
        name: 'Union',
        symbol: 'U',
    },
    {
        chain: CHAINS.holesky,
        coingeckoId: "union-2",
        contractAddress: UNION_CONTRACTS.holesky.eUEvmAddress,
        decimals: 18,
        icon: '/images/token/e-union.svg',
        id: `${CHAINS.holesky.id}_${UNION_CONTRACTS.holesky.eUEvmAddress}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: true,
        isNative: false,
        isPosition: true,
        isStakeAble: false,
        isUniswap: false,
        lst: ["union"],
        name: 'Escher Union',
        symbol: 'eU',
    },
];

const TOKENS_EVM: CustomToken[] = [
    ...TOKENS_EVM_MAINNET,
    // ...TOKENS_EVM_UNISWAP,

    ...TOKENS_EVM_HOLESKY,
    ...TOKENS_EVM_SEPOLIA
];
// ========================================

// COSMOS
const TOKENS_COSMOS_BABYLON: CustomToken[] = [
    // MAINNET
    {
        chain: CHAINS.babylon,
        coingeckoId: "babylon",
        decimals: CHAINS.babylon.nativeCurrency.decimals,
        denom: COSMOS_CHAIN_INFO.babylon.asset.assets[0].base,
        icon: '/images/token/babylon-v2.svg',
        id: `${CHAINS.babylon.id}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: true,
        isPosition: true,
        isStakeAble: true,
        isUniswap: false,
        lst: ["babylon"],
        name: CHAINS.babylon.nativeCurrency.name,
        symbol: CHAINS.babylon.nativeCurrency.symbol,
    },
    {
        chain: CHAINS.babylon,
        coingeckoId: "babylon",
        decimals: CHAINS.babylon.nativeCurrency.decimals,
        denom: BABYLON_CONTRACTS.liquidTokenAddress.babylon,
        icon: '/images/token/e-babylon.svg',
        id: `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isCw20: true,
        isLiquid: true,
        isNative: false,
        isPosition: true,
        isStakeAble: false,
        isUniswap: false,
        lst: ["babylon"],
        name: 'Escher Babylon',
        symbol: 'eBABY',
    },
    {
        chain: CHAINS.babylon,
        coingeckoId: "universal-btc",
        decimals: 8,
        denom: "bbn1fkz8dcvsqyfy3apfh8ufexdn4ag00w5jts99zjw9nkjue0zhs4ts6hfdz2",
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/uniBTC.svg',
        id: `${CHAINS.babylon.id}_bbn1fkz8dcvsqyfy3apfh8ufexdn4ag00w5jts99zjw9nkjue0zhs4ts6hfdz2`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isCw20: true,
        isLiquid: false,
        isNative: false,
        isPosition: false,
        isStakeAble: false,
        isUniswap: false,
        name: 'Universal BTC',
        symbol: 'uniBTC',
    },

    // TESTNET
    {
        chain: CHAINS.babylontestnet,
        coingeckoId: "babylon",
        decimals: CHAINS.babylontestnet.nativeCurrency.decimals,
        denom: COSMOS_CHAIN_INFO.babylontestnet.asset.assets[0].base,
        icon: '/images/token/babylon-v2.svg',
        id: `${CHAINS.babylontestnet.id}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: true,
        isPosition: false,
        isStakeAble: true,
        isUniswap: false,
        lst: ["babylon"],
        name: CHAINS.babylontestnet.nativeCurrency.name,
        symbol: CHAINS.babylontestnet.nativeCurrency.symbol,
    },
    {
        chain: CHAINS.babylontestnet,
        decimals: CHAINS.babylontestnet.nativeCurrency.decimals,
        denom: BABYLON_CONTRACTS.liquidTokenAddress.babylon,
        icon: '/images/token/e-babylon.svg',
        id: `${CHAINS.babylontestnet.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isCw20: true,
        isLiquid: true,
        isNative: false,
        isPosition: false,
        isStakeAble: false,
        isUniswap: false,
        lst: ["babylon"],
        name: 'Escher Babylon',
        symbol: 'eBABY',
    },
];

const TOKENS_COSMOS_OSMOSIS: CustomToken[] = [
    // MAINNET
    {
        chain: CHAINS.osmosis,
        coingeckoId: "osmosis",
        decimals: CHAINS.osmosis.nativeCurrency.decimals,
        denom: COSMOS_CHAIN_INFO.osmosis.asset.assets[0].base,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
        id: `${CHAINS.osmosis.id}`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isLiquid: false,
        isNative: true,
        isPosition: false,
        isStakeAble: false,
        isUniswap: false,
        lst: ["babylon"],
        name: CHAINS.osmosis.nativeCurrency.name,
        symbol: CHAINS.osmosis.nativeCurrency.symbol,
    },
    {
        chain: CHAINS.osmosis,
        coingeckoId: "babylon",
        decimals: CHAINS.babylon.nativeCurrency.decimals,
        denom: "ibc/EC3A4ACBA1CFBEE698472D3563B70985AEA5A7144C319B61B3EBDFB57B5E1535",
        icon: '/images/token/babylon-v2.svg',
        id: `${CHAINS.osmosis.id}_ibc/EC3A4ACBA1CFBEE698472D3563B70985AEA5A7144C319B61B3EBDFB57B5E1535`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isCw20: false,
        isLiquid: false,
        isNative: false,
        isPosition: true,
        isStakeAble: true,
        isUniswap: false,
        lst: ["babylon"],
        name: CHAINS.babylon.nativeCurrency.name,
        symbol: CHAINS.babylon.nativeCurrency.symbol,
    },
    {
        chain: CHAINS.osmosis,
        coingeckoId: "babylon",
        decimals: CHAINS.babylon.nativeCurrency.decimals,
        denom: "factory/osmo12r3yc76u9lxe33yemstatnw8602culdjzrtr8lmnpycmd3z7d4jsxx60kc/FwNhFaW3zLxoLUgXCdWjqBzcvGNPaB7B2XZqm2xgrB93",
        icon: '/images/token/e-babylon.svg',
        id: `${CHAINS.osmosis.id}_factory/osmo12r3yc76u9lxe33yemstatnw8602culdjzrtr8lmnpycmd3z7d4jsxx60kc/FwNhFaW3zLxoLUgXCdWjqBzcvGNPaB7B2XZqm2xgrB93`,
        isBalanceWatch: true,
        isBridgeAble: false,
        isCw20: false,
        isLiquid: true,
        isNative: false,
        isPosition: true,
        isStakeAble: false,
        isUniswap: false,
        lst: ["babylon"],
        name: 'Escher Babylon',
        symbol: 'eBABY',
    },
];

const TOKENS_COSMOS: CustomToken[] = [
    ...TOKENS_COSMOS_BABYLON,
    ...TOKENS_COSMOS_OSMOSIS
];
// ========================================

// COMBINED
export const TOKENS: CustomToken[] = [
    ...TOKENS_COSMOS,
    ...TOKENS_EVM,
];

// HELPERS
export const BABY_TOKENS = {
    babylon: TOKENS.find(v => v.id === `${CHAINS.babylon.id}`)!,
    osmosis: TOKENS.find(v => v.id === `${CHAINS.osmosis.id}_ibc/EC3A4ACBA1CFBEE698472D3563B70985AEA5A7144C319B61B3EBDFB57B5E1535`)!,
    mainnet: TOKENS.find(v => v.id === `${CHAINS.mainnet.id}_0xe53dCec07d16D88e386AE0710E86d9a400f83c31`)!,
}

export const EBABY_TOKENS = {
    babylon: TOKENS.find(v => v.id === `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`)!,
    osmosis: TOKENS.find(v => v.id === `${CHAINS.osmosis.id}_factory/osmo12r3yc76u9lxe33yemstatnw8602culdjzrtr8lmnpycmd3z7d4jsxx60kc/FwNhFaW3zLxoLUgXCdWjqBzcvGNPaB7B2XZqm2xgrB93`)!,
    mainnet: TOKENS.find(v => v.id === `${CHAINS.mainnet.id}_${BABYLON_CONTRACTS.liquidTokenAddress.ethereum}`)!,
}

export const U_TOKENS = {
    mainnet: TOKENS.find(v => v.id === `${CHAINS.mainnet.id}_${UNION_CONTRACTS.mainnet.uEvmAddress}`)!,
    holesky: TOKENS.find(v => v.id === `${CHAINS.holesky.id}_${UNION_CONTRACTS.holesky.uEvmAddress}`)!,
}

export const EU_TOKENS = {
    mainnet: TOKENS.find(v => v.id === `${CHAINS.mainnet.id}_${UNION_CONTRACTS.mainnet.eUEvmAddress}`)!,
    holesky: TOKENS.find(v => v.id === `${CHAINS.holesky.id}_${UNION_CONTRACTS.holesky.eUEvmAddress}`)!,
}