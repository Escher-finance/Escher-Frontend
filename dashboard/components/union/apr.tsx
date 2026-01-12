"use client";

import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const UnionApr = () => {
    const getData = useCallback(async () => {
        const response = await fetch(`/api/union/apr`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const json = await response.json();
        return typeof json.apr === 'number' ? json.apr : undefined;
    }, []);

    const queryData = useQuery({
        queryKey: ["unionApr"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.aprInterfal,
        staleTime: APP_CONFIG.aprInterfal,
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-amber-900 text-amber-50 rounded py-8">
            <div className="flex-1">
                {queryData.data !== undefined ?
                    <div className="text-xl md:text-5xl font-bold">{`${formatNumber(queryData.data * 100)}%`}</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">APR</div>
        </div>
    );
}

export default UnionApr;


