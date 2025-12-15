import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { TraceLine } from "@/components/global/unionTrace/components";
import { CHAINS } from "@/configs/chains";
import { useEip7702 } from "@/hooks/useEip7702";
import { useLocalTransactions } from "@/hooks/local/useLocalTransactions";
import { getDateNow } from "@/lib/date";
import { formatDecimal, getChannelIdByChainIds } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { ProgressStatus } from "@/types/status";
import { Action } from "@/types/transaction";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useRef, useState } from "react";
import Error from "../../../shared/error";
import Traces from "../../../shared/traces";

interface Props {
    address: `0x${string}`
    feeAmount: bigint
    feeToken: CustomToken
    inputAmount: string
    onClose(): void
    operation: Action
    outputAmount: string
    quoteAmount: string
    slippage: string
    token: CustomToken
    tokenReceive: CustomToken
    unbondingTime: string
    recipientAddress: string
}

/* 
const testBondTx = "0xc06641b45e5c0683e0a4c089e845493cb189f75ffba9cccfdb75f6ca5ef6casdqwe";
const testUnbondTx = "0x18a755f3481d13d78235e97d35b0d6e59b822b52aeb27fd9d472a839810d7237";
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
    const isSavedLocal = useRef(false);
    const { saveData } = useLocalTransactions();
    const {
        bond: eip7702Bond,
        unbond: eip7702Unbond,
        successTxHash,
        statusOperation,
        statusPrepare,
        error: bondError
    } = useEip7702();
    // DEBUG
    // const successTxHash = testBondTx;

    const [error, setError] = useState<string>();

    const totalPhase = 8;
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

        const inputAmount = props.token.isUniswap ? props.quoteAmount : props.inputAmount;

        try {
            const recipientChannelId = getChannelIdByChainIds(
                CHAINS.babylon.id as string,
                props.tokenReceive.chain.id
            ).sourceChannelId;
            switch (props.operation) {
                case "bond":
                    await eip7702Bond({
                        address: props.address,
                        babyAmount: inputAmount,
                        epectedAmount: BigInt(formatDecimal(Number(props.outputAmount), props.tokenReceive.decimals).toFixed(0)),
                        feeAmount: props.feeAmount,
                        feeToken: props.feeToken,
                        inputToken: props.token,
                        slippage: props.slippage,
                        recipientAddress: props.recipientAddress,
                        recipientChannelId
                    });
                    break;
                case "unbond":
                    await eip7702Unbond({
                        address: props.address,
                        ebabyAmount: inputAmount,
                        feeAmount: props.feeAmount,
                        feeToken: props.feeToken,
                        recipientAddress: props.recipientAddress,
                        recipientChannelId
                    });
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error(error);
            setError(String(error));
        }
    };

    // TODO update once indexer can save sent token
    const saveLocal = (txHash: string) => {
        try {
            const inputAmount = props.token.isUniswap ? props.quoteAmount : props.inputAmount;
            saveData({
                lst: "babylon",
                action: props.operation,
                amountA: BigNumber(inputAmount).shiftedBy(props.tokenReceive.decimals).toFixed(0),
                amountB: BigNumber(props.outputAmount).shiftedBy(props.tokenReceive.decimals).toFixed(0),
                denomA: props.operation === 'bond' ? "ubbn" : "ebbn",
                exchangeRate: 0,
                hash: txHash,
                source: "local",
                status: "pending",
                submitted: undefined,
                time: getDateNow(),
                userAddress: props.address,
                recipient: props.recipientAddress,
                channelId: 0, // leave 0 since we are using token id
                recipientChannelId: 0, // same as above
                tokenIdA: props.token.id,
                tokenIdB: props.tokenReceive.id,
            });
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const submit = async () => {
            if (isInitiated.current) return;
            isInitiated.current = true;
            executeOperation();
        };

        submit();
    }, []);

    useEffect(() => {
        const submit = async () => {
            if (isSavedLocal.current) return;
            if (successTxHash) {
                isSavedLocal.current = true;
                saveLocal(successTxHash);
            }
        };

        submit();
    }, [successTxHash]);

    useEffect(() => {
        if (bondError) {
            console.log(bondError?.message);
            setError(bondError?.message);
        }
    }, [bondError]);

    if (successTxHash) {
        return <Traces
            amount={props.inputAmount}
            estimateReceive={props.outputAmount}
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
        <div className="min-w-[620px] flex flex-col p-4">
            {/* <button onClick={() => setSuccessTxHash(props.operation === "bond" ? testBondTx : testUnbondTx)}>skip</button> */}
            <div className="flex items-center justify-between">
                <div className="text-xl font-bold">TRANSACTION IN PROGRESS</div>
            </div>

            <div className="flex flex-col gap-2 rounded-[20px] border border-escher-dedfff bg-escher-F5F6F8 dark:bg-escher-darkblue p-2 mt-4">
                <div className="flex">
                    <div className="w-[30%] bg-white border border-escher-dedfff rounded-xl p-3 flex items-center gap-1">
                        <div className="text-xl font-semibold flex-1 overflow-hidden">{props.inputAmount}</div>
                        <TokenChain token={props.token} tokenSize={28} chainSize={14} />
                    </div>
                    <div className="w-[40%] flex justify-between px-4 relative">
                        {[...Array(totalLine)].map((_, index) => (
                            <TraceLine key={index} percentage={curTrace} curLine={index} totalLine={totalLine} isFinished={false} />
                        ))}
                    </div>
                    <div className="w-[30%] bg-white border border-escher-dedfff rounded-xl p-3 flex items-center gap-1">
                        <div className="text-xl font-semibold flex-1 overflow-hidden">{props.outputAmount}</div>
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
