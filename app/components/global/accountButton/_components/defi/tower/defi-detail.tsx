import LdrsAnimation from "@/components/global/ldrsAnimation";
import { TowerPoolResult } from "@/hooks/defi/tower/useTowerDefi";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";

interface Props {
    pool: TowerPoolResult
}

const DefiDetail = (props: Props) => {
    return (
        <div className="flex items-center justify-between py-2">
            {/* Asset */}
            <div className="flex items-center gap-1 font-semibold text-sm pt-1">
                {props.pool.data.tokenA.icon &&
                    <Image src={props.pool.data.tokenA.icon} width={20} height={20} alt="" className="z-10" />
                }
                {props.pool.data.tokenB.icon &&
                    <Image src={props.pool.data.tokenB.icon} width={20} height={20} alt="" className="-ml-2.5 bg-white rounded-full" />
                }
                <div className="font-medium text-black dark:text-white">{props.pool.data.tokenA.symbol}</div>
                <div>/</div>
                <div className="font-medium text-black dark:text-white">{props.pool.data.tokenB.symbol}</div>
            </div>


            {/* Position */}
            {props.pool.queryUserData.isFetched ?
                <div className="font-semibold text-escher-text2 dark:text-white text-xs pt-1.5">${formatNumber(props.pool.data.position ?? 0)}</div>
                :
                <LdrsAnimation />
            }
        </div>
    );
}

export default DefiDetail;