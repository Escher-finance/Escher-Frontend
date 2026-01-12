import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Liquidity } from "@/types/types";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useMemo } from "react";

interface Props {
    liquidity?: Liquidity
    lst: string
}

const StakedBaby = (props: Props) => {

    const liquidity = useMemo(() => {
        if (!props.liquidity) return undefined;

        return formatDecimal(Number(props.liquidity.amount), -6);
    }, [props.liquidity]);

    return (
        <div className="flex flex-col items-center gap-1 bg-orange-700 text-orange-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {liquidity ?
                    <>
                        <div className="text-xl md:text-5xl font-bold">{formatNumber(liquidity)} BABy</div>
                        <div className="text-sm font-medium text-orange-300">{formatNumber(liquidity, false)} BABY</div>
                    </>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">Staked BABY</div>
        </div>
    );
}

export default StakedBaby;