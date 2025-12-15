import Button from "@/components/global/button";
import Card from "@/components/global/card";
import TokenChain from "@/components/global/tokenChain";
import { useEscher } from "@/components/providers/escherProvider";
import { useUnionWithdraw } from "@/hooks/liquidStakingContract/union/withdraw";
import { formatDecimal, formatNumber } from "@/lib/utils";

export const ClaimUnbonded = () => {
    const { escherTokens } = useEscher();

    const { query: queryClaimable, withdraw } = useUnionWithdraw();

    const submit = async () => {
        if (!queryClaimable.data) throw "No claimable";

        const res = await withdraw({
            batches: queryClaimable.data
        });
        console.log({ res });

    }

    const test = async () => {
        const indexerBatchesIdsResponse = await fetch(`/api/union/unbond-batch`);
        const releasedIds = (
            await indexerBatchesIdsResponse.json() as { id: number, released: string | null }[]
        ).filter(v => v.released !== null).map(v => v.id.toString());
        console.log(releasedIds);
    }

    return (
        <Card className="items-start gap-2 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Claim Unbonded</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <div className="flex flex-col gap-2 bg-sky-800 text-sky-100 w-1/2 p-4 rounded">
                <div className="flex items-center justify-between">
                    <div>Available to Withdraw</div>
                    <div>{queryClaimable.data?.length ?? 0} batch</div>
                </div>
                <hr />
                <div className="flex items-center justify-between">
                    <div>Total Amount</div>
                    {(queryClaimable.data?.length ?? 0) > 0 ?
                        <div className="flex flex-col gap-2">
                            {queryClaimable.data?.map((v, k) =>
                                <div key={k} className="flex items-center gap-2">
                                    <TokenChain token={escherTokens.evm.u} tokenSize={20} chainSize={12} />
                                    <div>{formatNumber(
                                        formatDecimal(Number(v.withdrawableAmount), -escherTokens.evm.u.decimals), true, 4
                                    )}</div>
                                    <div>{escherTokens.evm.u.symbol}</div>
                                </div>
                            )}
                        </div>
                        :
                        <div>-</div>
                    }
                </div>
            </div>
            <div className="flex flex-col gap-2 bg-sky-800 text-sky-100 w-1/2 p-4 rounded">
                <div className="flex items-center justify-between">
                    <div>You'll Receive</div>
                    {(queryClaimable.data?.length ?? 0) > 0 ?
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex items-center gap-2">
                                <TokenChain token={escherTokens.evm.u} tokenSize={20} chainSize={12} />
                                <div>{formatNumber(
                                    formatDecimal(Number(queryClaimable.data?.reduce((sum, cur) => sum += cur.withdrawableAmount, BigInt(0))), -escherTokens.evm.u.decimals), true, 4
                                )}</div>
                                <div>{escherTokens.evm.u.symbol}</div>
                            </div>
                            <div>To your wallet</div>
                        </div>
                        :
                        <div>-</div>
                    }
                </div>
            </div>
            <Button title="Withdraw" onClick={submit} />
            <Button title="Test" onClick={test} />
        </Card>
    );
}