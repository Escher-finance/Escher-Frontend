'use client';

import Card from "@/components/global/card";
import { EscherAccount, useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { UnionRate } from "@/hooks/liquidStakingContract/union/rate";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useEffect, useMemo, useState } from "react";
import { PublicClient, WalletClient } from "viem";
import { useChainId, useSwitchChain } from "wagmi";
import Control from "../shared/control";
import { ButtonStatus } from "../shared/shared";
import Dust from "./components/dust";
import { FormProps, SubmitForm } from "./components/submit-form";
import UnbondNow from "./components/unbond-now";
import UnbondType from "./components/unbond-type";
import Withdraw from "./components/withdraw";

interface Props {
    account: EscherAccount
    exchangeRate?: UnionRate
    publicClient?: PublicClient
    tokenRefetch(): void
    tokens: CustomToken[]
    unbondingTime: string
    walletClient?: WalletClient
}

const FormUnion = (props: Props) => {
    const { setOpenWalletConnection } = useEscher();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const [operation, setOperation] = useState<Action>('bond');
    const [page, setPage] = useState<Action>("bond");
    const [unbondWait, setUnbondWait] = useState(true);

    // FORM
    const inputTokens = useMemo(() => [
        ...props.tokens.filter(t => t.lst?.includes("union")).filter(v => {
            if (operation === "bond")
                return (v.isStakeAble);

            if (operation === "unbond")
                return (v.isLiquid);
        }),
    ], [props.tokens, operation]);
    const [selectedInputTokenId, setSelectedInputTokenId] = useState(inputTokens[0].id);
    const selectedInputToken = useMemo(() => (inputTokens.find(v => v.id === selectedInputTokenId) ?? inputTokens[0]),
        [inputTokens, selectedInputTokenId]);

    const lstConfig = useMemo(() => selectedInputToken.chain.network_type === "mainnet" ? UNION_CONTRACTS.mainnet : UNION_CONTRACTS.holesky, [selectedInputToken]);

    const outputTokens = useMemo(() => props.tokens.filter(t => t.lst?.includes("union")).filter(v => {
        if (operation === "bond") {
            return (
                v.isLiquid &&
                v.chain.id === selectedInputToken.chain.id
            );
        }

        if (operation === "unbond") {
            return (
                v.isStakeAble &&
                v.chain.id === selectedInputToken.chain.id
            );
        }
    }),
        [props.tokens, operation, selectedInputToken]);
    const [selectedOutputTokenId, setSelectedOutputTokenId] = useState(outputTokens[0].id);
    const selectedOutputToken = useMemo(() => (outputTokens.find(v => v.id === selectedOutputTokenId) ?? outputTokens[0]),
        [outputTokens, selectedOutputTokenId]);

    const [fInputAmount, setFInputAmount] = useState("0");
    const [error, setError] = useState<string>();

    // Addresses
    const [addressOut] = useMemo(() => {
        let addrOut;
        switch (selectedOutputToken?.chain.network) {
            case "evm": addrOut = props.account.evm?.address; break;
            case "cosmos":
                switch (selectedOutputToken?.chain.id) {
                    case CHAINS.babylon.id:
                        addrOut = props.account.cosmos?.address.babylon
                        break;

                    case CHAINS.osmosis.id:
                        addrOut = props.account.cosmos?.address.osmosis
                        break;
                }
                break;
        }

        return [
            addrOut
        ];
    }, [props.account.cosmos?.address.babylon, props.account.cosmos?.address.osmosis, props.account.evm?.address, selectedOutputToken?.chain.id, selectedOutputToken?.chain.network]);

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

        if (chainId !== selectedInputToken.chain.id) {
            switchChain({ chainId: Number(selectedInputToken.chain.id) });
        }

        // Set liquid token
        let targetTokenId;
        switch (operation) {
            case "bond":
                targetTokenId = outputTokens.find(t => (t.isLiquid && t.chain.id === selectedInputToken.chain.id))?.id;
                break;
            case "unbond":
                targetTokenId = outputTokens.find(t => (t.isStakeAble && t.chain.id === selectedInputToken.chain.id))?.id;
                break;
        }

        if (targetTokenId) {
            setSelectedOutputTokenId(targetTokenId);
        }

        // Set default recipient
        setFCustomAddress(undefined);
    }, [chainId, operation, selectedInputToken.chain.id, switchChain]);

    const outputAmount = useMemo(() => {
        const rate = props.exchangeRate;
        if (!rate) return undefined;

        if (!fInputAmount) return undefined;

        const numericAmount = Number(fInputAmount);
        const calculated =
            operation === "bond"
                ? numericAmount * Number(rate.purchase_rate)
                : operation === "unbond"
                    ? numericAmount * Number(rate.redemption_rate)
                    : 0;

        return calculated.toFixed(selectedOutputToken.decimals).replace(/\.?0+$/, "");
    }, [fInputAmount, operation, props.exchangeRate, selectedOutputToken.decimals]);

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

        if (operation === "bond" && !lstConfig.feature.bond) {
            return {
                enabled: false,
                text: "Staking unavailable"
            }
        }

        if (operation === "unbond" && !lstConfig.feature.unbond) {
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

        if (inputAmount < lstConfig.minBond && operation === "bond") {
            return {
                enabled: false,
                text: `Minimum amount is ${lstConfig.minBond}`
            }
        }

        return {
            enabled,
            text
        };
    }, [fInputAmount, fRecipientAddress, lstConfig.feature.bond, lstConfig.feature.unbond, lstConfig.minBond, operation, selectedInputToken.balance, selectedInputToken.chain.network, selectedOutputToken.chain.network, selectedOutputToken.symbol]);

    const useFormProps = (): FormProps => {
        return {
            account: props.account,
            buttonStatus: buttonStatus,
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
                    exchangeRate={props.exchangeRate}
                />
            }

            {page === "withdraw" &&
                <Withdraw />
            }

        </Card >
    );
}

export default FormUnion;