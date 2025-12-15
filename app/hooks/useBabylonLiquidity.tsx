import { APP_CONFIG } from "@/configs/app";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { Liquidity } from "@/types/chain";
import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";

const useBabylonLiquidity = () => {
    const lst = BABYLON_CONTRACTS.lst;
    const { getCosmWasmClient } = useChain(
        CHAINS.babylon.chainName ?? ""
    );

    async function getLiquidity(): Promise<Liquidity> {
        const client = await getCosmWasmClient();

        const msg: { staking_liquidity: Record<string, unknown> } = {
            staking_liquidity: {}
        };

        const liquidity = await client?.queryContractSmart(
            lst,
            msg
        );

        return liquidity as Liquidity
    }

    const queryLiquidity = useQuery({
        queryKey: ['liquidityBabylon'],
        queryFn: () => getLiquidity(),
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        staleTime: APP_CONFIG.balanceRefetchInterval,
    });


    return {
        queryLiquidity,
    };
}

export default useBabylonLiquidity;