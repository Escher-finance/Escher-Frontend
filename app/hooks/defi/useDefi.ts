import { DefiOsmosisQuery, useOsmosisDefi } from "./osmosis/useOsmosisDefi";
import { DefiTowerQuery, useTowerDefi } from "./tower/useTowerDefi";
import { DefiUniswapQuery, useUniswapDefi } from "./uniswap/useUniswapDefi";

export interface EscherDefi {
    tower: DefiTowerQuery;
    uniswap: DefiUniswapQuery;
    osmosis: DefiOsmosisQuery;
}

const useDefi = (): EscherDefi => {
    const defiTower = useTowerDefi();
    const defiUniswap = useUniswapDefi();
    const defiOsmosis = useOsmosisDefi();

    return {
        tower: defiTower,
        uniswap: defiUniswap,
        osmosis: defiOsmosis
    }
}

export default useDefi;