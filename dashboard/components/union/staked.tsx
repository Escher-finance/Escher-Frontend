"use client";

import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const UnionStaked = () => {
    const getData = useCallback(async () => {
        const res = await fetch(`/api/union/staked`, { headers: { 'Content-Type': 'application/json' } });
        const json = await res.json();
        return typeof json.stakedToken === 'number' ? json.stakedToken : undefined;
    }, []);

    const queryData = useQuery({
        queryKey: ["unionStaked"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.refetchInterfal
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-orange-700 text-orange-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {queryData.data !== undefined ? (
                    <>
                        <div className="text-xl md:text-5xl font-bold">{formatNumber(queryData.data)} U</div>
                    </>
                ) : (
                    <LdrsAnimation />
                )}
            </div>
            <div className="text-sm font-medium opacity-80">Staked U</div>
        </div>
    );
}

export default UnionStaked;


