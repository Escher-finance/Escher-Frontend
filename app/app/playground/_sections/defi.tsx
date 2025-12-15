import Button from "@/components/global/button";
import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import useDefi from "@/hooks/defi/useDefi";
import { formatDecimal, formatNumber } from "@/lib/utils";

const Defi = () => {
    const {
        uniswap: defiUniswap,
        osmosis: defiOsmosis
    } = useDefi();

    return (
        <Card className="items-start gap-0 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Defi</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <Button onClick={async () => {

                const volumeResponse = await fetch(`/api/osmosis/pool?poolId=3055`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const volumes = await volumeResponse.json();

                const volumeFormatted: {
                    day?: number
                    week?: number
                } | undefined = volumes !== undefined ? {
                    day: volumes?.market.volume24hUsd && Number(volumes?.market.volume24hUsd.amount),
                    week: volumes?.market.volume7dUsd && Number(volumes?.market.volume7dUsd.amount)
                } : undefined;
                console.log({ volumes, volumeFormatted });

            }} title="log" />

            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-11 gap-y-2 gap-x-4">
                    <div>Title</div>
                    <div>TVL</div>
                    <div>APR 24h</div>
                    <div>APR 7d</div>
                    <div>Volume 24h</div>
                    <div>Volume 7d</div>
                    <div>Position</div>
                    <div>Token A Staked</div>
                    <div>Token B Staked</div>
                    <div>Rewards</div>
                    <div>Log</div>

                    {defiUniswap.pools.map((pool) =>
                        <>
                            <div>{pool.defiPool.title}</div>
                            <div>${formatNumber(Number(pool.apr?.calculationInputs.tvlUsd))}</div>
                            <div>{formatNumber((pool.apr?.aprs.latest ?? 0), false, 4)}%</div>
                            <div>-</div>
                            <div>${formatNumber(pool.apr?.calculationInputs.latest24hVolumeUsd ?? 0)}</div>
                            <div></div>
                            {pool.isFetched ? <>
                                <div>${formatNumber(Number(pool.position?.totalValue ?? 0))}</div>
                                <div>
                                    {formatNumber(formatDecimal(
                                        Number(pool.position?.amount0 ?? 0), -pool.defiPool.tokenA.decimals))}
                                    {pool.defiPool.tokenA.symbol}
                                </div>
                                <div>
                                    {formatNumber(formatDecimal(
                                        Number(pool.position?.amount1 ?? 0), -pool.defiPool.tokenB.decimals))}
                                    {pool.defiPool.tokenB.symbol}
                                </div>
                                <div className="flex flex-col">
                                    <div>{formatNumber(formatDecimal(Number(pool.position?.tokensOwed0 ?? 0), -pool.defiPool.tokenA.decimals))} {pool.defiPool.tokenA.symbol}</div>
                                    <div>{formatNumber(formatDecimal(Number(pool.position?.tokensOwed1 ?? 0), -pool.defiPool.tokenB.decimals))} {pool.defiPool.tokenB.symbol}</div>
                                </div>
                            </> : <>
                                <LdrsAnimation />
                                <LdrsAnimation />
                                <LdrsAnimation />
                                <LdrsAnimation />
                            </>
                            }
                            <div onClick={() => console.log({ pool })}>log</div>
                        </>
                    )}

                    {defiOsmosis.info.pools.map((pool) =>
                        <>
                            <div>{pool.title}</div>
                            <div>${formatNumber(Number(defiOsmosis.info.tvl))}</div>
                            <div>-</div>
                            <div>-</div>
                            <div>${pool.volume?.day ? formatNumber(pool.volume?.day) : <LdrsAnimation />}</div>
                            <div>${pool.volume?.week ? formatNumber(pool.volume?.week) : <LdrsAnimation />}</div>
                            {defiOsmosis.isFetched ? <>
                                <div>${formatNumber(Number(pool.position ?? 0))}</div>
                                <div>{formatNumber(Number(pool.tokenAStaked ?? 0))} {pool.tokenA.symbol}</div>
                                <div>{formatNumber(Number(pool.tokenBStaked ?? 0))} {pool.tokenB.symbol}</div>
                                <div className="flex flex-col">
                                    {pool.rewards?.map(reward =>
                                        <div>{reward.amount} {reward.token.symbol}</div>
                                    )}
                                </div>
                            </> : <>
                                <LdrsAnimation />
                                <LdrsAnimation />
                                <LdrsAnimation />
                                <LdrsAnimation />
                            </>
                            }
                            <div onClick={() => console.log({ pool })}>log</div>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Defi;