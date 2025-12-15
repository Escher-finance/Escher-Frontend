import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { TraceLine } from "@/components/global/unionTrace/components";
import { useBabylonBond } from "@/hooks/liquidStakingContract/babylon/bond";
import { useBabylonUnbond } from "@/hooks/liquidStakingContract/babylon/unbond";
import { CustomToken } from "@/types/chain";
import { ProgressStatus } from "@/types/status";
import { Action } from "@/types/transaction";
import { ChainContext } from "@cosmos-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { PublicClient, WalletClient } from "viem";
import Error from "../../../shared/error";
import Success from "../../../shared/success";
import Traces from "../../../shared/traces";

interface Props {
    amount: string
    cosmosChainContext?: ChainContext
    estimateReceive: string
    onClose(): void
    operation: Action
    publicClient?: PublicClient
    token: CustomToken
    tokenReceive: CustomToken
    unbondingTime: string
    walletClient?: WalletClient
    recipientAddress: string
}

/* 
const testBondTx = "4D8E20CD3D605EF6FBB69FA74C3D7167C1DA637C3F65760B7A9B8D7F75E32992";
const testUnbondTx = "508A5FDF9A7E91CE9704A9D3128C5084D61B2E190001E0A742A20BD752D2DD9E";
 */

const totalLine = 26;

const Phase = (props: { status: ProgressStatus, title: string, subtitle: string, showLine: boolean }) => {
    return (
        <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1 items-center text-escher-electricblue dark:text-white">
                <div className="w-[1px] h-[6px]" />
                {props.status === 'pending' &&
                    <Icon type="FaRegCircle" />
                }
                {props.status === 'onProgress' &&
                    <LdrsAnimation type="ring2" size={16} />
                }
                {props.status === 'success' &&
                    <Icon type="FaCheckCircle" />
                }
                {props.showLine &&
                    <div className="w-[1px] h-10 bg-escher-electricblue" />
                }
            </div>
            <div className="flex flex-col leading-none">
                <div className="text-sm text-escher-text2 dark:text-white font-medium">{props.title}</div>
                <div className="text-xs text-escher-777e90">{props.subtitle}</div>
            </div>
        </div>
    );
}

const Content: React.FC<Props> = (props: Props) => {
    const isInitiated = useRef(false);
    const [successTxHash, setSuccessTxHash] = useState<string>();

    const {
        bondCosmos,
        bondEvm,
        statusOperation: statusOperationBondBabylon,
        statusPrepare: statusPrepareBondBabylon
    } = useBabylonBond();

    const {
        unbondCosmos,
        unbondEvm,
        statusOperation: statusOperationUnbondBabylon,
        statusPrepare: statusPrepareUnbondBabylon
    } = useBabylonUnbond();

    const [error, setError] = useState<string>();

    const [statusPrepare, statusOperation] = useMemo((): [ProgressStatus, ProgressStatus] => {
        switch (props.operation) {
            case "bond":
                return [statusPrepareBondBabylon, statusOperationBondBabylon];
            case "unbond":
                return [statusPrepareUnbondBabylon, statusOperationUnbondBabylon];
        }

        return ["pending", "pending"];
    }, [props.token, props.operation,
        statusPrepareBondBabylon, statusOperationBondBabylon,
        statusPrepareUnbondBabylon, statusOperationUnbondBabylon
    ]);

    const totalPhase = props.token.chain.network === "cosmos" ? 3 : 8;
    const curTrace = useMemo(() => {

        if (statusPrepare === "onProgress") {
            return 1 / totalPhase * 100;
        }

        if (statusOperation === "onProgress") {
            return 2 / totalPhase * 100
        }

        return 0;
    }, [statusPrepare, statusOperation]);

    const executeOperation = async () => {
        if (successTxHash) return;

        try {
            let txHash;

            if (props.operation === 'bond') {
                switch (props.token.chain.network) {
                    case "evm":
                        if (!props.publicClient || !props.walletClient) throw "Account not connected";

                        txHash = await bondEvm({
                            amount: props.amount,
                            estimateReceive: props.estimateReceive,
                            receiver: props.recipientAddress,
                            token: props.token,
                            tokenReceive: props.tokenReceive,
                            publicClient: props.publicClient,
                            walletClient: props.walletClient
                        });
                        break;
                    case "cosmos":
                        if (!props.cosmosChainContext) throw "Account not connected";

                        txHash = await bondCosmos({
                            amount: props.amount,
                            chainContext: props.cosmosChainContext,
                            estimateReceive: props.estimateReceive,
                            receiver: props.recipientAddress,
                            token: props.token,
                            tokenReceive: props.tokenReceive
                        });
                        break;
                }
            }
            if (props.operation === 'unbond') {
                switch (props.token.chain.network) {
                    case "evm":
                        if (!props.publicClient || !props.walletClient) throw "Account not connected";

                        txHash = await unbondEvm({
                            amount: props.amount,
                            estimateReceive: props.estimateReceive,
                            receiver: props.recipientAddress,
                            token: props.token,
                            tokenReceive: props.tokenReceive,
                            publicClient: props.publicClient,
                            walletClient: props.walletClient
                        });
                        break;
                    case "cosmos":
                        if (!props.cosmosChainContext) throw "Account not connected";

                        txHash = await unbondCosmos({
                            amount: props.amount,
                            chainContext: props.cosmosChainContext,
                            estimateReceive: props.estimateReceive,
                            receiver: props.recipientAddress,
                            token: props.token,
                            tokenReceive: props.tokenReceive
                        });
                }
            }

            if (txHash) {
                setSuccessTxHash(txHash);
            }
        } catch (error) {
            console.error(error);
            setError(String(error));
        }
    };

    useEffect(() => {
        const submit = async () => {
            if (isInitiated.current) return;
            isInitiated.current = true;
            executeOperation();
        };

        submit();
    }, []);

    if (successTxHash) {
        if (
            props.operation === "unbond" ||
            props.token.chain.network === "cosmos"
        ) {
            return <Success
                operation={props.operation}
                onClose={props.onClose}
                unbondingTime={props.unbondingTime}
                chainId={props.token.chain.id}
                hash={successTxHash}
                lst={"babylon"}
            />;
        }

        return <Traces
            amount={props.amount}
            estimateReceive={props.estimateReceive}
            onClose={props.onClose}
            operation={props.operation}
            successTxHash={successTxHash}
            token={props.token}
            tokenReceive={props.tokenReceive}
            unbondingTime={props.unbondingTime}
            lst="babylon"
        />
    }

    if (error) {
        return <Error error={error} onClose={props.onClose} />;
    }

    return (
        <div className="min-w-[620px] flex flex-col p-4 dark:text-white">
            {/* <button onClick={() => setSuccessTxHash(props.operation === "bond" ? testBondTx : testUnbondTx)}>skip</button> */}
            <div className="flex items-center justify-between">
                <div className="text-xl font-bold">TRANSACTION IN PROGRESS</div>
            </div>

            <div className="flex flex-col gap-2 rounded-[20px] border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-F5F6F8 dark:bg-escher-darkblue p-2 mt-4">
                <div className="flex">
                    <div className="w-[30%] bg-white dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1">
                        <div className="text-xl font-semibold flex-1 overflow-hidden">{props.amount}</div>
                        <TokenChain token={props.token} tokenSize={28} chainSize={14} />
                    </div>
                    <div className="w-[40%] flex justify-between px-4 relative">
                        {[...Array(totalLine)].map((_, index) => (
                            <TraceLine key={index} percentage={curTrace} curLine={index} totalLine={totalLine} isFinished={false} />
                        ))}
                    </div>
                    <div className="w-[30%] bg-white dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1">
                        <div className="text-xl font-semibold flex-1 overflow-hidden">{props.estimateReceive}</div>
                        <TokenChain token={props.tokenReceive} tokenSize={28} />
                    </div>
                </div>
                <div className="flex justify-between gap-16 p-2">
                    <Phase
                        title="STEP 1"
                        subtitle="Preparing transaction"
                        status={statusPrepare}
                        showLine={false}
                    />

                    <Phase
                        title="STEP 2"
                        subtitle="Executing transaction"
                        status={statusOperation}
                        showLine={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default Content;
