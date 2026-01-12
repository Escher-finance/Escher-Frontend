import { useState } from "react";
import UnbondsCount from "./_components/unbonds-count";
import UnbondsAmount from "./_components/unbonds-amount";

interface Props {
    weight?: number
}

const Unbonds = (props: Props) => {
    const [type, setType] = useState<'count' | 'amount'>('count');

    return (
        <div className="flex-1 self-stretch flex flex-col bg-slate-800 text-slate-50 rounded p-2 md:p-8 mt-8 leading-none">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0">
                    <div className="text-xl font-bold">Unbonds</div>
                    {type === "count" &&
                        <div className="text-slate-400 text-sm">Number of unbonds operations per day</div>
                    }
                    {type === "amount" &&
                        <div className="text-slate-400 text-sm">Daily unbonds volume</div>
                    }
                </div>

                <div className="flex gap-4 bg-slate-700 px-2 py-1.5 rounded leading-none text-sm font-semibold">
                    <button
                        className={`hover:bg-amber-800 p-2 cursor-pointer rounded ${type === "count" ? "bg-amber-800" : ""}`}
                        onClick={() => setType("count")}
                    >Total Unbonds</button>
                    <button
                        className={`hover:bg-amber-800 p-2 cursor-pointer rounded ${type === "amount" ? "bg-amber-800" : ""}`}
                        onClick={() => setType("amount")}
                    >Total Volume</button>
                </div>
            </div>

            {type === "count" &&
                <UnbondsCount />
            }

            {type === "amount" &&
                <UnbondsAmount />
            }
        </div>
    );
}

export default Unbonds;