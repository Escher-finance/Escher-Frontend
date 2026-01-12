import LdrsAnimation from "@/components/global/ldrsAnimation";
import { LiquidStaking, Validator } from "@/types/types";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useMemo } from "react";

interface Props {
    lst: LiquidStaking
    validator?: Validator
}

const Delegated = (props: Props) => {
    const [decimals, symbol] = props.lst === "babylon" ?
        [6, "BABY"] :
        [18, "U"];

    const balance = useMemo(() => {
        const raw = props.validator?.balance;
        if (!raw) return BigInt(0);

        return BigInt(raw.split('.')[0]);
    }, [props.validator]);

    return (
        <div className="flex flex-col items-center gap-1 bg-amber-900 text-amber-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {props.validator ?
                    <>
                        <div className="text-3xl md:text-4xl font-bold">{formatNumber(formatDecimal(Number(balance), -decimals))} {symbol}</div>
                        <div className="text-sm font-medium text-amber-600">{formatNumber(formatDecimal(Number(balance), -decimals), false)} {symbol}</div>
                    </>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">Total delegated {symbol}</div>
        </div>
    );
}

export default Delegated;