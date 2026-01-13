import { APP_CONFIG } from "@/config/app";
import { Liquidity } from "@/types/types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

interface Props {
    client?: CosmWasmClient
    lst: string
}

const useLiquidity = (props: Props) => {
    const getData = useCallback(async () => {
        const liquidity = await props.client?.queryContractSmart(
            props.lst,
            {
                staking_liquidity: {}
            }
        ) as Liquidity;

        return liquidity;
    }, [props.client]);


    return useQuery({
        queryKey: ["liquidity"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.refetchInterfal,
        enabled: !!props.client,
        refetchOnWindowFocus: false
    });
}

export default useLiquidity;