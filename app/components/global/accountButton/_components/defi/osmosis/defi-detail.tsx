import LdrsAnimation from "@/components/global/ldrsAnimation";
import { OsmosisPoolResult } from "@/hooks/defi/osmosis/useOsmosisDefi";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";

interface Props {
    pool: OsmosisPoolResult
}

const DefiDetail = (props: Props) => {
    return (
        <div className="flex items-center justify-between py-2">
            {/* Asset */}
            <div className="flex items-center gap-1 font-semibold text-sm pt-1">
                {props.pool.pool.tokenA.icon &&
                    <Image src={props.pool.pool.tokenA.icon} width={20} height={20} alt="" className="z-10" />
                }
                {props.pool.pool.tokenB.icon &&
                    <Image src={props.pool.pool.tokenB.icon} width={20} height={20} alt="" className="-ml-2.5 bg-white rounded-full" />
                }
                <div className="font-medium text-black dark:text-white">{props.pool.pool.tokenA.symbol}</div>
                <div>/</div>
                <div className="font-medium text-black dark:text-white">{props.pool.pool.tokenB.symbol}</div>
            </div>

            {/* Position */}
            {props.pool.isFetched ?
                <div className="font-semibold text-escher-text2 dark:text-white text-xs pt-1.5">${formatNumber(props.pool.pool.position ?? 0)}</div>
                :
                <LdrsAnimation />
            }
        </div>
    );
}

export default DefiDetail;