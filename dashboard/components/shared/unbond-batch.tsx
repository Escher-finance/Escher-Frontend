import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { DbBatch, LiquidStaking, Validator } from "@/types/types";
import { formatDate, formatNumber, hoursAgo } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useCallback } from "react";

interface Props {
    lst: LiquidStaking
    className?: string
}

const UnbondBatch = (props: Props) => {
    const [baseApi, decimals, symbol, period] = props.lst === "babylon" ?
        ["/api", 6, "BABY", 54] :
        ["/api/union", 18, "U", 24 * 27];

    const getData = useCallback(async () => {
        const response = await fetch(`${baseApi}/unbond-batch`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const responseJson = await response.json();

        return responseJson as DbBatch[];
    }, []);

    const queryData = useQuery({
        queryKey: ["unbondBatch", props.lst],
        queryFn: getData,
        refetchInterval: APP_CONFIG.indexerInterfal
    });


    return (
        <div className={clsx(
            "flex flex-col bg-sky-100 text-slate-900 rounded p-8 mt-8 self-auto md:self-start leading-none",
            props.className
        )}>
            <div className="text-xl font-bold">Unreleased unbond batch</div>
            {queryData.data ?
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-2 mt-4 items-center text-sm">
                    <div className="font-semibold text-center">ID</div>
                    <div className="font-semibold">Submitted At</div>
                    <div className="font-semibold">Amount</div>
                    <div className="font-semibold">Age</div>

                    {queryData.data.map((v, k) => {
                        const age = hoursAgo(v.submitted);
                        const color = () => {
                            if (age >= period + 2) {
                                return {
                                    bg: clsx("bg-rose-700"),
                                    text: clsx("text-rose-100")
                                }
                            }

                            if (age >= period + 1) {
                                return {
                                    bg: clsx("bg-yellow-700"),
                                    text: clsx("text-yellow-100")
                                }
                            }

                            return {
                                bg: clsx("bg-sky-700"),
                                text: clsx("text-sky-100")
                            }
                        }
                        return (
                            <>
                                <div key={k} className={`${color().bg} ${color().text} text-sm font-bold text-center p-1`}>{v.id}</div>
                                <div>{v.submitted ? formatDate(v.submitted) : "-"}</div>
                                <div>{formatNumber(Number(v.undelegate_amount) / 10 ** decimals)} <span className="font-semibold text-gray-500 text-xs">{symbol}</span></div>
                                {v.submitted ?
                                    <div>
                                        <div>{`${age} hours`}</div>
                                        {age > 24 &&
                                            <div className="font-medium text-gray-400 text-xs">{`${(age / 24).toFixed(0)} days`}</div>
                                        }
                                    </div>
                                    :
                                    <div>-</div>
                                }
                            </>
                        );
                    }
                    )}
                </div>
                :
                <div className="mt-4 text-center">
                    <LdrsAnimation color="#0284c7" />
                </div>
            }
        </div>
    );
}

export default UnbondBatch;