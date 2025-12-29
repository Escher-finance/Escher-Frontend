"use client";

import Button from "@/components/global/button";
import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import CustomAddress from "@/components/page/bridge/custom-address";
import Error from "@/components/page/bridge/error";
import Progress from "@/components/page/bridge/progress";
import SwapToken from "@/components/page/bridge/swap-token";
import TokenForm from "@/components/page/bridge/token-form";
import Traces from "@/components/page/bridge/traces";
import { useEscher } from "@/components/providers/escherProvider";
import { useTheme } from "@/components/providers/themeProvider";
import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { useCosmosBridge } from "@/hooks/bridge/useCosmosBridge";
import { useEvmBridge } from "@/hooks/bridge/useEvmBridge";
import { textToNumberRegex } from "@/lib/text";
import { CHANNEL_ID } from "@/lib/ucs03";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";

const Page = () => {
    const { account, escherTokens, setOpenWalletConnection, refetchTokens } = useEscher();
    const { themeIsDark } = useTheme();
    const evmPublicClient = usePublicClient();
    const { data: evmWalletClient } = useWalletClient();
    const {
        bridge: cosmosBridge,
        error: cosmosError,
        successHash: cosmosSuccessHash,
        isPending: cosmosIsPending
    } = useCosmosBridge();
    const {
        bridge: evmBridge,
        error: evmError,
        successHash: evmSuccessHash,
        isPending: evmIsPending
    } = useEvmBridge();

    // Pending
    const isPending = useMemo(() => cosmosIsPending || evmIsPending, [cosmosIsPending, evmIsPending]);

    // Error
    const [error, setError] = useState<string>();
    useEffect(() => {
        if (cosmosError || evmError) {
            setError(cosmosError ?? evmError);
        }
    }, [cosmosError, evmError]);

    // Success
    const [successHash, setSuccessHash] = useState<string>();
    useEffect(() => {
        if (cosmosSuccessHash || evmSuccessHash) {
            setSuccessHash(cosmosSuccessHash ?? evmSuccessHash);
        }
        refetchTokens();
    }, [cosmosSuccessHash, evmSuccessHash, refetchTokens]);

    const [fAmount, setFAmount] = useState("0");

    // Token In
    const tokenInList = useMemo(() => [
        escherTokens.babylon.ebaby,
        escherTokens.osmosis.ebaby,
        escherTokens.evm.ebaby,
    ], [escherTokens]);
    const [tokenInId, setTokenInId] = useState<string>();
    const tokenIn = useMemo(() => (tokenInList.find(v => v.id === tokenInId) ?? tokenInList[0]),
        [tokenInList, tokenInId]);

    // Token Out
    const tokenOutList = useMemo(() => {
        const result = [
            escherTokens.babylon.ebaby,
            escherTokens.osmosis.ebaby,
            escherTokens.evm.ebaby,
        ]
            // .filter(t => t.id !== tokenIn?.id && t.symbol === tokenIn?.symbol)
            .filter(t => CHANNEL_ID.get(tokenIn.chain.id)?.get(t.chain.id) !== undefined)

        return result;
    },
        [escherTokens, tokenIn]
    );
    const [tokenOutId, setTokenOutId] = useState<string>();
    const tokenOut = useMemo(() => (tokenOutList.find(v => v.id === tokenOutId) ?? tokenOutList[0]),
        [tokenOutList, tokenOutId]);

    // Initial Data
    useEffect(() => {
        if (!tokenIn) {
            if (account.cosmos?.isConnected) {
                setTokenInId(escherTokens.babylon.ebaby.id);
            }
            if (account.evm?.isConnected) {
                setTokenInId(escherTokens.evm.ebaby.id);
            }
        }
        if (!tokenOut) {
            if (account.cosmos?.isConnected) {
                setTokenOutId(escherTokens.babylon.ebaby.id);
            }
            if (account.evm?.isConnected) {
                setTokenOutId(escherTokens.evm.ebaby.id);
            }
        }
    }, [account, tokenIn, tokenOut, escherTokens]);

    // Set default destination
    useEffect(() => {
        setTokenOutId(tokenOutList.at(0)?.id)
    }, [tokenIn.id]);

    // Addresses
    const [recipientModalOpen, setRecipientModalOpen] = useState(false);
    const [addressIn, addressOut] = useMemo(() => {
        let addrIn;
        switch (tokenIn?.chain.id) {
            case CHAINS.mainnet.id:
                addrIn = account.evm?.address;
                break;
            case CHAINS.babylon.id:
                addrIn = account.cosmos?.address.babylon;
                break;
            case CHAINS.osmosis.id:
                addrIn = account.cosmos?.address.osmosis;
                break;
        }
        let addrOut;
        switch (tokenOut?.chain.id) {
            case CHAINS.mainnet.id:
                addrOut = account.evm?.address;
                break;
            case CHAINS.babylon.id:
                addrOut = account.cosmos?.address.babylon;
                break;
            case CHAINS.osmosis.id:
                addrOut = account.cosmos?.address.osmosis;
                break;
        }

        return [
            addrIn,
            addrOut
        ];
    }, [tokenIn, tokenOut, account]);
    const [fCustomAddress, setFCustomAddress] = useState<string>();
    const fRecipientAddress = useMemo(() => {
        return fCustomAddress ?? addressOut;
    }, [fCustomAddress, addressOut]);

    const buttonStatus = useMemo((): { enabled: boolean, text: string } => {
        // if (tokenIn?.chain.id === CHAINS.mainnet.id) {
        //     return {
        //         enabled: false,
        //         text: "not implemented"
        //     }
        // }

        if (APP_CONFIG.isBridgeMaintenance) {
            return {
                enabled: false,
                text: "Bridge unavailable"
            }
        }

        if (Number(fAmount) <= 0) {
            return {
                enabled: false,
                text: "Enter an amount"
            }
        }

        if (Number(fAmount) > Number(tokenIn?.balance?.formattedBalance ?? "0")) {
            return {
                enabled: false,
                text: "Insufficient balance"
            }
        }

        if (!fRecipientAddress) {
            return {
                enabled: false,
                text: "Set recipient address"
            }
        }

        if (tokenOut.chain.network === "evm" && !evmPublicClient && !evmWalletClient)
            return {
                enabled: false,
                text: "Connect EVM wallet"
            }

        return {
            enabled: true,
            text: "Bridge"
        }
    }, [fAmount, tokenIn, fRecipientAddress, tokenOut.chain.network, evmPublicClient, evmWalletClient]);

    const cosmosChainContext = useMemo(() => {
        if (tokenIn.chain.network === "cosmos") {
            switch (tokenIn.chain.id) {
                case CHAINS.babylon.id:
                    return account.cosmos?.chainContext?.babylon;
                case CHAINS.osmosis.id:
                    return account.cosmos?.chainContext?.osmosis;
            }
        }
    }, [account.cosmos?.chainContext?.babylon, account.cosmos?.chainContext?.osmosis, tokenIn.chain.id, tokenIn.chain.network]);

    const isOriginWalletConnected = useMemo(() => {
        if (!tokenIn) {
            return false;
        }
        const isSourceEVM = tokenIn.chain.network === "evm";
        const isSourceCosmos = tokenIn.chain.network === "cosmos";
        if (
            (isSourceEVM && !account.evm?.isConnected) ||
            (isSourceCosmos && !account.cosmos?.isConnected) ||
            (isSourceCosmos && cosmosChainContext === undefined)
        ) {
            return false;
        }

        return true;
    }, [account.cosmos?.isConnected, account.evm?.isConnected, cosmosChainContext, tokenIn]);

    const submit = () => {
        if (
            !addressIn ||
            !fRecipientAddress ||
            !tokenIn ||
            !tokenOut
        ) {
            console.error({
                addressIn,
                fRecipientAddress,
                tokenIn,
                tokenOut
            });

            return;
        }
        setSuccessHash(undefined);
        setError(undefined);

        if (tokenIn.chain.network === "cosmos" && cosmosChainContext) {
            cosmosBridge({
                senderAddress: addressIn,
                recipientAddress: fRecipientAddress,
                chainContext: cosmosChainContext,
                amount: fAmount,
                tokenIn: tokenIn,
                tokenOut: tokenOut
            });
        }
        if (tokenIn.chain.network === "evm") {
            if (!evmPublicClient || !evmWalletClient) return;

            evmBridge({
                senderAddress: addressIn,
                recipientAddress: fRecipientAddress,
                amount: fAmount,
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                publicClient: evmPublicClient,
                walletClient: evmWalletClient
            });
        }
    }

    return (
        <div className="h-full flex flex-col gap-8 py-6">
            {APP_CONFIG.isBridgeMaintenance &&
                <div className="flex bg-escher-electricblue text-white justify-center text-sm font-medium py-3">{APP_CONFIG.bridgeMaintenanceMessage}</div>
            }
            {/* <button onClick={() => {

            }}>log</button> */}
            <Card className="w-full max-w-[518px] gap-6 relative self-center dark:bg-escher-dark_0c203d">
                <div className="flex flex-col gap-4 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg p-6 dark:bg-escher-darkblue">
                    <TokenForm
                        activeToken={tokenIn}
                        address={addressIn}
                        cosmosIsConnected={account.cosmos?.isConnected ?? false}
                        evmIsConnected={account.evm?.isConnected ?? false}
                        skipTokenSelection={true}
                        title="From"
                        titleNetworkStep="Select origin network"
                        titleTokenStep="Select token to bridge"
                        tokenList={tokenInList}
                        themeIsDark={themeIsDark}
                        onTokenSelected={(token) => {
                            setTokenInId(token.id);
                        }}
                    />

                    <SwapToken
                        onSwap={() => {
                            setTokenInId(tokenOut?.id);
                            setFAmount("0");
                            setFCustomAddress(undefined);
                        }}
                    />

                    <TokenForm
                        activeToken={tokenOut}
                        address={fRecipientAddress}
                        cosmosIsConnected={account.cosmos?.isConnected ?? false}
                        evmIsConnected={account.evm?.isConnected ?? false}
                        skipTokenSelection={true}
                        title="To"
                        titleTokenStep="Select destination token"
                        titleNetworkStep="Select destination network"
                        tokenList={tokenOutList}
                        themeIsDark={themeIsDark}
                        onTokenSelected={(token) => {
                            setTokenOutId(token.id);
                        }}
                    />
                </div>

                <div className="flex flex-col gap-4 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg p-6 dark:bg-escher-darkblue">
                    <div className="w-full relative h-full flex items-center justify-center">
                        <input
                            className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 py-2 font-semibold text-2xl w-full"
                            min={0}
                            onChange={e => {
                                let input = e.target.value;
                                try {
                                    const nativeEvent = e.nativeEvent as InputEvent;
                                    if (fAmount === "0" && /^\d$/.test(nativeEvent.data ?? "")) {
                                        input = nativeEvent.data!;
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                                const cleaned = textToNumberRegex(input, tokenIn?.decimals);
                                if (cleaned !== undefined) {
                                    setFAmount(cleaned);
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            type="text"
                            value={fAmount}
                        />
                        {tokenIn?.balance &&
                            <button
                                onClick={() => {
                                    setFAmount(tokenIn?.balance?.formattedBalance ?? "0");
                                }}
                                className="absolute right-2 text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-darkblue_2 hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold dark:border dark:border-escher-darkblue_border"
                            >MAX</button>
                        }
                    </div>
                    <div className="flex items-start justify-between">
                        <button
                            className="flex items-center gap-2 text-escher-electricblue dark:text-white leading-none bg-escher-edefff dark:bg-escher-darkblue_2 dark:border dark:border-escher-darkblue_border hover:bg-escher-electricblue_light8 px-2 py-1.5 rounded-full text-sm"
                            onClick={() => setRecipientModalOpen(true)}
                        >
                            <Image alt="" src={themeIsDark ? "/icons/wallet-white.svg" : "/icons/wallet-blue.svg"} className="w-4 h-4" width={16} height={16} />
                            <div className="font-medium">Recipient Address</div>
                            <div className="flex items-center justify-center bg-escher-d8d9ff dark:bg-escher-darkblue rounded-full p-1">
                                <Icon type="FiPlus" className="w-3 h-3" />
                            </div>
                        </button>
                        <div className="flex items-center gap-2">
                            <Image alt="" src={"/icons/wallet.svg"} width={16} height={16} />
                            <div className="text-sm text-escher-777e90">${tokenIn?.coingeckoPrice ? formatNumber((Number(fAmount) * tokenIn?.coingeckoPrice), true, 4) : "-"}</div>
                        </div>
                    </div>
                </div>

                {/* 
                    {tokenOut.chain.id === CHAINS.mainnet.id &&
                        <div className="flex justify-between px-0.5">
                            <div className="text-escher-141416 dark:text-white text-sm font-semibold">Relayer fee</div>
                            <div className="text-escher-electricblue dark:text-white text-sm">20 BABY</div>
                        </div>
                    } 
                 */}

                {isOriginWalletConnected ?
                    <Button
                        enabled={buttonStatus.enabled}
                        title={buttonStatus.text}
                        onClick={submit}
                    />
                    :
                    <Button
                        title="Connect wallet"
                        onClick={() => setOpenWalletConnection(true)}
                    />
                }
                {recipientModalOpen &&
                    <CustomAddress
                        onAddressSet={setFCustomAddress}
                        tokenOut={tokenOut}
                        onClose={() => setRecipientModalOpen(false)}
                        defaultAddress={fRecipientAddress}
                    />
                }
            </Card >

            {tokenIn && tokenOut &&
                <Progress
                    amount={fAmount}
                    open={isPending}
                    tokenIn={tokenIn}
                    tokenOut={tokenOut}
                />
            }

            {error &&
                <Error
                    open={error !== undefined}
                    setOpen={(val) => setError(val ? "" : undefined)}
                    error={error}
                />
            }

            {successHash &&
                <Traces
                    amount={fAmount}
                    open={successHash !== undefined}
                    tokenIn={tokenIn}
                    tokenOut={tokenOut}
                    operation="bridge"
                    setOpen={(val) => setSuccessHash(val ? "" : undefined)}
                    successTxHash={successHash}
                />
            }
        </div >
    );
}

export default Page;