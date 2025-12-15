import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityOsmosis from "@/components/modal/addLiquidity/osmosis/addLiquidityOsmosis";
import { OsmosisPoolResult } from "@/hooks/defi/osmosis/useOsmosisDefi";
import { formatNumber } from "@/lib/utils";
import { Defi } from "@/types/defi";
import Image from "next/image";

interface Props {
    defi: Defi
    pool: OsmosisPoolResult,
    type: 'card' | 'row'
}

const OsmosisPool = (props: Props) => {
    if (props.type === "row") {
        return (
            <tr className="border-t dark:border-escher-darkblue_border">
                <td className="py-4 px-2 pl-4">
                    <div className="flex items-center justify-start gap-2">
                        {props.pool.pool.tokenA.icon &&
                            <Image src={props.pool.pool.tokenA.icon} alt="" width={32} height={32} className="z-10" />
                        }
                        {props.pool.pool.tokenB.icon &&
                            <Image src={props.pool.pool.tokenB.icon} alt="" width={32} height={32} className="-ml-4" />
                        }
                        <div className="flex flex-col">
                            <div className="font-semibold text-black dark:text-white">{props.pool.pool.tokenA.symbol} / {props.pool.pool.tokenB.symbol}</div>
                            <div className="text-xs text-escher-electricblue">{props.pool.pool.type}</div>
                        </div>
                    </div>
                </td>
                <td className="py-4 px-2">
                    <div className="flex">
                        <div className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-0.5 bg-[#c7b5f8]">
                            <Image src={props.defi.logoURI} alt="" width={16} height={16} className="border border-white rounded-full" />
                            <div className="text-escher-text2 text-sm font-medium">{props.defi.name}</div>
                        </div>
                    </div>
                </td>
                <td className="py-4 px-2">
                    {props.defi.tvl ?
                        <div className="text-sm text-escher-black dark:text-white font-semibold ">${formatNumber(props.defi.tvl)}</div>
                        :
                        <LdrsAnimation size={18} />
                    }
                </td>
                <td className="py-4 px-2">
                    {props.pool.pool.aprSingle ?
                        <div className="text-sm text-escher-black dark:text-white font-semibold ">{formatNumber(props.pool.pool.aprSingle * 100)}%</div>
                        :
                        <LdrsAnimation size={18} />
                    }
                </td>
                <td className="py-4 px-2">
                    {props.pool.pool.volume?.day !== undefined ?
                        <div className="text-sm text-escher-black dark:text-white font-semibold ">${formatNumber(props.pool.pool.volume?.day ?? 0)}</div>
                        :
                        <LdrsAnimation size={18} />
                    }
                </td>
                <td className="py-4 px-2">
                    <div className="flex items-center gap-0.5 leading-none">
                        {props.pool.pool.multiplier.map(m =>
                            <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full px-1 py-0.5 flex items-center gap-1">
                                <div className="text-[10px] font-medium text-escher-text2 dark:text-white">{m.text}</div>
                                <Image alt="" src={m.logoUri} className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                </td>
                <td className="py-4 px-2">
                    {props.pool.isFetched ?
                        <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
                            <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                                <Image alt="" src={props.pool.pool.tokenA.icon ?? ""} className="w-4 h-4" />
                                <div>{formatNumber(props.pool.pool.tokenAStaked ?? 0)}</div>
                            </div>
                            <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                                <Image alt="" src={props.pool.pool.tokenB.icon ?? ""} className="w-4 h-4" />
                                <div>{formatNumber(props.pool.pool.tokenBStaked ?? 0)}</div>
                            </div>
                        </div>
                        :
                        <LdrsAnimation size={18} />
                    }
                </td>
                <td className="py-4 px-2">
                    {props.pool.isFetched ?
                        <div className="flex items-center gap-1 font-semibold text-escher-text2 dark:text-white text-xs">
                            {props.pool.pool.rewards?.map(reward =>
                                <div className="border border-escher-dedfff dark:border-escher-darkblue_border rounded-full p-1 pr-2 flex items-center gap-1">
                                    <Image alt="" src={reward.token.icon ?? ""} className="w-4 h-4" />
                                    <div>{formatNumber(Number(reward.amount), true, 2)}</div>
                                </div>
                            )}
                        </div>
                        :
                        <LdrsAnimation size={18} />
                    }
                </td>
                <td className="py-4 px-2 pr-4">
                    <div className="flex gap-1.5">
                        <AddLiquidityOsmosis
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.pool}
                            type="add"
                        />
                        <AddLiquidityOsmosis
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.pool}
                            type="remove"
                        />
                        <AddLiquidityOsmosis
                            defi={props.defi}
                            isApps={true}
                            pool={props.pool.pool}
                            type="claim"
                        />
                    </div>
                </td>
            </tr>
        )
    }
}

export default OsmosisPool;