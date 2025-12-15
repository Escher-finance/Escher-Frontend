import { useEscher } from "@/components/providers/escherProvider";
import { CHAINS } from "@/configs/chains";
import { BABY_TOKENS, EBABY_TOKENS } from "@/configs/token";
import { CustomToken } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import { useMemo } from "react";
import useIndexer from "./sources/useIndexer";
import useLocalData from "./sources/useLocalData";
import useUnionBondUnbond from "./sources/useUnionBondUnbond";
import useUnionDust from "./sources/useUnionDust";
import useUnionWithdraw from "./sources/useUnionWithdraw";

// const testEvmAddress = "0x1285a2214319Eff512C5035933ac44E573738772";
// const testCosmosAddress = "bbn1y3u4mw39adngenlzwqm6hz60flz25gsxh2s9x4";

export const useTransactions = () => {
    const { account, timestampTransaction } = useEscher();

    const addresses = useMemo(() => {
        return {
            mainnet: account.evm?.address,
            babylon: account.cosmos?.address.babylon,
            osmosis: account.cosmos?.address.osmosis,
        }
    }, [account]);

    // Indexer
    const queryBabylon = useIndexer({
        addresses,
        timestampTransaction
    });

    // The Graph
    /* 
    const queryGraph = useThegraph({
        addresses,
        timestampTransaction
    });
    // Babylon dust
    const queryDustBabylon = useBabylonDust({
        addresses,
        timestampTransaction
    });
     */

    // Union indexer
    const queryUnion = useUnionBondUnbond({
        addresses,
        timestampTransaction
    });

    // Union dust
    const queryDust = useUnionDust({
        addresses,
        timestampTransaction
    });


    // Union withdraw
    const queryWithdraw = useUnionWithdraw({
        addresses,
        timestampTransaction
    });

    // Local data
    const queryLocalData = useLocalData({
        addresses,
        timestampTransaction
    });

    const [data, isFetchedOne, isFetched, fetchedStatus] = useMemo(() => {
        return [
            [
                // DEBUG
                // comment to hide individual source
                ...(queryBabylon.data ?? []), // babylon
                ...(queryUnion.data ?? []), // union
                ...(queryDust.data ?? []), // dust
                // ...(queryDustBabylon.data ?? []), // dust
                ...(queryWithdraw.data ?? []), // withdraw
                ...(queryLocalData.data ?? []), // queryLocalData
            ].sort((a, b) => b.time?.localeCompare(a.time) ?? 0),
            (
                queryBabylon.isFetched ||
                queryDust.isFetched ||
                queryWithdraw.isFetched ||
                queryLocalData.isFetched
            ),
            (
                queryBabylon.isFetched &&
                queryDust.isFetched &&
                queryWithdraw.isFetched &&
                queryLocalData.isFetched
            ),
            {
                finished: [
                    queryBabylon.isFetched,
                    queryDust.isFetched,
                    queryWithdraw.isFetched,
                    queryLocalData.isFetched
                ].filter(v => v === true).length,
                total: 5
            }
        ]
    }, [queryBabylon.data, queryBabylon.isFetched, queryDust.data, queryDust.isFetched, queryLocalData.data, queryLocalData.isFetched, queryUnion.data, queryWithdraw.data, queryWithdraw.isFetched]);

    return {
        data,
        isFetchedOne, isFetched, fetchedStatus,
        refetch: queryUnion.refetch
    }
}

interface IndexerTokenParams {
    transaction: IndexerTransaction
    tokens: CustomToken[]
}

const useIndexerTokens = (params: IndexerTokenParams) => {
    const token = useMemo(() => {
        const res: {
            send: CustomToken | undefined,
            receive: CustomToken | undefined,
        } = {
            send: undefined,
            receive: undefined
        };

        if (params.transaction.lst === "babylon") {
            switch (params.transaction.action) {
                case "bond":
                    // Send
                    if (params.transaction.ibcChannelId) {
                        switch (params.transaction.ibcChannelId) {
                            case undefined:
                            case null:
                            case "channel-3":
                                res.send = BABY_TOKENS.osmosis;
                                break;
                        }
                    } else {
                        switch (params.transaction.channelId) {
                            case undefined:
                            case null:
                            case 0:
                                res.send = BABY_TOKENS.babylon;
                                break;
                            case 3:
                                res.send = BABY_TOKENS.mainnet;
                                break;
                            case 4:
                                res.send = BABY_TOKENS.osmosis;
                                break;
                        }
                    }

                    // Recv
                    switch (params.transaction.recipientChannelId) {
                        case undefined:
                        case null:
                        case 0:
                            res.receive = EBABY_TOKENS.babylon;
                            break;
                        case 3:
                            res.receive = EBABY_TOKENS.mainnet;
                            break;
                        case 4:
                            res.receive = EBABY_TOKENS.osmosis;
                            break;
                    }
                    break;

                case "unbond":
                    // Send
                    switch (params.transaction.channelId) {
                        case undefined:
                        case null:
                        case 0:
                            res.send = EBABY_TOKENS.babylon;
                            break;
                        case 3:
                            res.send = EBABY_TOKENS.mainnet;
                            break;
                        case 4:
                            res.send = EBABY_TOKENS.osmosis;
                            break;
                    }

                    // Recv
                    if (params.transaction.recipientIbcChannelId) {
                        switch (params.transaction.recipientIbcChannelId) {
                            case undefined:
                            case null:
                            case "channel-3":
                                res.receive = BABY_TOKENS.osmosis;
                                break;
                        }
                    } else {
                        switch (params.transaction.recipientChannelId) {
                            case undefined:
                            case null:
                            case 0:
                                res.receive = BABY_TOKENS.babylon;
                                break;
                            case 3:
                                res.receive = BABY_TOKENS.mainnet;
                                break;
                            case 4:
                                res.receive = BABY_TOKENS.osmosis;
                                break;
                        }
                    }
                    break;
            }
        }

        if (params.transaction.lst === "union") {
            res.send = params.tokens.find(t => t.contractAddress === params.transaction.denomA);
            res.receive = params.tokens.find(t => t.contractAddress === params.transaction.denomB);
        }
        return res;
    }, [params.transaction, params.tokens]);

    return {
        token
    }
}

const useLocalTokens = (params: IndexerTokenParams) => {
    const token = useMemo(() => {
        const res: {
            send: CustomToken | undefined,
            receive: CustomToken | undefined,
        } = {
            send: undefined,
            receive: undefined
        };

        res.send = params.tokens.find(t => t.id === params.transaction.tokenIdA);
        res.receive = params.tokens.find(t => t.id === params.transaction.tokenIdB);
        return res;
    }, [params.transaction, params.tokens]);

    return {
        token
    }
}

const useTokens = (params: IndexerTokenParams, chainId: string | number) => {
    const token = useMemo(() => {
        const res: {
            send: CustomToken | undefined,
            receive: CustomToken | undefined,
        } = {
            send: undefined,
            receive: undefined
        };

        res.send = params.tokens.find(t =>
            t.chain.id === chainId &&
            (t.contractAddress?.toLowerCase() === params.transaction.denomA || t.denom?.toLowerCase() === params.transaction.denomA)
        );
        res.receive = params.tokens.find(t =>
            t.chain.id === chainId &&
            (t.contractAddress?.toLowerCase() === params.transaction.denomB || t.denom?.toLowerCase() === params.transaction.denomB)
        );
        return res;
    }, [chainId, params.tokens, params.transaction.denomA, params.transaction.denomB]);

    return {
        token
    }
}

export const useTransactionTokens = (params: IndexerTokenParams) => {
    const indexerTokens = useIndexerTokens(params);
    const localTokens = useLocalTokens(params);
    const mainnetTokens = useTokens(params, CHAINS.mainnet.id);

    if (params.transaction.source === "union" && params.transaction.action === "dust") {
        return mainnetTokens;
    }

    switch (params.transaction.source) {
        case "indexer":
            return indexerTokens;

        case "union":
            return localTokens;

        case "local":
            return localTokens;
    }
}
