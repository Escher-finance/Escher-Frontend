import { useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { Leaderboard, Point } from "@/types/points";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

export const usePoints = () => {
    const { account } = useEscher();
    const addresses = useMemo(() => {
        // DEBUG
        // return {
        //     evm: "0xff4a9aaac97c17c9e71a87678e5fff1e2262dfc1",
        //     cosmos: "bbn1z64amnsgslu3aqtqs8a37x0e7qt2tuc34f39ew",
        // }
        return {
            evm: account.evm?.address,
            cosmos: account.cosmos?.address.babylon,
        }
    }, [account]);

    const getPoints = useCallback(async (): Promise<Point[]> => {
        if (!addresses.cosmos && !addresses.evm) return [];

        const params = [
            addresses.cosmos ? `cosmos=${addresses.cosmos}` : null,
            addresses.evm ? `evm=${addresses.evm}` : null,
        ]
            .filter(Boolean)
            .join('&');

        const response = await fetch(`/api/points?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (!response.ok) {
            console.error(result.errors?.[0]?.message || 'Failed to fetch data');
            return [];
        }

        if (result.length === 0) {
            return [];
        }

        return result;
    }, [addresses]);

    const queryPoints = useQuery({
        queryKey: ['indexerPoints', addresses],
        queryFn: getPoints,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        staleTime: APP_CONFIG.transactionsRefetchInterval,
        enabled: !!addresses,
    });

    const [
        pointBabylon,
        pointUnion,
        pointDefiBabylon,
        pointDefiUnion,
        pointExtra,
        totalPoints
    ] = useMemo(() => {
        return [
            queryPoints.data?.filter(v => v.type === "hodl"),
            queryPoints.data?.filter(v => v.type === "hodl_union"),
            queryPoints.data?.filter(v => v.type === "defi"),
            queryPoints.data?.filter(v => v.type === "defi_union"),
            queryPoints.data?.filter(v => v.type === "extra"),
            queryPoints.data?.reduce((sum, cur) => sum += (cur.points ?? 0), 0) ?? 0
        ];
    }, [queryPoints.data]);

    return {
        queryPoints,
        pointBabylon,
        pointUnion,
        pointDefiBabylon,
        pointDefiUnion,
        pointExtra,
        totalPoints
    }
}

interface LeaderboardProps {
    address?: string
    type?: string
}

export const useLeaderboard = (props: LeaderboardProps) => {
    const [debouncedAddress, setDebouncedAddress] = useState(props.address);

    useEffect(() => console.log(props), [props]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedAddress(props.address);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [props.address]);

    async function getData(): Promise<Leaderboard[]> {
        console.log("type", props.type);

        const url = (debouncedAddress && debouncedAddress !== "")
            ? `/api/leaderboard?type=${props.type ?? "all"}&address=${encodeURIComponent(debouncedAddress.toLowerCase())}`
            : `/api/leaderboard?type=${props.type ?? "all"}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (!response.ok) {
            console.error(result.errors?.[0]?.message || 'Failed to fetch data');
            return [];
        }

        if (result.length === 0) {
            return [];
        }

        return result;
    }

    return useQuery({
        queryKey: ['indexerLeaderboard', debouncedAddress ?? 'all', props.type],
        queryFn: getData,
        enabled: debouncedAddress !== undefined || props.address === undefined,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        staleTime: APP_CONFIG.transactionsRefetchInterval,
    });
}