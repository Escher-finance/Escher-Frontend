import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityUniswap from "@/components/modal/addLiquidity/uniswap/addLiquidityUniswap";
import ClaimLiquidityUniswap from "@/components/modal/claimLiquidity/uniswap/claimLiquidityUniswap";
import RemoveLiquidityUniswap from "@/components/modal/removeLiquidity/uniswap/removeLiquidityUniswap";
import { useEscher } from "@/components/providers/escherProvider";
import { UniswapPoolResult } from "@/hooks/defi/uniswap/useUniswapDefi";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { Defi } from "@/types/defi";
import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";

interface Props {
    defi: Defi
    pool: UniswapPoolResult
}

const UniswapPool = (props: Props) => {
    const { account, setOpenWalletConnection } = useEscher();

    const [openAdd, setOpenAdd] = useState(false);
    const [openRemove, setOpenRemove] = useState(false);

    const inRange = useMemo(() =>
        props.pool.position?.isInRange,
        // false,
        [props.pool.position?.isInRange]
    );

    return (
        <tr className="border-t dark:border-escher-darkblue_border">
            <td className="py-4 px-2 pl-4">
                <div className="flex flex-col gap-2">
                    <div
                        className="flex items-center justify-start gap-2"
                        onClick={() => console.log({ props })}
                    >
                        {props.pool.defiPool.tokenA.icon &&
                            <Image src={props.pool.defiPool.tokenA.icon} alt="" width={32} height={32} className="z-10" />
                        }
                        {props.pool.defiPool.tokenB.icon &&
                            <Image src={props.pool.defiPool.tokenB.icon} alt="" width={32} height={32} className="-ml-4" />
                        }
                        <div className="flex flex-col items-start">
                            <div className="font-semibold text-black dark:text-white">{props.pool.defiPool.tokenA.symbol} / {props.pool.defiPool.tokenB.symbol}</div>
                            {inRange !== undefined &&
                                <div
                                    className={clsx(
                                        "flex items-center font-medium text-xs p-1 rounded gap-2",
                                        inRange ? "bg-green-700 text-green-100" : "bg-yellow-700 text-yellow-100 cursor-pointer"
                                    )}
                                    onClick={() => {
                                        if (!inRange) setOpenRemove(true);
                                    }}
                                >
                                    <Icon type={inRange ? "FaCheck" : "FaExclamationTriangle"} size="sm" />
                                    <div className="leading-none">{inRange ? "In range" : "Out of range"}</div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2">
                <div className="flex">
                    <div className="flex items-center gap-[6px] rounded-full pl-1 pr-2 py-0.5 bg-[#fdc3ec]">
                        <Image src={props.defi.logoURI} alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 text-sm font-medium">{props.defi.name}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2">
                {props.pool.apr?.calculationInputs.tvlUsd ?
                    <div className="text-sm text-escher-black dark:text-white font-semibold ">${formatNumber(props.pool.apr?.calculationInputs.tvlUsd)}</div>
                    :
                    <LdrsAnimation size={18} />
                }
            </td>
            <td className="py-4 px-2">
                {props.pool.apr ?
                    <div className="text-sm text-escher-black dark:text-white font-semibold ">{formatNumber(props.pool.apr?.aprs.latest ?? 0, false, 4)}%</div>
                    :
                    <LdrsAnimation size={18} />
                }
            </td>
            <td className="py-4 px-2">
                {props.pool.apr?.calculationInputs.latest24hVolumeUsd ?
                    <div className="text-sm text-escher-black dark:text-white font-semibold ">${formatNumber(props.pool.apr?.calculationInputs.latest24hVolumeUsd)}</div>
                    :
                    <LdrsAnimation size={18} />
                }
            </td>
            <td className="py-4 px-2">
                <div className="flex items-center gap-0.5 leading-none">
                    {props.pool.defiPool.multiplier.map(m =>
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
                        <Image alt="" src={props.pool.defiPool.tokenA.icon ?? ""} className="w-4 h-4" />
                        <div>{formatNumber(formatDecimal(Number(props.pool.position?.amount0 ?? 0), -(props.pool.position?.tokenA?.decimals ?? 0)), true, 2)}</div>
                    </div>
                    <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                        <Image alt="" src={props.pool.defiPool.tokenB.icon ?? ""} className="w-4 h-4" />
                        <div>{formatNumber(formatDecimal(Number(props.pool.position?.amount1 ?? 0), -(props.pool.position?.tokenB?.decimals ?? 0)), true, 2)}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2">
                <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
                    <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                        <Image alt="" src={props.pool.defiPool.tokenA.icon ?? ""} className="w-4 h-4" />
                        <div>{props.pool.position ? formatNumber(formatDecimal(Number(props.pool.position.tokensOwed0 ?? 0), -props.pool.defiPool.tokenA.decimals), true, 2) : "0"}</div>
                    </div>
                    <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                        <Image alt="" src={props.pool.defiPool.tokenB.icon ?? ""} className="w-4 h-4" />
                        <div>{props.pool.position ? formatNumber(formatDecimal(Number(props.pool.position.tokensOwed1 ?? 0), -props.pool.defiPool.tokenB.decimals), true, 2) : "0"}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2 pr-4">
                {account.evm?.isConnected ?
                    <div className="flex gap-[6px]">
                        <AddLiquidityUniswap
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.defiPool}
                            open={openAdd}
                            setOpen={setOpenAdd}
                            onRemoveModalOpen={() => setOpenRemove(true)}
                        />
                        <RemoveLiquidityUniswap
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.defiPool}
                            open={openRemove}
                            setOpen={setOpenRemove}
                        />
                        <ClaimLiquidityUniswap
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.defiPool}
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
    //                     <div
    //                         className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 text-sm font-medium px-2 py-1 leading-none rounded"
    //                         onClick={() => console.log({ props, queryPool })}
    //                     >LP</div>
    //                 </div>
    //                 <div className="h-[20px] border-l border-escher-dedfff dark:border-escher-darkblue_border" />
    //                 <div className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-escher-text2 dark:text-white">
    //                     <Image alt="" src={props.defi.logoURI} className="w-[14px] h-[14px]" />
    //                     <div>{props.defi.name}</div>
    //                 </div>
    //             </div>

    //             <div className="flex items-center justify-center gap-2 py-4 border-t border-b border-escher-dedfff dark:border-escher-darkblue_border bg-gradient-to-r from-white via-white to-[#FCF9F0]">
    //                 {props.pool.tokenA.icon &&
    //                     <Image src={props.pool.tokenA.icon} alt="" width={32} height={32} className="z-10" />
    //                 }
    //                 {props.pool.tokenB.icon &&
    //                     <Image src={props.pool.tokenB.icon} alt="" width={32} height={32} className="-ml-4" />
    //                 }
    //                 <div className="flex flex-col">
    //                     <div className="font-semibold text-black dark:text-white">{props.pool.tokenA.symbol} / {props.pool.tokenB.symbol}</div>
    //                     <div className="text-xs text-escher-electricblue dark:text-white">{props.pool.type}</div>
    //                 </div>
    //             </div>

    //             <div className="flex items-center justify-center gap-2 leading-none py-[10px]">
    //                 {props.pool.multiplier.map(m =>
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
    //                     <div className="text-xs text-escher-electricblue dark:text-white">TVL</div>
    //                     <div className="text-sm text-escher-text2 dark:text-white ">${formatNumber(queryPool.balances.tvl ?? 0)}</div>
    //                 </div>
    //                 <div className="flex-1 flex flex-col gap-1">
    //                     <div className="text-xs text-escher-electricblue dark:text-white">APR 7D</div>
    //                     <LdrsAnimation size={18} />
    //                 </div>
    //                 <div className="flex-1 flex flex-col gap-1">
    //                     <div className="text-xs text-escher-electricblue dark:text-white">Volume 7D</div>
    //                     <LdrsAnimation size={18} />
    //                 </div>
    //             </div>

    //             <hr className="my-4" />

    //             <div className="flex font-semibold text-escher-electricblue dark:text-white text-xs">
    //                 <div className="flex-1">Total {props.pool.tokenA.symbol}</div>
    //                 <div className="flex-1">Total {props.pool.tokenB.symbol}</div>
    //                 {props.pool.hasPriceRatio ?
    //                     <div className="flex-1">Ratio</div>
    //                     :
    //                     <div className="flex-1" />
    //                 }
    //             </div>
    //             <div className="flex items-center font-semibold text-escher-text2 dark:text-white text-xs mt-1">
    //                 <div className="flex-1 flex">
    //                     <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 leading-none flex items-center gap-1">
    //                         <Image alt="" src={props.pool.tokenA.icon ?? ""} className="w-4 h-4" />
    //                         <div>{formatNumber(formatDecimal(Number(queryPool.balances?.tokenA ?? 0), -props.pool.tokenA.decimals), true, 2)}</div>
    //                     </div>
    //                 </div>
    //                 <div className="flex-1 flex">
    //                     <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 leading-none flex items-center gap-1">
    //                         <Image alt="" src={props.pool.tokenB.icon ?? ""} className="w-4 h-4" />
    //                         <div>{formatNumber(formatDecimal(Number(queryPool.balances?.tokenB ?? 0), -props.pool.tokenB.decimals), true, 2)}</div>
    //                     </div>
    //                 </div>
    //                 {props.pool.hasPriceRatio ? <>
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
    //         {props.address ?
    //             <div className="flex flex-col border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg leading-none p-4 mt-4">
    //                 <div className="flex">
    //                     <div className="flex-1 flex flex-col gap-1">
    //                         <div className="text-xs text-escher-electricblue dark:text-white font-semibold">My Position</div>
    //                         <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
    //                             <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
    //                                 <Image alt="" src={props.pool.tokenA?.icon ?? ""} className="w-4 h-4" />
    //                                 <div>{formatNumber(formatDecimal(Number(queryPool.position?.amount0 ?? 0), -(queryPool.position?.tokenA?.decimals ?? 0)), true, 2)}</div>
    //                             </div>
    //                             <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
    //                                 <Image alt="" src={props.pool.tokenB?.icon ?? ""} className="w-4 h-4" />
    //                                 <div>{formatNumber(formatDecimal(Number(queryPool.position?.amount1 ?? 0), -(queryPool.position?.tokenB?.decimals ?? 0)), true, 2)}</div>
    //                             </div>
    //                             <div className="text-escher-electricblue dark:text-white">${formatNumber((queryPool.position?.totalValue ?? 0), true, 2)}</div>
    //                         </div>
    //                     </div>
    //                     {queryPool.position &&
    //                         <div className="flex flex-col gap-1">
    //                             <div className="text-xs text-escher-electricblue dark:text-white font-semibold">Rewards</div>
    //                             <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
    //                                 <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
    //                                     <Image alt="" src={props.pool.tokenA.icon ?? ""} className="w-4 h-4" />
    //                                     <div>{formatNumber(formatDecimal(Number(queryPool.position.tokensOwed0 ?? 0), -props.pool.tokenA.decimals), true, 2)}</div>
    //                                 </div>
    //                                 <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
    //                                     <Image alt="" src={props.pool.tokenB.icon ?? ""} className="w-4 h-4" />
    //                                     <div>{formatNumber(formatDecimal(Number(queryPool.position.tokensOwed1 ?? 0), -props.pool.tokenB.decimals), true, 2)}</div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     }
    //                 </div>

    //                 <hr className="my-4" />

    //                 <div className="flex items-center gap-2">
    //                     <AddLiquidityUniswap
    //                         defi={props.defi}
    //                         isApps={true}
    //                         pool={props.pool}
    //                     />
    //                     {queryPool.position &&
    //                         <>
    //                             <RemoveLiquidityUniswap
    //                                 defi={props.defi}
    //                                 isApps={true}
    //                                 pool={props.pool}
    //                             />
    //                             <ClaimLiquidityUniswap
    //                                 defi={props.defi}
    //                                 isApps={true}
    //                                 pool={props.pool}
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
    //                 className="flex items-center justify-center gap-2 bg-escher-E7E8FE hover:bg-escher-electricblue_light2 text-escher-electricblue dark:text-white p-2 font-semibold rounded-lg mt-4"
    //             >
    //                 <Image alt="" src={"/icons/wallet-blue.svg"} />
    //                 <div>Connect Wallet</div>
    //             </button>
    //         }

    //         <div className="text-xs text-escher-777e90 text-center mt-4">LP interaction executed vie <Link href={props.defi.link} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">{props.defi.name}</Link> DEX.</div>
    //     </Card >
    // );
}

export default UniswapPool;