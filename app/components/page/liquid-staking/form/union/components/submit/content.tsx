import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { TraceLine } from "@/components/global/unionTrace/components";
import { useUnionBond } from "@/hooks/liquidStakingContract/union/bond";
import { useUnionUnbond } from "@/hooks/liquidStakingContract/union/unbond";
import { CustomToken } from "@/types/chain";
import { ProgressStatus } from "@/types/status";
import { Action } from "@/types/transaction";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PublicClient, WalletClient } from "viem";
import Error from "../../../shared/error";
import Traces from "../../../shared/traces";

interface Props {
    amount: string
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

// const testBondTx = "4D8E20CD3D605EF6FBB69FA74C3D7167C1DA637C3F65760B7A9B8D7F75E32992";
// const testUnbondTx = "508A5FDF9A7E91CE9704A9D3128C5084D61B2E190001E0A742A20BD752D2DD9E";

const totalLine = 26;

const Phase = (props: { status: ProgressStatus, title: string, subtitle: string, showLine: boolean }) => {
    return (
        <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1 items-center text-escher-electricblue dark:text-white">
                <div className="w-px h-1.5" />
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
                    <div className="w-px h-10 bg-escher-electricblue" />
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
    const [error, setError] = useState<string>();
    const {
        bond,
        statusPrepare: statusPrepareBond,
        statusApproval: statusApprovalBond,
        statusOperation: statusOperationBond,
    } = useUnionBond();

    const {
        unbond,
        statusPrepare: statusPrepareUnbond,
        statusApproval: statusApprovalUnbond,
        statusOperation: statusOperationUnbond,
    } = useUnionUnbond();

    const [statusPrepare, statusApproval, statusOperation] = useMemo((): [ProgressStatus, ProgressStatus, ProgressStatus] => {
        switch (props.operation) {
            case "bond":
                return [statusPrepareBond, statusApprovalBond, statusOperationBond];
            case "unbond":
                return [statusPrepareUnbond, statusApprovalUnbond, statusOperationUnbond];
        }

        return ["pending", "pending", "pending"];
    }, [props.operation, statusApprovalBond, statusApprovalUnbond, statusOperationBond, statusOperationUnbond, statusPrepareBond, statusPrepareUnbond]);

    const totalPhase = 3;
    const curTrace = useMemo(() => {

        if (statusPrepare === "onProgress") {
            return 1 / totalPhase * 100;
        }

        if (statusApproval === "onProgress") {
            return 2 / totalPhase * 100
        }

        if (statusOperation === "onProgress") {
            return 3 / totalPhase * 100
        }

        return 0;
    }, [statusApproval, statusOperation, statusPrepare]);

    const executeOperation = useCallback(async () => {
        if (successTxHash) return;

        if (!props.publicClient || !props.walletClient) {
            console.error({
                props
            });

            throw "Invalid client";
        }

        try {
            let txHash;

            if (props.operation === 'bond') {
                txHash = await bond({
                    amount: props.amount,
                    estimateReceive: props.estimateReceive,
                    recipientAddress: props.recipientAddress,
                    token: props.token,
                    tokenReceive: props.tokenReceive,
                    publicClient: props.publicClient,
                    walletClient: props.walletClient
                });
            }
            if (props.operation === 'unbond') {
                txHash = await unbond({
                    amount: props.amount,
                    estimateReceive: props.estimateReceive,
                    recipientAddress: props.recipientAddress,
                    token: props.token,
                    tokenReceive: props.tokenReceive,
                    publicClient: props.publicClient,
                    walletClient: props.walletClient
                });
            }

            if (txHash) {
                setSuccessTxHash(txHash);
            }
        } catch (error) {
            console.error(error);
            setError(String(error));
        }
    }, [bond, props, successTxHash, unbond]);

    useEffect(() => {
        const submit = async () => {
            if (isInitiated.current) return;
            isInitiated.current = true;
            executeOperation();
        };

        submit();
    }, [executeOperation]);

    if (successTxHash) {
        return <Traces
            amount={props.amount}
            estimateReceive={props.estimateReceive}
            onClose={props.onClose}
            operation={props.operation}
            successTxHash={successTxHash}
            token={props.token}
            tokenReceive={props.tokenReceive}
            unbondingTime={props.unbondingTime}
            lst="union"
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
                        {/* 
                            <div
                                className="absolute -top-5"
                                style={{
                                    left: `${curTrace}%`
                                }}
                            >
                                <div className="-ml-[50%] w-full bg-escher-electricblue rounded-full font-semibold text-sm px-3 pt-1 pb-1.5 leading-none text-white">state</div>
                            </div> 
                        */}

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
                        subtitle="Approve token spending"
                        status={statusApproval}
                        showLine={false}
                    />

                    <Phase
                        title="STEP 3"
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
