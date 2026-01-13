import LdrsAnimation from "@/components/global/ldrsAnimation";
import { LiquidStaking, Validator } from "@/types/types";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useMemo } from "react";

interface Props {
    lst: LiquidStaking
    validators?: Validator[]
}

const Validators = (props: Props) => {

    const [symbol, decimals] = useMemo(() => {
        return [
            props.lst === "babylon" ? "BABY" : "U",
            props.lst === "babylon" ? 6 : 18,
        ]
    }, [props.lst]);

    return (
        <div className="w-full flex flex-col bg-slate-800 text-slate-50 rounded px-8 py-7 mt-8 self-start leading-none">
            <div className="text-xl font-bold">Validators</div>

            <div className="w-full mt-6 overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="p-2 text-start">No</th>
                            <th className="p-2 text-start">Name</th>
                            <th className="p-2 text-start">Address</th>
                            <th className="p-2 text-start">Weight</th>
                            <th className="p-2 text-start">Commission</th>
                            <th className="p-2 text-start">Escher Fee</th>
                            <th className="p-2 text-start">Delegated {symbol}</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        {props.validators?.map((v, k) =>
                            <tr className="border-t border-slate-700" key={k}>
                                <td className="p-3">{k + 1}</td>
                                <td className="p-3">{v.data?.description?.moniker}</td>
                                <td className="p-3">{v.address}</td>
                                <td className="p-3">{v.weight}</td>
                                <td className="p-3">{v.commission * 100}%</td>
                                <td className="p-3">{(v.fee ?? 0) * 100}%</td>
                                <td className="p-3">{formatNumber(formatDecimal(Number(v.balance), -decimals))}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {!props.validators &&
                    <div className="flex items-center justify-center mt-4">
                        <LdrsAnimation />
                    </div >
                }
            </div >
        </div >
    );
}

export default Validators;