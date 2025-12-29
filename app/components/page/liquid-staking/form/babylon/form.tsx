'use client';

import Card from "@/components/global/card";
import { EscherAccount, useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { BABY_TOKENS } from "@/configs/token";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useEffect, useMemo, useState } from "react";
import { PublicClient, WalletClient } from "viem";
import Claim from "../shared/claim";
import Control from "../shared/control";
import { ButtonStatus } from "../shared/shared";
import Dust from "./components/dust";
import { FormProps, SubmitForm } from "./components/submit-form";
import UnbondNow from "./components/unbond-now";
import UnbondType from "./components/unbond-type";

interface Props {
    account: EscherAccount
    exchangeRate?: { rate: number, baseSymbol: string, liquidSymbol: string }
    publicClient?: PublicClient
    tokenRefetch(): void
    tokens: CustomToken[]
    unbondingTime: string
    walletClient?: WalletClient
}

const FormBabylon = (props: Props) => {
    const { setOpenWalletConnection } = useEscher();

    const [operation, setOperation] = useState<Action>('bond');
    const [page, setPage] = useState<Action>("bond");
    const [unbondWait, setUnbondWait] = useState(true);

    // TOKENS ====================================

    // Input tokens
    const inputTokens = useMemo(() => {
        const filtered = props.tokens.filter((t) => {
            // skip uniswap tokens
            if (t.isUniswap) return false;

            // filter by operation type
            if (operation === "bond" && !t.isStakeAble) return false;
            if (operation === "unbond" && !t.isLiquid) return false;

            // chain-specific feature toggles
            if (t.chain.id === CHAINS.mainnet.id && !APP_CONFIG.bond.babylon.enableEthereum) return false;
            if (t.chain.id === CHAINS.osmosis.id && !APP_CONFIG.bond.babylon.enableOsmosis) return false;

            return true;
        });

        return filtered;
    }, [props.tokens, operation]);

    const [selectedInputTokenId, setSelectedInputTokenId] = useState(inputTokens[0].id);
    const selectedInputToken = useMemo(() => (inputTokens.find(v => v.id === selectedInputTokenId) ?? inputTokens[0]),
        [inputTokens, selectedInputTokenId]);

    // Output tokens
    const outputTokens = useMemo(() => {
        const filtered = props.tokens.filter((t) => {
            // skip uniswap tokens
            if (t.isUniswap) return false;

            const isBond = operation === "bond";
            const isUnbond = operation === "unbond";
            const inputChain = selectedInputToken.chain.id;

            if (isBond) {
                if (!t.isLiquid) return false;

                switch (inputChain) {
                    // case CHAINS.osmosis.id:
                    //     return [CHAINS.babylon.id, CHAINS.osmosis.id].includes(t.chain.id);
                    // case CHAINS.mainnet.id:
                    //     return ![CHAINS.osmosis.id].includes(t.chain.id);
                    default:
                        return true;
                }
            }

            if (isUnbond) {
                if (!t.isStakeAble) return false;

                switch (inputChain) {
                    // case CHAINS.osmosis.id:
                    //     return [CHAINS.babylon.id, CHAINS.osmosis.id].includes(t.chain.id);
                    // case CHAINS.mainnet.id:
                    //     return ![CHAINS.osmosis.id].includes(t.chain.id);
                    default:
                        return true;
                }
            }

            return false;
        }).filter((t) => {
            // chain-specific feature toggles
            if (t.chain.id === CHAINS.mainnet.id && !APP_CONFIG.bond.babylon.enableEthereum) return false;
            if (t.chain.id === CHAINS.osmosis.id && !APP_CONFIG.bond.babylon.enableOsmosis) return false;
            return true;
        });

        return filtered;
    }, [props.tokens, operation, selectedInputToken]);

    const [selectedOutputTokenId, setSelectedOutputTokenId] = useState(outputTokens[0].id);
    const selectedOutputToken = useMemo(() => (outputTokens.find(v => v.id === selectedOutputTokenId) ?? outputTokens[0]),
        [outputTokens, selectedOutputTokenId]);

    const [fInputAmount, setFInputAmount] = useState("0");
    const [error, setError] = useState<string>();

    // Addresses
    const [addressOut] = useMemo(() => {
        let addrOut;
        switch (selectedOutputToken?.chain.id) {
            case CHAINS.mainnet.id:
                addrOut = props.account.evm?.address;
                break;
            case CHAINS.babylon.id:
                addrOut = props.account.cosmos?.address.babylon;
                break;
            case CHAINS.osmosis.id:
                addrOut = props.account.cosmos?.address.osmosis;
                break;
        }

        return [
            addrOut
        ];
    }, [props.account.cosmos?.address.babylon, props.account.cosmos?.address.osmosis, props.account.evm?.address, selectedOutputToken?.chain.id]);

    const [fCustomAddress, setFCustomAddress] = useState<string>();
    const fRecipientAddress = useMemo(() => {
        return fCustomAddress ?? addressOut;
    }, [fCustomAddress, addressOut]);

    useEffect(() => {
        setFCustomAddress(undefined);
    }, [selectedOutputTokenId]);

    // On operation change
    useEffect(() => {
        setFInputAmount("0");
    }, [operation]);
    // ======================================

    // ON TOKEN SELECTED
    useEffect(() => {
        // Set liquid token
        let targetTokenId;
        switch (operation) {
            case "bond":
                targetTokenId = outputTokens.find(t => (t.isLiquid && !t.isNative && t.chain.id === selectedInputToken.chain.id))?.id;
                break;
            case "unbond":
                switch (selectedInputToken.chain.id) {
                    case CHAINS.babylon.id:
                        targetTokenId = outputTokens.find(t => t.id == BABY_TOKENS.babylon.id)?.id;
                        break;

                    case CHAINS.osmosis.id:
                        targetTokenId = outputTokens.find(t => t.id == BABY_TOKENS.osmosis.id)?.id;
                        break;

                    case CHAINS.mainnet.id:
                        targetTokenId = outputTokens.find(t => t.id == BABY_TOKENS.mainnet.id)?.id;
                        break;
                }
                break;
        }

        if (targetTokenId) {
            setSelectedOutputTokenId(targetTokenId);
        }

        // Set default recipient
        setFCustomAddress(undefined);
    }, [operation, selectedInputToken.chain.id]);

    // Set chainContext
    const cosmosChainContext = useMemo(() => {
        if (selectedInputToken.chain.network === "cosmos") {
            switch (selectedInputToken.chain.id) {
                case CHAINS.babylon.id:
                    return props.account.cosmos?.chainContext?.babylon;
                case CHAINS.osmosis.id:
                    return props.account.cosmos?.chainContext?.osmosis;
            }
        }
    }, [props.account.cosmos?.chainContext?.babylon, props.account.cosmos?.chainContext?.osmosis, selectedInputToken.chain.id, selectedInputToken.chain.network]);
    // ======================================

    const outputAmount = useMemo(() => {
        const rate = props.exchangeRate?.rate;
        if (!rate) return undefined;

        const numericAmount = Number(fInputAmount);
        const calculated =
            operation === "bond"
                ? numericAmount / rate
                : operation === "unbond"
                    ? numericAmount * rate
                    : 0;

        return calculated.toFixed(selectedOutputToken.decimals).replace(/\.?0+$/, "");
    }, [fInputAmount, operation, props.exchangeRate?.rate, selectedOutputToken.decimals]);

    const buttonStatus = useMemo((): ButtonStatus => {
        const enabled = true;
        const text = `Get ${selectedOutputToken.symbol}`;

        // return {
        //     enabled,
        //     text
        // };

        if (
            !APP_CONFIG.enableEvmStaking &&
            (selectedInputToken.chain.network === "evm" || selectedOutputToken.chain.network === "evm")
        ) {
            return {
                enabled: false,
                text: "Staking unavailable"
            }
        }

        if (
            !APP_CONFIG.enableUnbond &&
            operation === "unbond"
        ) {
            return {
                enabled: false,
                text: "Unstaking unavailable"
            }
        }

        if (!fRecipientAddress || fRecipientAddress === "") {
            return {
                enabled: false,
                text: "Enter recipient address"
            }
        }

        if (Number(fInputAmount) <= 0) {
            return {
                enabled: false,
                text: "Enter an amount"
            }
        }

        if (selectedInputToken.balance === undefined) {
            return {
                enabled: false,
                text: "Insufficient balance"
            }
        }

        const inputBalance = Number(selectedInputToken.balance.formattedBalance);
        const inputAmount = Number(fInputAmount);
        if (inputBalance < inputAmount) {
            return {
                enabled: false,
                text: "Insufficient balance"
            }
        }

        const quoteAmount = Number(fInputAmount);
        if (quoteAmount < APP_CONFIG.minimumAmount) {
            const minimumAmount = `${APP_CONFIG.minimumAmount}`;
            return {
                enabled: false,
                text: `Minimum amount is ${minimumAmount}`
            }
        }

        return {
            enabled,
            text
        };
    }, [fInputAmount, fRecipientAddress, operation, selectedInputToken.balance, selectedInputToken.chain.network, selectedOutputToken.chain.network, selectedOutputToken.symbol]);


    const useFormProps = (): FormProps => {
        return {
            account: props.account,
            buttonStatus: buttonStatus,
            cosmosChainContext: cosmosChainContext,
            error: error,
            fInputAmount: fInputAmount,
            fRecipientAddress: fRecipientAddress,
            inputTokens: inputTokens,
            operation: operation,
            outputAmount: outputAmount,
            outputTokens: outputTokens,
            publicClient: props.publicClient,
            selectedInputToken: selectedInputToken,
            selectedOutputToken: selectedOutputToken,
            unbondingTime: props.unbondingTime,
            walletClient: props.walletClient,
            setError: setError,
            setFCustomAddress: setFCustomAddress,
            setFInputAmount: setFInputAmount,
            setOpenWalletConnection: setOpenWalletConnection,
            setSelectedInputTokenId: setSelectedInputTokenId,
            setSelectedOutputTokenId: setSelectedOutputTokenId,
            tokenRefetch: props.tokenRefetch,
        }
    }
    const formProps = useFormProps();

    return (
        <Card className="dark:bg-escher-dark_0c203d">
            <Control
                canClaim={true}
                page={page}
                setOperation={setOperation}
                setPage={setPage}
            />

            {page === "bond" &&
                <SubmitForm
                    {...formProps}
                />
            }

            {page === "unbond" &&
                <>
                    <UnbondType
                        unbondWait={unbondWait}
                        setUnbondWait={setUnbondWait}
                    />
                    {unbondWait ?
                        <SubmitForm
                            {...formProps}
                        />
                        :
                        <UnbondNow />
                    }
                </>
            }

            {page === "dust" &&
                <Dust
                    exchangeRate={props.exchangeRate?.rate}
                />
            }

            {page === "withdraw" &&
                <Claim />
            }
        </Card >
    );
}

export default FormBabylon;