import Button from "@/components/global/button";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { useEscher } from "@/components/providers/escherProvider";
import { useUnionWithdraw } from "@/hooks/liquidStakingContract/union/withdraw";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { useMemo, useState } from "react";
import { ButtonStatus } from "../../shared/shared";
import Icon from "@/components/global/icons";
import WithdrawTraces from "./withdraw/traces";

export default function Withdraw() {
    const { escherTokens } = useEscher();
    const { query: queryWithdraw, withdraw } = useUnionWithdraw();
    const [successHash, setSuccessHash] = useState<string>();
    const [isPending, setIsPending] = useState(false);

    const submit = async () => {
        setSuccessHash(undefined);
        setIsPending(true);
        try {
            if (!queryWithdraw.data) throw "No claimable";

            const res = await withdraw({
                batches: queryWithdraw.data
            });
            console.log({ res });
            queryWithdraw.refetch();
            setSuccessHash(res);
        } catch (error) {
            console.error(error);
        }
        setIsPending(false);
    }

    const buttonStatus = useMemo((): ButtonStatus => {
        const enabled = true;
        const text = `Withdraw`;

        if (isPending) {
            return {
                enabled: false,
                text: "Processing"
            }
        }

        if (queryWithdraw.isPending) {
            return {
                enabled: false,
                text: "Fetching available tokens"
            }
        }

        if (queryWithdraw.data && queryWithdraw.data.length <= 0) {
            return {
                enabled: false,
                text: "No withdrawable tokens"
            }
        }

        return {
            enabled,
            text
        }
    }, [queryWithdraw.data, queryWithdraw.isPending, isPending]);

    const canClaim = useMemo(() => (queryWithdraw.data?.length ?? 0) > 0, [queryWithdraw.data]);

    return (
        <div className="flex flex-col mt-4 gap-4 dark:text-white">
            <div className="flex flex-col gap-2 border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg p-4 text-sm">
                <div className="flex items-center justify-between">
                    <div className="text-gray-600 dark:text-gray-400">Available to Withdraw</div>
                    {queryWithdraw.isFetched ?
                        <div className="font-semibold">{queryWithdraw.data?.length ?? "No"} batch</div>
                        :
                        <LdrsAnimation />
                    }
                </div>
                {canClaim && <>
                    <hr className="border-gray-200 dark:border-escher-darkblue_border" />

                    <div className="flex items-center justify-between">
                        <div className="text-gray-600 dark:text-gray-400">Total Amount</div>
                        <div className="flex flex-col items-end gap-2 text-base font-semibold">
                            {queryWithdraw.data?.map((v, k) =>
                                <div key={k} className="flex items-center gap-2">
                                    <TokenChain token={escherTokens.evm.u} tokenSize={20} chainSize={12} />
                                    <div>{formatNumber(
                                        formatDecimal(Number(v.withdrawableAmount), -escherTokens.evm.u.decimals), true, 4
                                    )}</div>
                                    <div>{escherTokens.evm.u.symbol}</div>
                                </div>
                            )}
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">Ready to claim</div>
                        </div>
                    </div>
                </>}
            </div>
            {canClaim &&
                <div className="flex flex-col gap-2 border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg p-4 text-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-gray-600 dark:text-gray-400">You'll Receive</div>
                        <div className="flex flex-col items-end gap-2 text-base font-semibold">
                            <div className="flex items-center gap-2">
                                <TokenChain token={escherTokens.evm.u} tokenSize={20} chainSize={12} />
                                <div>{formatNumber(
                                    formatDecimal(Number(queryWithdraw.data?.reduce((sum, cur) => sum += cur.withdrawableAmount, BigInt(0))), -escherTokens.evm.u.decimals), true, 4
                                )}</div>
                                <div>{escherTokens.evm.u.symbol}</div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">To your wallet</div>
                        </div>
                    </div>
                </div>
            }

            <div className="flex gap-2 border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg p-2 items-center bg-slate-100 dark:bg-slate-800">
                <div className="p-1 bg-slate-400 text-white rounded">
                    <Icon type="FiInfo" />
                </div>
                <div className="flex flex-col">
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{canClaim ? "Ready to withdraw" : "Unbonded tokens appear here after 27-31 days"}</div>
                    <div className="text-xs text-slate-500">Withdraw your tokens to your wallet</div>
                </div>
            </div>
            <Button title={buttonStatus.text} enabled={buttonStatus.enabled} onClick={submit} />

            <WithdrawTraces
                amount={"0"}
                onClose={() => {
                    setSuccessHash(undefined);
                    queryWithdraw.refetch();
                }}
                operation="withdraw"
                token={escherTokens.evm.u}
                successTxHash={successHash}
            />
        </div>
    );
}