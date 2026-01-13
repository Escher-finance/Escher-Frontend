"use client";

import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const UnionTvl = () => {
    const getData = useCallback(async () => {
        const res = await fetch(`/api/union/tvl`, { headers: { 'Content-Type': 'application/json' } });
        const json = await res.json();
        return json as { tvlToken?: number; tvlUsd?: number | null };
    }, []);

    const queryData = useQuery({
        queryKey: ["unionTvl"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.refetchInterfal
    });

    const tvlToken = queryData.data?.tvlToken;
    const tvlUsd = queryData.data?.tvlUsd ?? undefined;

    return (
        <div className="flex flex-col items-center gap-1 bg-violet-900 text-violet-50 rounded py-8">
            <div className="flex-1">
                {tvlToken !== undefined ? (
                    <div className="text-xl md:text-5xl font-bold">{tvlUsd !== undefined ? `$${formatNumber(tvlUsd)}` : formatNumber(tvlToken)}</div>
                ) : (
                    <LdrsAnimation />
                )}
            </div>
            <div className="text-sm font-medium opacity-80">TVL</div>
        </div>
    );
}

export default UnionTvl;


