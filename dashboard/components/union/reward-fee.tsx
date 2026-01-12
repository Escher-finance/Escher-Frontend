import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const UnionRewardFee = () => {

    const getData = useCallback(async () => {
        const response = await fetch(`/api/union/reward`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const responseJson = (await response.json() as { profit: string });
        return responseJson.profit;
    }, []);

    const queryData = useQuery({
        queryKey: ["rewardFee"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.indexerInterfal
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-fuchsia-900 text-fuchsia-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {queryData.data ?
                    <>
                        <div className="text-xl md:text-5xl font-bold">{formatNumber(formatDecimal(Number(queryData.data), -18))} U</div>
                        <div className="text-sm font-medium text-fuchsia-300">{formatNumber(formatDecimal(Number(queryData.data), -18), false, 2, "T")} U</div>
                    </>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">Fee collected</div>
        </div>
    );
}

export default UnionRewardFee;