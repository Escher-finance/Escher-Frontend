"use client";

import { useState } from "react";
import UnionBondsCount from "./_components/bonds-count";
import UnionBondsAmount from "./_components/bonds-amount";
import UnionBondsUsers from "./_components/bonds-user";

const UnionBonds = () => {
    const [type, setType] = useState<'count' | 'amount' | 'users'>('count');

    return (
        <div className="flex-1 self-stretch flex flex-col bg-slate-800 text-slate-50 rounded p-2 md:p-8 mt-8 leading-none">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0">
                    <div className="text-xl font-bold">Bonds</div>

                    {type === "count" &&
                        <div className="text-slate-400 text-sm">Number of bonds operations per day</div>
                    }
                    {type === "amount" &&
                        <div className="text-slate-400 text-sm">Daily bonds volume</div>
                    }
                    {type === "users" &&
                        <div className="text-slate-400 text-sm">Total bonds by user</div>
                    }
                </div>

                <div className="flex gap-4 bg-slate-700 px-2 py-1.5 rounded leading-none text-sm font-semibold">
                    <button
                        className={`hover:bg-sky-800 p-2 cursor-pointer rounded ${type === "count" ? "bg-sky-800" : ""}`}
                        onClick={() => setType("count")}
                    >Total Bonds</button>
                    <button
                        className={`hover:bg-sky-800 p-2 cursor-pointer rounded ${type === "amount" ? "bg-sky-800" : ""}`}
                        onClick={() => setType("amount")}
                    >Total Volume</button>
                    <button
                        className={`hover:bg-sky-800 p-2 cursor-pointer rounded ${type === "users" ? "bg-sky-800" : ""}`}
                        onClick={() => setType("users")}
                    >Users</button>
                </div>
            </div>

            {type === "count" && <UnionBondsCount />}
            {type === "amount" && <UnionBondsAmount />}
            {type === "users" && <UnionBondsUsers />}
        </div>
    );
}

export default UnionBonds;


