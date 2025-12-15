import Button from "@/components/global/button";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityTower from "@/components/modal/addLiquidity/tower/addLiquidityTower";
import ClaimLiquidityTower from "@/components/modal/claimLiquidity/tower/claimLiquidityTower";
import RemoveLiquidityTower from "@/components/modal/removeLiquidity/tower/removeLiquidityTower";
import { useEscher } from "@/components/providers/escherProvider";
import { TowerPoolResult } from "@/hooks/defi/tower/useTowerDefi";
import { formatNumber, towerCanClaim } from "@/lib/utils";
import { Defi } from "@/types/defi";
import { SkipClient } from "@skip-go/client";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
    defi: Defi
    pool: TowerPoolResult
    isFetched: boolean
    skipClient?: SkipClient
    type: 'card' | 'row'
}

const TowerPool = (props: Props) => {
    const { account, setOpenWalletConnection } = useEscher();

    const canClaim = useMemo(() => {
        return towerCanClaim(props.pool.data)
    }, [props.pool]);

    /* 
        const routeRequest = useMemo((): RouteRequest | undefined => {
            if (
                !props.pool.data.hasPriceRatio ||
                !props.pool.data.tokenA.denom ||
                !props.pool.data.tokenB.denom
            ) return undefined;
    
            return {
                swapVenues: [
                    {
                        chainID: props.defi.chain.id.toString(),
                        name: "babylon-tower",
                    },
                ],
                sourceAssetDenom: `${props.pool.data.tokenA.isCw20 ? "cw20:" : ""}${props.pool.data.tokenA.denom}`,
                sourceAssetChainID: props.pool.data.tokenA.chain.id.toString(),
                destAssetDenom: `${props.pool.data.tokenB.isCw20 ? "cw20:" : ""}${props.pool.data.tokenB.denom}`,
                destAssetChainID: props.pool.data.tokenB.chain.id.toString(),
                amountIn: formatDecimal(1, props.pool.data.tokenA.decimals).toFixed(0),
                allowSwaps: true,
                allowUnsafe: true,
            };
        }, [props.pool, props.defi]);
    
        const simulation = useSkipSimulation({
            skipClient: props.skipClient,
            routeRequest
        });
    
        const priceRatio = useMemo(() => {
            if (!simulation.data?.amountOut) return undefined;
            return formatDecimal(Number(simulation.data?.amountOut), -props.pool.data.tokenB.decimals);
        }, [simulation.data]);
     */

    return (
        <tr className="border-t dark:border-escher-darkblue_border">
            <td className="py-4 px-2 pl-4">
                <div
                    className="flex items-center justify-start gap-2"
                    onClick={() => console.log({ pool: props.pool })}
                >
                    {props.pool.data.tokenA.icon &&
                        <Image src={props.pool.data.tokenA.icon} alt="" width={32} height={32} className="z-10" />
                    }
                    {props.pool.data.tokenB.icon &&
                        <Image src={props.pool.data.tokenB.icon} alt="" width={32} height={32} className="-ml-4" />
                    }
                    <div className="flex flex-col">
                        <div className="font-semibold text-black dark:text-white">{props.pool.data.tokenA.symbol} / {props.pool.data.tokenB.symbol}</div>
                        <div className="text-xs text-escher-electricblue dark:text-white">{props.pool.data.type}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2">
                <div className="flex">
                    <div className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-0.5 bg-[#FAE5B9]">
                        <Image src={props.defi.logoURI} alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 text-sm font-medium">{props.defi.name}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2">
                {props.isFetched ?
                    <div className="text-sm text-escher-black dark:text-white font-semibold ">${formatNumber(props.pool.data.tvl ?? 0)}</div>
                    :
                    <LdrsAnimation size={18} />
                }
            </td>
            <td className="py-4 px-2">
                {props.isFetched ?
                    <div className="text-sm text-escher-black dark:text-white font-semibold ">{formatNumber((props.pool.data.apr?.week?.total ?? 0) * 100)}%</div>
                    :
                    <LdrsAnimation size={18} />
                }
            </td>
            <td className="py-4 px-2">
                {props.isFetched ?
                    <div className="text-sm text-escher-black dark:text-white font-semibold ">${formatNumber(props.pool.data.volume?.week ?? 0)}</div>
                    :
                    <LdrsAnimation size={18} />
                }
            </td>
            <td className="py-4 px-2">
                <div className="flex items-center gap-0.5 leading-none">
                    {props.pool.data.multiplier.map(m =>
                        <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full px-1 py-0.5 flex items-center gap-1">
                            <div className="text-[10px] font-medium text-escher-text2 dark:text-white">{m.text}</div>
                            <Image alt="" src={m.logoUri} className="w-3 h-3" />
                        </div>
                    )}
                </div>
            </td>
            <td className="py-4 px-2">
                <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
                    <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                        <Image alt="" src={props.pool.data.tokenA.icon ?? ""} className="w-4 h-4" />
                        <div>{formatNumber((props.pool.data.tokenAStaked ?? 0), true, 2)}</div>
                    </div>
                    <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                        <Image alt="" src={props.pool.data.tokenB.icon ?? ""} className="w-4 h-4" />
                        <div>{formatNumber((props.pool.data.tokenBStaked ?? 0), true, 2)}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2">

                <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
                    {canClaim ? <>
                        {props.pool.data.rewards?.map(r =>
                            <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                                <Image alt="" src={r.token.icon ?? ""} className="w-4 h-4" />
                                <div>{formatNumber((r.amount ?? 0), true, 2)}</div>
                            </div>
                        )}
                    </> : <>
                        <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                            <Image alt="" src={props.pool.data.tokenA.icon ?? ""} className="w-4 h-4" />
                            <div>0</div>
                        </div>
                        <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                            <Image alt="" src={props.pool.data.tokenB.icon ?? ""} className="w-4 h-4" />
                            <div>0</div>
                        </div>
                    </>}
                </div>
            </td>
            <td className="py-4 px-2 pr-4">
                {account.cosmos?.isConnected ?
                    <div className="flex gap-1.5">
                        <AddLiquidityTower
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.data}
                        />
                        <RemoveLiquidityTower
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.data}
                        />
                        <ClaimLiquidityTower
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.data}
                        />
                    </div>
                    :
                    <Button title="Connect" onClick={() => setOpenWalletConnection(true)} className="text-xs py-1 px-2" style="fill-light" />
                }
            </td>
        </tr>
    );

    // return (
    //     <Card className="gap-0 p-4">
    //         <div className="flex flex-col border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg">
    //             <div className="flex items-center py-[10px] leading-none">
    //                 <div className="flex-1 flex justify-center items-center">
    //                     <div className="text-escher-electricblue bg-escher-electricblue_light7 text-sm font-medium px-2 py-1 leading-none rounded">LP</div>
    //                 </div>
    //                 <div className="h-[20px] border-l border-escher-dedfff dark:border-escher-darkblue_border" />
    //                 <div className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-escher-text2 dark:text-white">
    //                     <Image alt="" src={props.defi.logoURI} className="w-[14px] h-[14px]" />
    //                     <div>{props.defi.name}</div>
    //                 </div>
    //             </div>

    //             <div className="flex items-center justify-center gap-2 py-4 border-t border-b border-escher-dedfff dark:border-escher-darkblue_border bg-gradient-to-r from-white via-white to-[#FCF9F0]">
    //                 {props.pool.data.tokenA.icon &&
    //                     <Image src={props.pool.data.tokenA.icon} alt="" width={32} height={32} className="z-10" />
    //                 }
    //                 {props.pool.data.tokenB.icon &&
    //                     <Image src={props.pool.data.tokenB.icon} alt="" width={32} height={32} className="-ml-4" />
    //                 }
    //                 <div className="flex flex-col">
    //                     <div className="font-semibold text-black">{props.pool.data.tokenA.symbol} / {props.pool.data.tokenB.symbol}</div>
    //                     <div className="text-xs text-escher-electricblue">{props.pool.data.type}</div>
    //                 </div>
    //             </div>

    //             <div className="flex items-center justify-center gap-2 leading-none py-[10px]">
    //                 {props.pool.data.multiplier.map(m =>
    //                     <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full px-2 py-0.5 flex items-center gap-1">
    //                         <div className="text-sm font-medium text-escher-text2 dark:text-white">{m.text}</div>
    //                         <Image alt="" src={m.logoUri} className="w-4 h-4" />
    //                     </div>
    //                 )}
    //             </div>
    //         </div>

    //         {/* TVL APR Volume */}
    //         <div className="flex flex-col border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg leading-none p-4 mt-4">
    //             <div className="flex items-center font-semibold">
    //                 <div className="flex-1 flex flex-col gap-1">
    //                     <div className="text-xs text-escher-electricblue">TVL</div>
    //                     <div className="text-sm text-escher-text2 dark:text-white ">${formatNumber(props.pool.data.tvl ?? 0)}</div>
    //                 </div>
    //                 <div className="flex-1 flex flex-col gap-1">
    //                     <div className="text-xs text-escher-electricblue">APR 7D</div>
    //                     <div className="text-sm text-escher-text2 dark:text-white ">{formatNumber((props.pool.data.apr?.week?.total ?? 0) * 100)}%</div>
    //                 </div>
    //                 <div className="flex-1 flex flex-col gap-1">
    //                     <div className="text-xs text-escher-electricblue">Volume 7D</div>
    //                     <div className="text-sm text-escher-text2 dark:text-white ">${formatNumber(props.pool.data.volume?.week ?? 0)}</div>
    //                 </div>
    //             </div>

    //             <hr className="my-4" />

    //             <div className="flex font-semibold text-escher-electricblue text-xs">
    //                 <div className="flex-1">Total {props.pool.data.tokenA.symbol}</div>
    //                 <div className="flex-1">Total {props.pool.data.tokenB.symbol}</div>
    //                 {props.pool.data.hasPriceRatio ?
    //                     <div className="flex-1">Ratio</div>
    //                     :
    //                     <div className="flex-1" />
    //                 }
    //             </div>
    //             <div className="flex items-center font-semibold text-escher-text2 dark:text-white text-xs mt-1">
    //                 <div className="flex-1 flex">
    //                     <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 leading-none flex items-center gap-1">
    //                         <Image alt="" src={props.pool.data.tokenA.icon ?? ""} className="w-4 h-4" />
    //                         <div>{formatNumber((props.pool.data.tokenAPoolAmount ?? 0), true, 2)}</div>
    //                     </div>
    //                 </div>
    //                 <div className="flex-1 flex">
    //                     <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 leading-none flex items-center gap-1">
    //                         <Image alt="" src={props.pool.data.tokenB.icon ?? ""} className="w-4 h-4" />
    //                         <div>{formatNumber((props.pool.data.tokenBPoolAmount ?? 0), true, 2)}</div>
    //                     </div>
    //                 </div>
    //                 {props.pool.data.hasPriceRatio ? <>
    //                     {
    //                         priceRatio ?
    //                             <div className="flex-1 text-sm">1: {formatNumber(priceRatio, true, 2)}</div>
    //                             :
    //                             <div className="flex-1">
    //                                 <LdrsAnimation size={18} />
    //                             </div>
    //                     }
    //                 </>
    //                     :
    //                     <div className="flex-1" />
    //                 }
    //             </div>
    //         </div>

    //         {/* Position */}
    //         {props.isCosmosConnected ?
    //             <div className="flex flex-col border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg leading-none p-4 mt-4">
    //                 <div className="flex">
    //                     <div className="flex-1 flex flex-col gap-1">
    //                         <div className="text-xs text-escher-electricblue font-semibold">My Position</div>
    //                         <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
    //                             <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
    //                                 <Image alt="" src={props.pool.data.tokenA.icon ?? ""} className="w-4 h-4" />
    //                                 <div>{formatNumber((props.pool.data.tokenAStaked ?? 0), true, 2)}</div>
    //                             </div>
    //                             <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
    //                                 <Image alt="" src={props.pool.data.tokenB.icon ?? ""} className="w-4 h-4" />
    //                                 <div>{formatNumber((props.pool.data.tokenBStaked ?? 0), true, 2)}</div>
    //                             </div>
    //                             <div className="text-escher-electricblue">${formatNumber((props.pool.data.position ?? 0), true, 2)}</div>
    //                         </div>
    //                     </div>
    //                     {canClaim &&
    //                         <div className="flex flex-col gap-1">
    //                             <div className="text-xs text-escher-electricblue font-semibold">Rewards</div>
    //                             <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
    //                                 {props.pool.data.rewards?.map(r =>
    //                                     <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
    //                                         <Image alt="" src={r.token.icon ?? ""} className="w-4 h-4" />
    //                                         <div>{formatNumber(formatDecimal((r.amount ?? 0), -r.token.decimals), true, 2)}</div>
    //                                     </div>
    //                                 )}
    //                             </div>
    //                         </div>
    //                     }
    //                 </div>

    //                 <hr className="my-4" />

    //                 <div className="flex items-center gap-2">
    //                     <AddLiquidityTower
    //                         defi={props.defi}
    //                         isApps={true}
    //                         pool={props.pool.data}
    //                     />
    //                     {props.pool.data.staked_share_amount &&
    //                         <>
    //                             <RemoveLiquidityTower
    //                                 defi={props.defi}
    //                                 isApps={true}
    //                                 pool={props.pool.data}
    //                             />
    //                             <ClaimLiquidityTower
    //                                 defi={props.defi}
    //                                 isApps={true}
    //                                 pool={props.pool.data}
    //                             />
    //                         </>
    //                     }
    //                 </div>
    //             </div>
    //             :
    //             <button
    //                 onClick={() => {
    //                     props.setOpenWalletConnection(true);
    //                 }}
    //                 className="flex items-center justify-center gap-2 bg-escher-E7E8FE hover:bg-escher-electricblue_light2 text-escher-electricblue p-2 font-semibold rounded-lg mt-4"
    //             >
    //                 <Image alt="" src={"/icons/wallet-blue.svg"} />
    //                 <div>Connect Wallet</div>
    //             </button>
    //         }

    //         <div className="text-xs text-escher-777e90 text-center mt-4">LP interaction executed vie <Link href={props.defi.link} target="_blank" className="text-escher-electricblue underline underline-offset-2">{props.defi.name}</Link> DEX.</div>
    //     </Card >
    // );
    // }
}

export default TowerPool;