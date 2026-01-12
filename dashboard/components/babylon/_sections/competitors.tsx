import { Competitor, Validator } from "@/types/types";
import { formatDecimal, formatNumber } from "@/utils/utils";
import clsx from "clsx";

interface Props {
    competitors: Competitor[]
    className?: string
}

const Competitors = (props: Props) => {
    return (
        <div className={clsx(
            "w-full flex flex-col bg-slate-800 text-slate-50 rounded px-8 py-7 mt-8 self-start leading-none overflow-scroll",
            props.className
        )}>
            <div className="text-xl font-bold">Competitors</div>

            <div className="w-full mt-6 overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="p-2 text-start">No</th>
                            <th className="p-2 text-start">Competitor</th>
                            <th className="p-2 text-start">Total supply</th>
                            <th className="p-2 text-start">Contract address</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        {props.competitors?.map((v, k) =>
                            <tr key={k} className="border-t border-slate-700">
                                <td className="p-3">{k + 1}</td>
                                <td className="p-3 flex items-center gap-4">
                                    <img src={v.logo} className="w-8 h-8 rounded-full" />
                                    <div>{v.name}</div>
                                </td>
                                <td className="p-3">{v.totalSupply ? `${formatNumber(formatDecimal(v.totalSupply, -6))} ${v.symbol}` : "-"}</td>
                                <td className="p-3">{v.address}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div >
        </div >
    );
}

export default Competitors;