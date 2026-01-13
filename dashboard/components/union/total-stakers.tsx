"use client";

import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/config/app";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const UnionTotalStakers = () => {

    const getData = useCallback(async () => {
        const response = await fetch(`/api/union/stakers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const responseJson = await response.json();

        const parsed = Number(responseJson?.unique_stakers);
        return Number.isFinite(parsed) ? parsed : 0;
    }, []);

    const queryData = useQuery({
        queryKey: ["unionTotalStakers"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.indexerInterfal
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-emerald-900 text-emerald-50 rounded py-8">
            <div className="flex-1">
                {queryData.data !== undefined && queryData.data !== null ?
                    <div className="text-xl md:text-5xl font-bold">{queryData.data}</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80 flex items-center gap-2">
                <div>Total Stakers</div>
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger> <Icon type="FiInfo" /> </TooltipTrigger>
                        <TooltipContent>
                            <p>Total staker from union</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export default UnionTotalStakers;


