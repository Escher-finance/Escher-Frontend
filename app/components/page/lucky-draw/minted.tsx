import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateOnly } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const totalData = 8;

const Minted = () => {

    // Global tickets
    const getGlobalData = async () => {
        const response = await fetch(`/api/lucky-draw/global`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = (await response.json()) as { babylon: number, ethereum: number, total: number };
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        return result.total;
    }

    const queryGlobalData = useQuery({
        queryKey: ["luckydraw", "global"],
        queryFn: getGlobalData,
    });

    // Daily tickets
    const getDailyData = async () => {
        const response = await fetch(`/api/lucky-draw/daily`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = (await response.json()) as { ticket_date: string, total_tickets: number }[];
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return [...result.slice(0, totalData)]?.toReversed();
    }

    const queryDailyData = useQuery({
        queryKey: ["luckydraw", "daily"],
        queryFn: getDailyData,
    });

    const highestTickets = useMemo(() => {
        let res = 0;
        queryDailyData.data?.map(v => {
            if (Number(v.total_tickets) > res) {
                res = Number(v.total_tickets);
            }
        });
        return res;
    }, [queryDailyData.data]);

    const test = () => { }

    const dummyDate = useMemo(() => {
        const result = [];
        const today = new Date();

        for (let i = 1; i <= totalData; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);

            const dd = String(nextDate.getDate()).padStart(2, '0');
            const mm = String(nextDate.getMonth() + 1).padStart(2, '0');

            result.push(`${dd}/${mm}`);
        }

        return result;
    }, []);

    return (
        <Card className="text-sm dark:bg-escher-dark_0c203d min-h-[300px]">
            <div className="flex items-center justify-between bg-escher-F2F4F7 dark:bg-escher-darkblue rounded-lg px-4 py-2">
                <div
                    className="text-escher-667085 dark:text-white"
                    onClick={() => {
                        console.log({
                            queryDailyData,
                            queryGlobalData,
                            highestTickets
                        });
                        test();
                    }}
                >Total Tickets Minted</div>
                {queryGlobalData.isFetched ?
                    <div className="text-escher-black dark:text-white text-2xl leading-none font-semibold">{formatNumber((queryGlobalData.data ?? 0), false, 0)}</div>
                    :
                    <div className="mt-2">
                        <LdrsAnimation />
                    </div>
                }
            </div>
            {/* totalData */}
            <div className={`flex-1 grid [grid-template-columns:repeat(8,minmax(0,1fr))] items-end mt-4`}>
                {queryDailyData.data && queryDailyData.data.map(v =>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger
                                className="flex flex-col"
                                style={{
                                    height: `${v.total_tickets / highestTickets * 100}%`
                                }}
                            >
                                <div className="dark:text-white text-[10px] font-medium">{formatNumber((Number(v.total_tickets) + 0), true, 2).toLowerCase().replace(" ", "")}</div>
                                <div className="flex-1 flex-col px-1">
                                    <div className="h-full w-full bg-escher-electricblue dark:bg-white rounded-t" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                                className="p-2 leading-none bg-white rounded text-escher-black font-medium text-xs shadow"
                            >
                                {formatNumber(v.total_tickets, false)} tickets
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {queryDailyData.data && queryDailyData.data?.length < totalData &&
                    <>
                        {[...Array(totalData - queryDailyData.data?.length)].map((_, k) =>
                            <div
                                key={k}
                                className="bg-gray-200 rounded-t mx-1"
                                style={{
                                    height: `100%`
                                }}
                            />
                        )}
                    </>
                }
            </div>
            {/* totalData */}
            <div className={`grid [grid-template-columns:repeat(8,minmax(0,1fr))] text-center text-escher-667085 dark:text-white text-[10px] font-medium mt-1`}>
                {queryDailyData.data && queryDailyData.data.map(v =>
                    <div className="dark:text-gray-500">{formatDateOnly(v.ticket_date, "DD/MM")}</div>
                )}
                {queryDailyData.data && queryDailyData.data?.length < totalData &&
                    <>
                        {dummyDate.slice(0, (totalData - queryDailyData.data?.length)).map((v, k) =>
                            <div key={k}>{v}</div>
                        )}
                    </>
                }
            </div>
            <div className="self-center mt-2 text-escher-667085 dark:text-white text-xs font-semibold">Total Tickets Minted Daily</div>
        </Card>
    );
}

export default Minted;