import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/config/app";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const TotalTickets = () => {

    const getData = async () => {
        const response = await fetch(`/api/lucky-draw/global`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        let result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Failed to fetch data');
        }

        if (result.length === 0) {
            return 0;
        }

        return result[0].total_tickets;
    }

    const queryData = useQuery({
        queryKey: ["luckydraw", "global"],
        queryFn: getData,
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-emerald-900 text-emerald-50 rounded py-8">
            <div className="flex-1">
                {queryData.data ?
                    <div className="text-xl md:text-5xl font-bold">{queryData.data}</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80 flex items-center gap-2">
                <div>Total Tickets</div>
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger> <Icon type="FiInfo" /> </TooltipTrigger>
                        <TooltipContent>
                            <p>Total tickets</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export default TotalTickets;