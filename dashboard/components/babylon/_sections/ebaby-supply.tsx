import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Liquidity } from "@/types/types";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useMemo } from "react";

interface Props {
    liquidity?: Liquidity
    lst: string
}

const EBabySupply = (props: Props) => {

    const liquidity = useMemo(() => {
        if (!props.liquidity) return undefined;

        return formatDecimal(Number(props.liquidity.total_supply), -6);
    }, [props.liquidity]);

    return (
        <div className="flex flex-col items-center gap-1 bg-sky-900 text-sky-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {liquidity ?
                    <>
                        <div className="text-xl md:text-5xl font-bold">{formatNumber(liquidity)} eBABY</div>
                        <div className="text-sm font-medium text-sky-300">{formatNumber(liquidity, false)} eBABY</div>
                    </>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">eBABY total supply</div>
        </div>
    );
}

export default EBabySupply;