const network: "mainnet" | "testnet" = (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "testnet") ?? "mainnet";

export const APP_CONFIG = {
    // mainnet | testnet
    network,
    networkIsTestnet: network === "testnet",
    forceAllnetwork: false, // SHOULD BE FALSE ON PRODUCTION
    enablePlayground: false, // SHOULD BE FALSE ON PRODUCTION

    enableEvm: true, // show evm token, wallet, staking
    enableEvmStaking: true, // enable staking, otherwise the button will be disabled
    enableDefiHub: true, // enable defi hub menu 
    enableTheme: true,

    // Liquid staking
    bond: {
        babylon: {
            enableEthereum: true,
            enableOsmosis: true
        }
    },
    enableUnbond: true,

    // Staking maintenance
    isStakingMaintenance: true,
    stakingMaintenanceMessage: "We are performing maintenance on our cross-chain staking. Service will be back soon.",

    // Bridge maintenance
    isBridgeMaintenance: false,
    bridgeMaintenanceMessage: "We are performing maintenance on our cross-chain bridging. Service will be back soon.",

    // Defi
    enableUniswap: false,

    minimumAmount: 0.003,

    // THIS WILL SHUTDOWN THE APP!!!
    isMaintenance: false,

    // Times
    balanceRefetchInterval: 60_000,
    longRefetchInterval: 10 * 60_000,
    transactionsRefetchInterval: 10 * 60_000,
    coingeckoRefetchInterval: 5 * 60_000,
    coingeckoHistoricRefetchInterval: 60 * 60_000,
    skipRouteRefetchInterval: 30_000,
    refetchIntervalFast: 5_000,
    refetchIntervalFast10s: 10_000,
    tracesRefetchInterval: 15_000,
    blockConfirmation: 12,
    receiptTimeout: 300_000,

    // Local db
    dbTransaction: "app_data_transactions_v12",
    dbDust: "app_data_dusts_v2",

    // URLS
    urls: {
        discordSupport: "https://discord.com/channels/1359421724910944256/1359553696366727300",
        privacyPolicy: "https://www.escher.finance/privacy-policy",
        docs: "https://docs.escher.finance/",
    },

    // Dates
    dateTimeFormat: "YYYY-MM-DDTHH:mm:ssZ"
}
